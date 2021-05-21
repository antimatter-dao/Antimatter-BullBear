import React, { useCallback, useContext, useState, useMemo, useEffect } from 'react'
import { Plus } from 'react-feather'
import { RouteComponentProps } from 'react-router'
import { ChainId, ETHER, Token, WETH } from '@uniswap/sdk'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { TransactionResponse } from '@ethersproject/providers'
import { ButtonError, ButtonOutlined, ButtonPrimary } from '../../components/Button'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import RedeemTokenPanel from '../../components/MarketStrategy/RedeemTokenPanel'
import { MarketStrategyTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useIsExpertMode } from '../../state/user/hooks'
import AppBody from '../AppBody'
import { Wrapper } from '../Pool/styleds'
import { ConfirmRedeemModalBottom } from './ConfirmRedeemModalBottom'
import { GenerateBar } from '../../components/MarketStrategy/GenerateBar'
import { useMarketCurrency } from '../../hooks/Tokens'
import { useDerivedStrategyInfo, OptionTypeData } from '../../state/market/hooks'
import ButtonSelect from '../../components/Button/ButtonSelect'
import { tryParseAmount } from '../../state/swap/hooks'
import { TypeRadioButton, TOKEN_TYPES } from '../../components/MarketStrategy/TypeRadioButton'
import { useAntimatterContract } from '../../hooks/useContract'
import { calculateGasMargin } from '../../utils'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { isNegative, parseBalance, parsedGreaterThan } from '../../utils/marketStrategyUtils'
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback'
import { Dots } from 'components/swap/styleds'
import { ANTIMATTER_ADDRESS, ZERO_ADDRESS } from '../../constants'
import { parsePrice } from 'utils/option/utils'
import { getSingleOptionType } from 'utils/option/httpRequests'
import { useNetwork } from 'hooks/useNetwork'

export default function Redeem({
  match: {
    params: { optionTypeIndex }
  }
}: RouteComponentProps<{ optionTypeIndex?: string }>) {
  const [callTypedAmount, setCallTypedAmount] = useState<string>('')
  const [putTypedAmount, setPutTypedAmount] = useState<string>('')
  const [tokenType, setTokenType] = useState(TOKEN_TYPES.callPut)
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>('')
  const [selectedOptionType, setselectedOptionType] = useState<OptionTypeData | undefined>(undefined)

  const antimatterContract = useAntimatterContract()
  const { account, chainId, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const addTransaction = useTransactionAdder()
  const { httpHandlingFunctions, networkErrorModal } = useNetwork()

  useEffect(
    () => getSingleOptionType(httpHandlingFunctions, data => setselectedOptionType(data), chainId, optionTypeIndex),
    [chainId, optionTypeIndex, httpHandlingFunctions]
  )

  const isCallToken = useMemo(() => tokenType === TOKEN_TYPES.call, [tokenType])

  const currencyA = useMarketCurrency(selectedOptionType?.underlying)
  const currencyB = useMarketCurrency(selectedOptionType?.currency)

  const underlyingToken: Token = new Token(
    chainId ?? 1,
    selectedOptionType?.underlying ?? ZERO_ADDRESS,
    Number(selectedOptionType?.underlyingDecimals.toString() ?? '18')
  )

  const currencyToken: Token = new Token(
    chainId ?? 1,
    selectedOptionType?.currency ?? ZERO_ADDRESS,
    Number(selectedOptionType?.currencyDecimals.toString() ?? '18')
  )

  const { delta, error, balances } = useDerivedStrategyInfo(
    false,
    selectedOptionType ?? undefined,
    callTypedAmount ? '-' + callTypedAmount : undefined,
    putTypedAmount ? '-' + putTypedAmount : undefined,
    tokenType
  )
  const isValid = !error
  const redeemError = useMemo(() => {
    if (
      balances &&
      (parsedGreaterThan(callTypedAmount, balances.callBalance) ||
        parsedGreaterThan(putTypedAmount, balances.putBalance))
    ) {
      return 'Insufficient Balance'
    }
    return error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balances?.callBalance, balances?.callBalance, error, callTypedAmount, putTypedAmount])

  // txn values
  // const deadline = useTransactionDeadline() // custom from users settings
  // const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    tryParseAmount(delta?.totalUnd.toString(), currencyA?.symbol === 'WETH' ? ETHER : currencyA ?? undefined),
    chainId ? ANTIMATTER_ADDRESS[chainId] : undefined
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    tryParseAmount(delta?.totalCur.toString(), currencyB?.symbol === 'WETH' ? ETHER : currencyB ?? undefined),
    chainId ? ANTIMATTER_ADDRESS[chainId] : undefined
  )
  const approval1 = isNegative(delta?.totalUnd.toString()) ? ApprovalState.APPROVED : approvalA
  const approval2 = isNegative(delta?.totalCur.toString()) ? ApprovalState.APPROVED : approvalB

  async function onRedeem() {
    if (!chainId || !library || !account) return

    if (!delta) {
      return
    }
    if (tokenType === TOKEN_TYPES.call && !callTypedAmount) return
    if (tokenType === TOKEN_TYPES.put && !putTypedAmount) return

    const estimate = antimatterContract?.estimateGas.burn

    const method: (...args: any) => Promise<TransactionResponse> = antimatterContract?.burn

    const args = [
      selectedOptionType?.callAddress,
      tokenType === TOKEN_TYPES.callPut || tokenType === TOKEN_TYPES.call
        ? '-' + tryParseAmount(callTypedAmount ?? '0', ETHER)?.raw.toString()
        : '0',
      tokenType === TOKEN_TYPES.callPut || tokenType === TOKEN_TYPES.put
        ? '-' + tryParseAmount(putTypedAmount ?? '0', ETHER)?.raw.toString()
        : '0',
      delta.dUnd.toString(),
      delta.dCur.toString()
    ]

    let value: string | undefined | null = null

    if (selectedOptionType?.underlyingSymbol === 'ETH') {
      value = isNegative(delta.dUnd) ? '0' : delta.dUnd.toString()
    }

    if (selectedOptionType?.currencySymbol === 'ETH') {
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
            setAttemptingTxn(false)
            addTransaction(response, {
              summary: 'redeem'
            })

            setTxHash(response.hash)
            setCallTypedAmount('')
            setPutTypedAmount('')
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
      <ConfirmRedeemModalBottom
        tokenType={tokenType}
        delta={delta}
        callTyped={callTypedAmount}
        putTyped={putTypedAmount}
        currencyA={currencyA}
        currencyB={currencyB}
        onRedeem={onRedeem}
      />
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

  const handleCheck = useCallback((tokenType: string) => {
    setTokenType(tokenType)
  }, [])

  return (
    <>
      {networkErrorModal}
      <AppBody>
        <MarketStrategyTabs generation={false} />
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
            <ButtonSelect label="Option Type" disabled={true}>
              {selectedOptionType &&
                `${selectedOptionType.underlyingSymbol ?? '-'} (${parsePrice(
                  selectedOptionType.priceFloor,
                  (selectedOptionType.currencyDecimals = '6')
                )}$${parsePrice(selectedOptionType.priceCap, (selectedOptionType.currencyDecimals = '6'))})`}
            </ButtonSelect>
            <TypeRadioButton selected={tokenType} onCheck={handleCheck} />
            {tokenType === TOKEN_TYPES.callPut ? (
              <>
                <RedeemTokenPanel
                  value={callTypedAmount ?? ''}
                  onUserInput={setCallTypedAmount}
                  label={
                    selectedOptionType?.underlyingSymbol
                      ? `+${selectedOptionType?.underlyingSymbol}($${parseBalance({
                          val: selectedOptionType?.priceFloor,
                          token: currencyToken
                        })})`
                      : 'Call Token'
                  }
                  currency={currencyA}
                  currencyBalance={parseBalance({ val: balances?.callBalance, token: WETH[ChainId.MAINNET] })}
                  isCall={true}
                />
                <ColumnCenter>
                  <Plus size="28" color={theme.text2} />
                </ColumnCenter>
                <RedeemTokenPanel
                  value={putTypedAmount ?? ''}
                  onUserInput={setPutTypedAmount}
                  label={
                    selectedOptionType?.underlyingSymbol
                      ? `+${selectedOptionType?.underlyingSymbol}($${parseBalance({
                          val: selectedOptionType?.priceCap,
                          token: currencyToken
                        })})`
                      : 'Call Token'
                  }
                  currency={currencyA}
                  negativeMarginTop="-25px"
                  currencyBalance={parseBalance({ val: balances?.putBalance, token: WETH[ChainId.MAINNET] })}
                  isCall={false}
                />
              </>
            ) : (
              <>
                <RedeemTokenPanel
                  inputOnly={true}
                  value={isCallToken ? callTypedAmount : putTypedAmount}
                  onUserInput={isCallToken ? setCallTypedAmount : setPutTypedAmount}
                  label={`${isCallToken ? 'CALL' : 'PUT'} Tokens Amount to Exercise`}
                  currency={isCallToken ? currencyA : currencyB}
                  currencyBalance={parseBalance({
                    val: isCallToken ? balances?.callBalance : balances?.putBalance,
                    token: WETH[ChainId.MAINNET]
                  })}
                  isCall={isCallToken}
                />
              </>
            )}
            {currencyA && currencyB && delta?.dCur && delta?.dUnd && (
              <GenerateBar
                cardTitle={`You will receive`}
                currency0={currencyA}
                currency1={currencyB}
                subTitle="Output Token"
                callVol={delta && parseBalance({ val: delta.dUnd, token: underlyingToken })}
                putVol={delta && parseBalance({ val: delta.dCur, token: currencyToken })}
              />
            )}

            {!account ? (
              <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
            ) : (
              <AutoColumn gap={'md'}>
                {(approval1 === ApprovalState.NOT_APPROVED ||
                  approval1 === ApprovalState.PENDING ||
                  approval2 === ApprovalState.NOT_APPROVED ||
                  approval2 === ApprovalState.PENDING) &&
                  isValid && (
                    <RowBetween>
                      {approval1 !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={approveACallback}
                          disabled={approval1 === ApprovalState.PENDING}
                          width={approval2 !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approval1 === ApprovalState.PENDING ? (
                            <Dots>Approving {selectedOptionType?.underlyingSymbol}</Dots>
                          ) : (
                            'Approve ' + selectedOptionType?.underlyingSymbol
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
                            <Dots>Approving {selectedOptionType?.currencySymbol}</Dots>
                          ) : (
                            'Approve ' + selectedOptionType?.currencySymbol
                          )}
                        </ButtonPrimary>
                      )}
                    </RowBetween>
                  )}
                {redeemError && <ButtonOutlined style={{ opacity: '0.5' }}>{redeemError}</ButtonOutlined>}
                {!redeemError && (
                  <ButtonError
                    onClick={() => {
                      expertMode ? onRedeem() : setShowConfirm(true)
                    }}
                    disabled={
                      !!redeemError || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED
                    }
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {redeemError ?? (tokenType === TOKEN_TYPES.callPut ? 'Redeem' : 'Exercise')}
                    </Text>
                  </ButtonError>
                )}
              </AutoColumn>
            )}
          </AutoColumn>
        </Wrapper>
      </AppBody>
      {/* {!addIsUnsupported ? (
        pair && !noLiquidity && pairState !== PairState.INVALID ? (
          <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
            <MinimalPositionCard showUnwrapped={true} pair={pair} />
          </AutoColumn>
        ) : null
      ) : (
        <UnsupportedCurrencyFooter
          show={addIsUnsupported}
          currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
        />
      )} */}
    </>
  )
}
