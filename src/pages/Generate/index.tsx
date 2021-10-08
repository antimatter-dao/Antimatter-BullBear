import React, { useCallback, useContext, useMemo, useState } from 'react'
import { TokenAmount } from '@uniswap/sdk'
import { Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { ButtonError, ButtonOutlined, ButtonPrimary } from '../../components/Button'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CallOrPutInputPanel from '../../components/CallOrPutInputPanel'
import { MarketStrategyTabs } from '../../components/NavigationTabs'
import { RowBetween, RowFixed } from '../../components/Row'
import { useDerivedStrategyInfo, useOption } from '../../state/market/hooks'
import { ANTIMATTER_ADDRESS, Symbol } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useWalletModalToggle } from '../../state/application/hooks'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { useIsExpertMode } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { calculateGasMargin } from '../../utils'
import AppBody from '../AppBody'
import { Dots, Wrapper } from '../Pool/styleds'
import { ConfirmGenerationModalBottom } from './ConfirmAddModalBottom'
import { tryParseAmount } from '../../state/swap/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { useAntimatterContract } from '../../hooks/useContract'
import { GenerateBar } from '../../components/MarketStrategy/GenerateBar'
import { isNegative, parseBalance } from '../../utils/marketStrategyUtils'
import { OptionField } from '../Swap'
import { useTokenBalance } from 'state/wallet/hooks'
import { LabeledCard } from 'components/Card'
import CurrencyLogo from 'components/CurrencyLogo'
import useMediaWidth from 'hooks/useMediaWidth'
import { isMobile } from 'react-device-detect'

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

export default function Generate({
  match: {
    params: { optionTypeIndex }
  }
}: RouteComponentProps<{ optionTypeIndex?: string }>) {
  const option = useOption(optionTypeIndex)
  // const [optionType, setOptionType] = useState('')
  const [callTyped, setCallTyped] = useState<string>()
  // const [putTyped, setPutTyped] = useState<string>()

  const theme = useContext(ThemeContext)
  const isUpToSmall = useMediaWidth('upToSmall')

  const { account, chainId, library } = useActiveWeb3React()

  const antimatterContract = useAntimatterContract()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()

  const { delta } = useDerivedStrategyInfo(option, callTyped ?? undefined, callTyped ?? undefined)

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // // txn values
  // const deadline = useTransactionDeadline() // custom from users settings
  const [txHash, setTxHash] = useState<string>('')

  const parsedAmounts = {
    [OptionField.CALL]: tryParseAmount(callTyped, option?.call?.token),
    [OptionField.PUT]: tryParseAmount(callTyped, option?.put?.token)
  }

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    tryParseAmount(delta?.dUnd.toString(), option?.underlying ?? undefined),
    chainId ? ANTIMATTER_ADDRESS : undefined
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    tryParseAmount(delta?.dCur.toString(), option?.currency ?? undefined),
    chainId ? ANTIMATTER_ADDRESS : undefined
  )

  const balanceA = useTokenBalance(account ?? undefined, option?.call?.token)
  const balanceB = useTokenBalance(account ?? undefined, option?.put?.token)

  const error = useMemo(() => {
    if (balanceA && balanceB && delta && option?.callToken && option?.putToken) {
      const callAmount = delta.dUnd.toString()[0] === '-' ? undefined : new TokenAmount(option.callToken, delta.dUnd)
      const putAmount = delta.dCur.toString()[0] === '-' ? undefined : new TokenAmount(option.putToken, delta.dCur)
      if (callAmount && putAmount && balanceA.lessThan(callAmount) && balanceB.lessThan(putAmount)) {
        return `Insufficient ${option.underlying?.symbol} and ${option.currency?.symbol} balance`
      }
      if (callAmount && balanceA.lessThan(callAmount)) {
        return 'Insufficient ' + option.underlying?.symbol + ' balance'
      }
      if (putAmount && balanceB.lessThan(putAmount)) {
        return 'Insufficient ' + option.currency?.symbol + ' balance'
      }
    }
    return null
    /* eslint-disable react-hooks/exhaustive-deps*/
  }, [
    balanceA,
    balanceB,
    delta,
    option?.callToken,
    option?.currency?.symbol,
    option?.putToken,
    option?.underlying?.symbol
  ])
  /* eslint-disable react-hooks/exhaustive-deps*/

  const addTransaction = useTransactionAdder()

  async function onGenerate() {
    if (!chainId || !library || !account) return
    if (!delta) {
      return
    }

    const estimate = antimatterContract?.estimateGas.swap
    const method: (...args: any) => Promise<TransactionResponse> = antimatterContract?.swap
    let value: string | undefined | null = null

    const args = [
      option?.underlying?.address,
      option?.currency?.address,
      option?.priceFloor,
      option?.priceCap,
      parsedAmounts[OptionField.CALL]?.raw.toString(),
      parsedAmounts[OptionField.PUT]?.raw.toString(),
      delta.dUnd.toString(),
      delta.dCur.toString(),
      '0x'
    ]
    if (option?.underlying?.symbol?.toUpperCase() === Symbol[chainId ?? 1]) {
      value = isNegative(delta.dUnd) ? '0' : delta.dUnd.toString()
    }

    if (option?.currency?.symbol?.toUpperCase() === Symbol[chainId ?? 1]) {
      value = isNegative(delta.dCur) ? '0' : delta.dCur.toString()
    }

    setAttemptingTxn(true)
    if (estimate) {
      await estimate(...args, value ? { value } : {})
        .then(estimatedGasLimit =>
          method(...args, {
            ...(value ? { value } : {}),
            gasLimit: calculateGasMargin(estimatedGasLimit)
          }).then(response => {
            // setPutTyped(undefined)
            setCallTyped(undefined)
            setAttemptingTxn(false)
            addTransaction(response, {
              summary: 'generated '
            })

            setTxHash(response.hash)

            ReactGA.event({
              category: 'Generate',
              action: 'generate',
              label: ''
            })
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

  const modalHeader = useCallback(() => {
    return <AutoColumn gap="20px" />
  }, [])

  const modalBottom = () => {
    return (
      <>
        {option?.underlying && option.currency ? (
          <ConfirmGenerationModalBottom
            delta={delta}
            callTyped={callTyped}
            putTyped={callTyped}
            currencyA={option?.underlying}
            currencyB={option?.currency}
            onGenerate={onGenerate}
            underlyingToken={option?.underlying}
            currencyToken={option?.currency}
          />
        ) : null}
      </>
    )
  }

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      //onFieldAInput('')
    }
    setTxHash('')
  }, [txHash])

  const optionName = useMemo(() => {
    if (!option || !option?.currency || !option?.priceFloor || !option?.priceCap) return '--'
    return `${option?.underlying?.symbol} ($${new TokenAmount(
      option?.currency,
      option?.priceFloor
    ).toSignificant()}~$${new TokenAmount(option?.currency, option?.priceCap).toSignificant()})`
  }, [option])

  return (
    <>
      <AppBody
        maxWidth="560px"
        style={{ marginTop: isMobile ? 20 : 100, marginBottom: 0, paddingBottom: isUpToSmall ? 30 : 0 }}
      >
        <MarketStrategyTabs generation />
        <TYPE.darkGray fontSize={14} style={{ padding: isUpToSmall ? '10px 24px' : '4px 16px 30px' }}>
          In this section you can generate both bull and bear tokens at the same time. You need to generate equal amount
          of bull and bear tokens.
        </TYPE.darkGray>
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={() => (
              <ConfirmationModalContent
                title={'Confirmation'}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText="Generating"
          />
          <AutoColumn gap="20px">
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

            <CallOrPutInputPanel
              value={callTyped ?? ''}
              onUserInput={setCallTyped}
              currency={option?.call?.token || undefined}
              id="generate-output-token"
              showCommonBases
              defaultSymbol={option?.call?.token.symbol}
              halfWidth={true}
              isCall={true}
              underlying={option?.underlying}
            />
            <ColumnCenter>
              <Plus size="28" color={theme.text2} />
            </ColumnCenter>
            <CallOrPutInputPanel
              value={callTyped ?? ''}
              onUserInput={setCallTyped}
              currency={option?.put?.token || undefined}
              id="generate-output-token"
              showCommonBases
              halfWidth={true}
              defaultSymbol={option?.put?.token.symbol}
              negativeMarginTop={'-20px'}
              isCall={false}
              underlying={option?.underlying}
            />
            {option?.call?.token && option?.put?.token && delta?.dUnd && delta.dCur && (
              <GenerateBar
                cardTitle={``}
                callVol={
                  delta &&
                  parseBalance({
                    val: delta.dUnd,
                    token: option?.call?.token
                  })
                }
                putVol={
                  delta &&
                  parseBalance({
                    val: delta.dCur,
                    token: option?.put?.token
                  })
                }
                subTitle="Output Token"
                currency0={option?.underlying ?? undefined}
                currency1={option?.currency ?? undefined}
              />
            )}
            {/* <TYPE.body color={theme.red1}>{error}</TYPE.body> */}
            {!option || !delta ? (
              <ButtonOutlined style={{ opacity: '0.5' }} disabled={true}>
                <TYPE.main>Enter Amount</TYPE.main>
              </ButtonOutlined>
            ) : !account ? (
              <ButtonPrimary onClick={toggleWalletModal} borderRadius="49px">
                Connect Wallet
              </ButtonPrimary>
            ) : (
              <AutoColumn gap={'md'}>
                {!error &&
                  (approvalA === ApprovalState.NOT_APPROVED ||
                    approvalA === ApprovalState.PENDING ||
                    approvalB === ApprovalState.NOT_APPROVED ||
                    approvalB === ApprovalState.PENDING) && (
                    <RowBetween>
                      {approvalA !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={approveACallback}
                          disabled={approvalA === ApprovalState.PENDING}
                          width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalA === ApprovalState.PENDING ? (
                            <Dots>Approving {option?.underlying?.symbol}</Dots>
                          ) : (
                            'Approve ' + option?.underlying?.symbol
                          )}
                        </ButtonPrimary>
                      )}
                      {approvalB !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={approveBCallback}
                          disabled={approvalB === ApprovalState.PENDING}
                          width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalB === ApprovalState.PENDING ? (
                            <Dots>Approving {option?.currency?.symbol}</Dots>
                          ) : (
                            'Approve ' + option?.currency?.symbol
                          )}
                        </ButtonPrimary>
                      )}
                    </RowBetween>
                  )}
                <ButtonError
                  onClick={() => {
                    expertMode ? onGenerate() : setShowConfirm(true)
                  }}
                  disabled={approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED || !!error}
                  error={!callTyped || !!error /*&& !putTyped*/}
                >
                  <Text fontSize={16} fontWeight={500}>
                    {error ? error : 'Generate'}
                  </Text>
                </ButtonError>
              </AutoColumn>
            )}
          </AutoColumn>
        </Wrapper>
      </AppBody>
    </>
  )
}
