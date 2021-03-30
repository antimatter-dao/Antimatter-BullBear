import React, { useCallback, useContext, useState, useMemo } from 'react'
import { ETHER, JSBI, Token, TokenAmount } from '@uniswap/sdk'
import { Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonError, ButtonPrimary } from '../../components/Button'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CallOrPutInputPanel from '../../components/CallOrPutInputPanel'
import { MarketStrategyTabs } from '../../components/NavigationTabs'
import { RowBetween } from '../../components/Row'
import { useAllOptionTypes, useDerivedStrategyInfo } from '../../state/market/hooks'
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

export default function Generate() {
  const [optionType, setOptionType] = useState('')
  const [callTyped, setCallTyped] = useState<string>()
  const [putTyped, setPutTyped] = useState<string>()
  const [tokenType, setTokenType] = useState(TOKEN_TYPES.callPut)

  const theme = useContext(ThemeContext)

  const { account, chainId, library } = useActiveWeb3React()
  const optionTypes = useAllOptionTypes()
  const currencyA = useMarketCurrency(optionTypes[parseInt(optionType)]?.underlying)
  const currencyB = useMarketCurrency(optionTypes[parseInt(optionType)]?.currency)
  const antimatterContract = useAntimatterContract()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()

  const selectedOptionType = useMemo(() => {
    if (!optionTypes || !optionType) return undefined
    return optionTypes?.[parseInt(optionType)]
  }, [optionTypes, optionType])

  const { delta, error } = useDerivedStrategyInfo(
    selectedOptionType ?? undefined,
    callTyped ?? undefined,
    putTyped ?? undefined,
    tokenType
  )

  // const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // // txn values
  // const deadline = useTransactionDeadline() // custom from users settings
  const [txHash, setTxHash] = useState<string>('')

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    tryParseAmount(delta?.totalUnd.toString(), currencyA ?? undefined),
    ANTIMATTER_ADDRESS
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    tryParseAmount(delta?.totalCur.toString(), currencyB ?? undefined),
    ANTIMATTER_ADDRESS
  )

  const addTransaction = useTransactionAdder()

  async function onGenerate() {
    if (!chainId || !library || !account) return
    // const maxUnd = tryParseAmount(delta?.totalUnd.toString(), currencyA ?? undefined)
    // const maxCur = tryParseAmount(delta?.totalCur.toString(), currencyB ?? undefined)

    if (!delta || !callTyped || !putTyped) {
      return
    }

    const estimate = antimatterContract?.estimateGas.mint
    const method: (...args: any) => Promise<TransactionResponse> = antimatterContract?.mint
    const args = [
      optionTypes[parseInt(optionType)].callAddress,
      tryParseAmount(callTyped ?? '0', ETHER)?.raw.toString(),
      tryParseAmount(putTyped ?? '0', ETHER)?.raw.toString(),
      delta.dUnd.toString(),
      delta.dCur.toString()
    ]

    setAttemptingTxn(true)
    if (estimate) {
      await estimate(...args)
        .then(estimatedGasLimit =>
          method(...args, {
            gasLimit: calculateGasMargin(estimatedGasLimit)
          }).then(response => {
            setPutTyped(undefined)
            setCallTyped(undefined)
            setAttemptingTxn(false)
            addTransaction(response, {
              summary: 'generate '
            })

            setTxHash(response.hash)

            ReactGA.event({
              category: 'Liquidity',
              action: 'Add',
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

  const selectOptions = useMemo(
    () =>
      optionTypes.map(item => {
        return {
          id: item.id,
          option: `${item.underlyingSymbol}-${item.currencySymbol} ${JSBI.divide(
            JSBI.BigInt(item.priceFloor),
            JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(item.underlyingDecimals ?? 18))
          )}-${JSBI.divide(
            JSBI.BigInt(item.priceCap),
            JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(item.currencyDecimals ?? 18))
          )}`
        }
      }),
    [optionTypes]
  )
  const modalHeader = useCallback(() => {
    return <AutoColumn gap="20px"></AutoColumn>
  }, [])

  const modalBottom = () => {
    return (
      <ConfirmGenerationModalBottom
        delta={delta}
        callTyped={callTyped}
        putTyped={putTyped}
        currencyA={currencyA}
        currencyB={currencyB}
        onGenerate={onGenerate}
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
            <ButtonSelect
              label="Option Type"
              onSelection={setOptionType}
              options={selectOptions}
              selectedId={optionType}
            />
            <TypeRadioButton selected={tokenType} onCheck={(tokenType: string) => setTokenType(tokenType)} />
            <CallOrPutInputPanel
              value={callTyped ?? ''}
              onUserInput={setCallTyped}
              currency={undefined}
              id="generate-output-token"
              showCommonBases
              defaultSymbol={'Call Token'}
              halfWidth={true}
              isCall={true}
            />
            {tokenType === TOKEN_TYPES.callPut && (
              <>
                <ColumnCenter>
                  <Plus size="28" color={theme.text2} />
                </ColumnCenter>
                <CallOrPutInputPanel
                  value={putTyped ?? ''}
                  onUserInput={setPutTyped}
                  currency={undefined}
                  id="add-liquidity-input-tokenb"
                  showCommonBases
                  halfWidth={true}
                  defaultSymbol={'Put Token'}
                  negativeMarginTop="-20px"
                  isCall={false}
                />
              </>
            )}
            {currencyA && currencyB && delta?.dUnd && delta.dCur && (
              <GenerateBar
                cardTitle={`You will pay`}
                callVol={new TokenAmount(
                  new Token(1, ZERO_ADDRESS, currencyA.decimals),
                  delta.dUnd.toString()
                )?.toSignificant(4)}
                putVol={new TokenAmount(
                  new Token(1, ZERO_ADDRESS, currencyA.decimals),
                  delta.dCur.toString()
                )?.toSignificant(4)}
                currency0={currencyA}
                currency1={currencyB}
              />
            )}

            {!optionType || !callTyped || !putTyped ? (
              <ButtonPrimary disabled={true}>
                <TYPE.main mb="4px">Enter Amount</TYPE.main>
              </ButtonPrimary>
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
                            <Dots>Approving {optionTypes[parseInt(optionType)]?.underlyingSymbol}</Dots>
                          ) : (
                            'Approve ' + optionTypes[parseInt(optionType)]?.underlyingSymbol
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
                            <Dots>Approving {optionTypes[parseInt(optionType)]?.currencySymbol}</Dots>
                          ) : (
                            'Approve ' + optionTypes[parseInt(optionType)]?.currencySymbol
                          )}
                        </ButtonPrimary>
                      )}
                    </RowBetween>
                  )}
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
