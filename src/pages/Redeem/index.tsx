import React, { useCallback, useContext, useState, useMemo } from 'react'
import { Plus } from 'react-feather'
import { RouteComponentProps } from 'react-router'
import { TokenAmount } from '@uniswap/sdk'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { TransactionResponse } from '@ethersproject/providers'
import { ButtonError, /* ButtonOutlined,*/ ButtonPrimary } from '../../components/Button'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import RedeemTokenPanel from '../../components/MarketStrategy/RedeemTokenPanel'
import { MarketStrategyTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useIsExpertMode } from '../../state/user/hooks'
import AppBody from '../AppBody'
import { ConfirmRedeemModalBottom } from './ConfirmRedeemModalBottom'
import { GenerateBar } from '../../components/MarketStrategy/GenerateBar'
import { absolute, useDerivedStrategyInfo, useOption } from '../../state/market/hooks'
import { tryParseAmount } from '../../state/swap/hooks'
import { useAntimatterContract } from '../../hooks/useContract'
import { calculateGasMargin } from '../../utils'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { isNegative, parseBalance, parsedGreaterThan } from '../../utils/marketStrategyUtils'
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback'
import { Dots } from 'components/swap/styleds'
import { ANTIMATTER_ADDRESS } from '../../constants'
import { OptionField } from '../Swap'
import { useTokenBalance } from '../../state/wallet/hooks'
import { LabeledCard } from '../../components/Card'
import CurrencyLogo from '../../components/CurrencyLogo'
import { TYPE } from '../../theme'
import { isMobile } from 'react-device-detect'
import useMediaWidth from 'hooks/useMediaWidth'

export const Wrapper = styled.div`
  position: relative;
  padding: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 1rem 0;
  `}
`

const RowWrapper = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  gap: 20px;
  & >div:first-child{
    margin-right: 0
  };
  &>div{
    width: 100%
  }
`}
`

export default function Redeem({
  match: {
    params: { optionTypeIndex }
  }
}: RouteComponentProps<{ optionTypeIndex?: string }>) {
  const option = useOption(optionTypeIndex)
  const isUpToSmall = useMediaWidth('upToSmall')

  const [callTypedAmount, setCallTypedAmount] = useState<string>('')
  // const [putTypedAmount, setPutTypedAmount] = useState<string>('')
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>('')

  const antimatterContract = useAntimatterContract()
  const { account, chainId, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const addTransaction = useTransactionAdder()

  const userCallBalance = useTokenBalance(account ?? undefined, option?.call?.token)
  const userPutBalance = useTokenBalance(account ?? undefined, option?.put?.token)
  const userUndBalance = useTokenBalance(account ?? undefined, option?.underlying ?? undefined)
  const userCurBalance = useTokenBalance(account ?? undefined, option?.currency ?? undefined)

  const { delta } = useDerivedStrategyInfo(
    option,
    '-' + callTypedAmount ?? undefined,
    '-' + callTypedAmount ?? undefined
  )
  const redeemError = useMemo(() => {
    if (
      userCallBalance &&
      userPutBalance &&
      (parsedGreaterThan(callTypedAmount, userCallBalance.raw.toString()) ||
        parsedGreaterThan(callTypedAmount, userPutBalance.raw.toString()))
    ) {
      return 'Insufficient Balance'
    }

    if (delta?.dUnd && !isNegative(delta.dUnd.toString()) && option?.underlying) {
      const undAmount = new TokenAmount(option.underlying, absolute(delta.dUnd.toString()))
      if (userUndBalance?.lessThan(undAmount)) return 'Insufficient ' + option.underlying?.symbol + ' balance'
    }
    if (delta?.dCur && !isNegative(delta.dCur.toString()) && option?.currency) {
      const curAmount = new TokenAmount(option.currency, absolute(delta.dCur.toString()))
      if (userCurBalance?.lessThan(curAmount)) return 'Insufficient ' + option.currency?.symbol + ' balance'
    }
    return ''
  }, [callTypedAmount, delta, option, userCallBalance, userCurBalance, userPutBalance, userUndBalance])

  // txn values
  // const deadline = useTransactionDeadline() // custom from users settings
  // const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    tryParseAmount(delta?.dUnd.toString(), option?.underlying ?? undefined),
    chainId ? ANTIMATTER_ADDRESS : undefined
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    tryParseAmount(delta?.dCur.toString(), option?.currency ?? undefined),
    chainId ? ANTIMATTER_ADDRESS : undefined
  )
  const approval1 = isNegative(delta?.dUnd.toString()) ? ApprovalState.APPROVED : approvalA
  const approval2 = isNegative(delta?.dCur.toString()) ? ApprovalState.APPROVED : approvalB

  const parsedAmounts = {
    [OptionField.CALL]: tryParseAmount(callTypedAmount, option?.call?.token),
    [OptionField.PUT]: tryParseAmount(callTypedAmount, option?.put?.token)
  }

  const optionName = useMemo(() => {
    if (!option || !option?.currency || !option?.priceFloor || !option?.priceCap) return '--'
    return `${option?.underlying?.symbol} ($${new TokenAmount(
      option?.currency,
      option?.priceFloor
    ).toSignificant()}~$${new TokenAmount(option?.currency, option?.priceCap).toSignificant()})`
  }, [option])

  async function onRedeem() {
    if (!chainId || !library || !account || !callTypedAmount || !delta) return

    const estimate = antimatterContract?.estimateGas.swap

    const method: (...args: any) => Promise<TransactionResponse> = antimatterContract?.swap

    const args = [
      option?.underlying?.address,
      option?.currency?.address,
      option?.priceFloor,
      option?.priceCap,
      '-' + parsedAmounts[OptionField.CALL]?.raw.toString(),
      '-' + parsedAmounts[OptionField.PUT]?.raw.toString(),
      delta.dUnd.toString(),
      delta.dCur.toString(),
      '0x'
    ]

    const value: string | undefined | null = null

    setAttemptingTxn(true)

    if (estimate) {
      await estimate(...args, value ? { value } : {})
        .then(estimatedGasLimit =>
          method(...args, {
            ...(value ? { value } : {}),
            gasLimit: calculateGasMargin(estimatedGasLimit)
          }).then(response => {
            setAttemptingTxn(false)
            addTransaction(response, {
              summary: 'redeem'
            })

            setTxHash(response.hash)
            setCallTypedAmount('')
            // setPutTypedAmount('')
          })
        )
        .catch(error => {
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          if (error?.code !== 4001) {
            console.error('---->', error)
          }
        })
    }
  }

  const modalHeader = () => {
    return (
      <>
        {isNegative(delta?.dCur) && isNegative(delta?.dUnd) && (
          <AutoColumn gap="20px">
            <AutoRow justify="center" style={{ marginTop: '20px' }}>
              <Text fontSize="14px" fontWeight={400} />
            </AutoRow>
          </AutoColumn>
        )}
      </>
    )
  }

  const modalBottom = () => {
    return (
      <>
        {option?.underlying && option.currency ? (
          <ConfirmRedeemModalBottom
            delta={delta}
            callTyped={callTypedAmount}
            putTyped={callTypedAmount}
            currencyA={option?.underlying}
            currencyB={option?.currency}
            onRedeem={onRedeem}
          />
        ) : null}
      </>
    )
  }

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      // onFieldAInput('')
    }
    setTxHash('')
  }, [txHash])

  return (
    <AppBody
      maxWidth="560px"
      style={{ marginTop: isMobile ? 40 : 100, mmarginBottom: 0, paddingBottom: isUpToSmall ? 30 : 0 }}
    >
      <MarketStrategyTabs generation={false} />
      <TYPE.darkGray fontSize={14} style={{ padding: isUpToSmall ? '10px 24px' : '4px 16px 30px' }}>
        In this section you can remove both bull and bear tokens at the same time.
      </TYPE.darkGray>
      <Wrapper>
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          hash={txHash}
          content={() => (
            <ConfirmationModalContent
              title="Redemption confirmation"
              onDismiss={handleDismissConfirmation}
              topContent={modalHeader}
              bottomContent={modalBottom}
            />
          )}
          pendingText="Confirm"
        />

        <AutoColumn gap="24px">
          <RowWrapper>
            <LabeledCard
              label="Option ID"
              content={optionTypeIndex ?? ''}
              style={{ marginRight: isUpToSmall ? 0 : 15 }}
            />
            <LabeledCard
              label="Option Type"
              content={
                <RowFixed>
                  <CurrencyLogo currency={option?.underlying ?? undefined} size="17px" style={{ marginRight: 12 }} />
                  {optionName}
                </RowFixed>
              }
            />
          </RowWrapper>
          <RedeemTokenPanel
            value={callTypedAmount ?? ''}
            onUserInput={setCallTypedAmount}
            label={'Bull token'}
            currency={option?.call?.token}
            currencyBalance={userCallBalance?.toExact().toString()}
            isCall={true}
          />
          <ColumnCenter>
            <Plus size="28" color={theme.text2} />
          </ColumnCenter>
          <RedeemTokenPanel
            value={callTypedAmount ?? ''}
            onUserInput={setCallTypedAmount}
            label={'Bear token'}
            currency={option?.put?.token}
            negativeMarginTop="-25px"
            currencyBalance={userPutBalance?.toExact().toString()}
            isCall={false}
          />
          {option?.underlying && option?.currency && delta?.dUnd && delta.dCur && (
            <GenerateBar
              cardTitle={`You will receive`}
              currency0={option.underlying}
              currency1={option.currency}
              subTitle="Output Token"
              callVol={delta && parseBalance({ val: delta.dUnd, token: option.underlying })}
              putVol={delta && parseBalance({ val: delta.dCur, token: option.currency })}
            />
          )}

          {!account ? (
            <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
          ) : (
            <AutoColumn gap={'md'}>
              {(approval1 === ApprovalState.NOT_APPROVED ||
                approval1 === ApprovalState.PENDING ||
                approval2 === ApprovalState.NOT_APPROVED ||
                approval2 === ApprovalState.PENDING) && (
                <RowBetween>
                  {approval1 !== ApprovalState.APPROVED && (
                    <ButtonPrimary
                      onClick={approveACallback}
                      disabled={approval1 === ApprovalState.PENDING}
                      width={approval2 !== ApprovalState.APPROVED ? '48%' : '100%'}
                    >
                      {approval1 === ApprovalState.PENDING ? (
                        <Dots>Approving {option?.underlying?.symbol}</Dots>
                      ) : (
                        'Approve ' + option?.underlying?.symbol
                      )}
                    </ButtonPrimary>
                  )}
                  {approval2 !== ApprovalState.APPROVED && (
                    <ButtonPrimary
                      onClick={approveBCallback}
                      disabled={approval2 === ApprovalState.PENDING}
                      width={approval1 !== ApprovalState.APPROVED ? '48%' : '100%'}
                    >
                      {approval2 === ApprovalState.PENDING ? (
                        <Dots>Approving {option?.currency?.symbol}</Dots>
                      ) : (
                        'Approve ' + option?.currency?.symbol
                      )}
                    </ButtonPrimary>
                  )}
                </RowBetween>
              )}
              {/* {redeemError && <ButtonOutlined style={{ opacity: '0.5' }}>{redeemError}</ButtonOutlined>} */}
              {/* {!redeemError && ( */}
              <ButtonError
                onClick={() => {
                  expertMode ? onRedeem() : setShowConfirm(true)
                }}
                disabled={
                  !callTypedAmount ||
                  // !putTypedAmount ||
                  !delta ||
                  !!redeemError ||
                  approval1 !== ApprovalState.APPROVED ||
                  approval2 !== ApprovalState.APPROVED
                }
                error={!!redeemError}
              >
                <Text fontSize={16} fontWeight={500}>
                  {redeemError ? redeemError : 'Redeem'}
                </Text>
              </ButtonError>
              {/* )} */}
            </AutoColumn>
          )}
        </AutoColumn>
      </Wrapper>
    </AppBody>
  )
}
