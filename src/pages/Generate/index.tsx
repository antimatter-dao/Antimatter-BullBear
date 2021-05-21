import React, { useCallback, useContext, useState, useEffect } from 'react'
import { ETHER, Token } from '@uniswap/sdk'
import { Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonError, ButtonPrimary, ButtonOutlined } from '../../components/Button'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CallOrPutInputPanel from '../../components/CallOrPutInputPanel'
import { MarketStrategyTabs } from '../../components/NavigationTabs'
import { RowBetween } from '../../components/Row'
import { OptionTypeData, useDerivedStrategyInfo } from '../../state/market/hooks'
import { ANTIMATTER_ADDRESS, ZERO_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useMarketCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useWalletModalToggle } from '../../state/application/hooks'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { useIsExpertMode } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { calculateGasMargin } from '../../utils'
import AppBody from '../AppBody'
import { Dots, Wrapper } from '../Pool/styleds'
import { ConfirmGenerationModalBottom } from './ConfirmAddModalBottom'
import { TypeRadioButton, TOKEN_TYPES } from '../../components/MarketStrategy/TypeRadioButton'
import ButtonSelect from '../../components/Button/ButtonSelect'
import { tryParseAmount } from '../../state/swap/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { useAntimatterContract } from '../../hooks/useContract'
import { GenerateBar } from '../../components/MarketStrategy/GenerateBar'
import { isNegative, parseBalance } from '../../utils/marketStrategyUtils'
import { parsePrice } from 'utils/option/utils'
import { getSingleOptionType } from 'utils/option/httpRequests'
import { useNetwork } from 'hooks/useNetwork'

export default function Generate({
  match: {
    params: { optionTypeIndex }
  }
}: RouteComponentProps<{ optionTypeIndex?: string }>) {
  // const [optionType, setOptionType] = useState('')
  const [callTyped, setCallTyped] = useState<string>()
  const [putTyped, setPutTyped] = useState<string>()
  const [tokenType, setTokenType] = useState(TOKEN_TYPES.callPut)
  const [selectedOptionType, setselectedOptionType] = useState<OptionTypeData | undefined>(undefined)

  const theme = useContext(ThemeContext)

  const { account, chainId, library } = useActiveWeb3React()
  const { httpHandlingFunctions, networkErrorModal } = useNetwork()
  // const optionTypes = useAllOptionTypes()
  // const optionType = optionTypeIndex ?? ''
  // const selectedOptionType = useMemo(() => {
  //   if (!optionTypes || !optionType) return undefined
  //   return optionTypes?.[parseInt(optionType)]
  // }, [optionTypes, optionType])
  useEffect(
    () => getSingleOptionType(httpHandlingFunctions, data => setselectedOptionType(data), chainId, optionTypeIndex),
    [chainId, httpHandlingFunctions, optionTypeIndex]
  )
  const currencyA = useMarketCurrency(selectedOptionType?.underlying)
  const currencyB = useMarketCurrency(selectedOptionType?.currency)
  const antimatterContract = useAntimatterContract()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()

  const underlyingToken: Token = new Token(
    chainId ?? 1,
    selectedOptionType?.underlying ?? ZERO_ADDRESS,
    Number(selectedOptionType?.underlyingDecimals?.toString() ?? '18')
  )

  const currencyToken: Token = new Token(
    chainId ?? 1,
    selectedOptionType?.currency ?? ZERO_ADDRESS,
    Number(selectedOptionType?.currencyDecimals?.toString() ?? '18')
  )

  const { delta, error } = useDerivedStrategyInfo(
    true,
    selectedOptionType ?? undefined,
    callTyped ?? undefined,
    putTyped ?? undefined,
    tokenType
  )

  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // // txn values
  // const deadline = useTransactionDeadline() // custom from users settings
  const [txHash, setTxHash] = useState<string>('')

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    tryParseAmount(delta?.totalUnd.toString(), currencyA?.symbol === 'WETH' ? ETHER : currencyA ?? undefined),
    chainId ? ANTIMATTER_ADDRESS[chainId] : undefined
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    tryParseAmount(delta?.totalCur.toString(), currencyB?.symbol === 'WETH' ? ETHER : currencyB ?? undefined),
    chainId ? ANTIMATTER_ADDRESS[chainId] : undefined
  )

  const addTransaction = useTransactionAdder()

  async function onGenerate() {
    if (!chainId || !library || !account) return
    // const maxUnd = tryParseAmount(delta?.totalUnd.toString(), currencyA ?? undefined)
    // const maxCur = tryParseAmount(delta?.totalCur.toString(), currencyB ?? undefined)

    if (!delta) {
      return
    }

    const estimate = antimatterContract?.estimateGas.mint
    const method: (...args: any) => Promise<TransactionResponse> = antimatterContract?.mint
    let value: string | undefined | null = null
    const args = [
      selectedOptionType?.callAddress,
      tokenType === TOKEN_TYPES.callPut || tokenType === TOKEN_TYPES.call
        ? tryParseAmount(TOKEN_TYPES.callPut || TOKEN_TYPES.call ? callTyped : '0', ETHER)?.raw.toString()
        : '0',
      tokenType === TOKEN_TYPES.callPut || tokenType === TOKEN_TYPES.put
        ? tryParseAmount(TOKEN_TYPES.callPut || TOKEN_TYPES.put ? putTyped : '0', ETHER)?.raw.toString()
        : '0',
      delta.dUnd.toString(),
      delta.dCur.toString()
    ]

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
            setPutTyped(undefined)
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

  // const selectOptions = useMemo(
  //   () =>
  //     optionTypes.map(item => {
  //       return {
  //         id: item.id,
  //         option: `${item.underlyingSymbol ?? '-'} (${parseBalance({
  //           val: item.priceFloor,
  //           token: new Token(1, ZERO_ADDRESS, Number(item.currencyDecimals ?? '18'))
  //         })}$${parseBalance({
  //           val: item.priceCap,
  //           token: new Token(1, ZERO_ADDRESS, Number(item.currencyDecimals ?? '18'))
  //         })})`
  //       }
  //     }),
  //   [optionTypes]
  // )
  const modalHeader = useCallback(() => {
    return <AutoColumn gap="20px"></AutoColumn>
  }, [])

  const modalBottom = () => {
    return (
      <ConfirmGenerationModalBottom
        tokenType={tokenType}
        delta={delta}
        callTyped={callTyped}
        putTyped={putTyped}
        currencyA={currencyA}
        currencyB={currencyB}
        onGenerate={onGenerate}
        underlyingToken={underlyingToken}
        currencyToken={currencyToken}
      />
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

  return (
    <>
      {networkErrorModal}
      <AppBody>
        <MarketStrategyTabs generation />
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
            <ButtonSelect label="Option Type" disabled={true}>
              {selectedOptionType &&
                `${selectedOptionType.underlyingSymbol ?? '-'} (${parsePrice(
                  selectedOptionType.priceFloor,
                  (selectedOptionType.currencyDecimals = '6')
                )}$${parsePrice(selectedOptionType.priceCap, (selectedOptionType.currencyDecimals = '6'))})`}
            </ButtonSelect>
            <TypeRadioButton selected={tokenType} onCheck={(tokenType: string) => setTokenType(tokenType)} />
            {(tokenType === TOKEN_TYPES.callPut || tokenType === TOKEN_TYPES.call) && (
              <CallOrPutInputPanel
                value={callTyped ?? ''}
                onUserInput={setCallTyped}
                currency={currencyA || undefined}
                id="generate-output-token"
                showCommonBases
                defaultSymbol={
                  selectedOptionType?.underlyingSymbol
                    ? `+${selectedOptionType?.underlyingSymbol}($${parseBalance({
                        val: selectedOptionType?.priceFloor,
                        token: currencyToken
                      })})`
                    : 'Call Token'
                }
                halfWidth={true}
                isCall={true}
              />
            )}

            {tokenType === TOKEN_TYPES.callPut && (
              <ColumnCenter>
                <Plus size="28" color={theme.text2} />
              </ColumnCenter>
            )}

            {(tokenType === TOKEN_TYPES.callPut || tokenType === TOKEN_TYPES.put) && (
              <CallOrPutInputPanel
                value={putTyped ?? ''}
                onUserInput={setPutTyped}
                currency={currencyA || undefined}
                id="generate-output-token"
                showCommonBases
                halfWidth={true}
                defaultSymbol={
                  selectedOptionType?.underlyingSymbol
                    ? `-${selectedOptionType?.underlyingSymbol}($${parseBalance({
                        val: selectedOptionType?.priceCap,
                        token: currencyToken
                      })})`
                    : 'Put Token'
                }
                negativeMarginTop={tokenType === TOKEN_TYPES.callPut ? '-20px' : '0'}
                isCall={false}
              />
            )}

            {currencyA && currencyB && delta?.dUnd && delta.dCur && (
              <GenerateBar
                cardTitle={``}
                callVol={
                  delta &&
                  parseBalance({
                    val: delta.dUnd,
                    token: underlyingToken
                  })
                }
                putVol={
                  delta &&
                  parseBalance({
                    val: delta.dCur,
                    token: currencyToken
                  })
                }
                subTitle="Output Token"
                currency0={currencyA}
                currency1={currencyB}
              />
            )}

            {!selectedOptionType || !delta ? (
              <ButtonOutlined style={{ opacity: '0.5' }} disabled={true}>
                <TYPE.main>Enter Amount</TYPE.main>
              </ButtonOutlined>
            ) : !account ? (
              <ButtonPrimary onClick={toggleWalletModal} borderRadius="49px">
                Connect Wallet
              </ButtonPrimary>
            ) : (
              <AutoColumn gap={'md'}>
                {(approvalA === ApprovalState.NOT_APPROVED ||
                  approvalA === ApprovalState.PENDING ||
                  approvalB === ApprovalState.NOT_APPROVED ||
                  approvalB === ApprovalState.PENDING) &&
                  isValid && (
                    <RowBetween>
                      {approvalA !== ApprovalState.APPROVED && (
                        <ButtonPrimary
                          onClick={approveACallback}
                          disabled={approvalA === ApprovalState.PENDING}
                          width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                        >
                          {approvalA === ApprovalState.PENDING ? (
                            <Dots>Approving {selectedOptionType?.underlyingSymbol}</Dots>
                          ) : (
                            'Approve ' + selectedOptionType?.underlyingSymbol
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
                            <Dots>Approving {selectedOptionType?.currencySymbol}</Dots>
                          ) : (
                            'Approve ' + selectedOptionType?.currencySymbol
                          )}
                        </ButtonPrimary>
                      )}
                    </RowBetween>
                  )}
                {error && <ButtonOutlined style={{ opacity: '0.5' }}>{error}</ButtonOutlined>}
                {!error && (
                  <ButtonError
                    onClick={() => {
                      expertMode ? onGenerate() : setShowConfirm(true)
                    }}
                    disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                    error={!isValid && !callTyped && !putTyped}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {error ?? 'Generate'}
                    </Text>
                  </ButtonError>
                )}
              </AutoColumn>
            )}
          </AutoColumn>
        </Wrapper>
      </AppBody>
      {/*{!addIsUnsupported ? (*/}
      {/*  pair && !noLiquidity && pairState !== PairState.INVALID ? (*/}
      {/*    <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}>*/}
      {/*      <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />*/}
      {/*    </AutoColumn>*/}
      {/*  ) : null*/}
      {/*) : (*/}
      {/*  <UnsupportedCurrencyFooter*/}
      {/*    show={addIsUnsupported}*/}
      {/*    currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}*/}
      {/*  />*/}
      {/*)}*/}
    </>
  )
}
