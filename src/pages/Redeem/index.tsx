import React, { useCallback, useContext, useState, useMemo } from 'react'
import { Plus } from 'react-feather'
import { ETHER } from '@uniswap/sdk'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { TransactionResponse } from '@ethersproject/providers'
import { ButtonError, ButtonPrimary } from '../../components/Button'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import RedeemTokenPanel from '../../components/MarketStrategy/RedeemTokenPanel'
import { MarketStrategyTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
import { useActiveWeb3React } from '../../hooks'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useIsExpertMode } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import AppBody from '../AppBody'
import { Wrapper } from '../Pool/styleds'
import { ConfirmRedeemModalBottom } from './ConfirmRedeemModalBottom'
import { GenerateBar } from '../../components/MarketStrategy/GenerateBar'
import { useMarketCurrency } from '../../hooks/Tokens'
import { OptionTypeData, useAllOptionTypes, useDerivedStrategyInfo } from '../../state/market/hooks'
import ButtonSelect from '../../components/Button/ButtonSelect'
import { tryParseAmount } from '../../state/swap/hooks'
import { TypeRadioButton, TOKEN_TYPES } from '../../components/MarketStrategy/TypeRadioButton'
import { useAntimatterContract } from '../../hooks/useContract'
import { calculateGasMargin } from '../../utils'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { isNegative, parseBalance, parsedGreaterThan } from '../../utils/marketStrategyUtils'
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback'
import { Dots } from 'components/swap/styleds'
import { ANTIMATTER_ADDRESS } from '../../constants'

const findPrice = (option?: OptionTypeData, isCall?: boolean) => {
  if (!option) {
    return ''
  }
  return isCall ? parseBalance(option.priceFloor) : parseBalance(option.priceCap)
}

export default function Redeem() {
  const [optionTypeIndex, setOptionTypeIndex] = useState('')
  const [callTypedAmount, setCallTypedAmount] = useState<string>('')
  const [putTypedAmount, setPutTypedAmount] = useState<string>('')
  const [tokenType, setTokenType] = useState(TOKEN_TYPES.callPut)
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>('')

  const antimatterContract = useAntimatterContract()
  const optionTypes = useAllOptionTypes()
  const { account, chainId, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const addTransaction = useTransactionAdder()
  const currencyA = useMarketCurrency(optionTypes[parseInt(optionTypeIndex)]?.underlying)
  const currencyB = useMarketCurrency(optionTypes[parseInt(optionTypeIndex)]?.currency)

  const isCallToken = useMemo(() => tokenType === TOKEN_TYPES.call, [tokenType])
  const selectedOptionType = useMemo(() => {
    if (!optionTypes || !optionTypeIndex) return undefined
    return optionTypes?.[parseInt(optionTypeIndex)]
  }, [optionTypes, optionTypeIndex])

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
      optionTypes[parseInt(optionTypeIndex)].callAddress,
      tokenType === TOKEN_TYPES.callPut || tokenType === TOKEN_TYPES.call
        ? '-' + tryParseAmount(callTypedAmount ?? '0', ETHER)?.raw.toString()
        : '0',
      tokenType === TOKEN_TYPES.callPut || tokenType === TOKEN_TYPES.put
        ? '-' + tryParseAmount(putTypedAmount ?? '0', ETHER)?.raw.toString()
        : '0',
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

  const selectOptions = useMemo(
    () =>
      optionTypes.map(item => {
        return {
          id: item.id,
          option: `${item.underlyingSymbol} (${parseBalance(item.priceFloor)}$${parseBalance(item.priceCap)})`
        }
      }),
    [optionTypes]
  )
  const handleCheck = useCallback((tokenType: string) => {
    setTokenType(tokenType)
  }, [])

  return (
    <>
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
            <ButtonSelect
              label="Option Type"
              onSelection={setOptionTypeIndex}
              options={selectOptions}
              selectedId={optionTypeIndex}
            />
            <TypeRadioButton selected={tokenType} onCheck={handleCheck} />
            {tokenType === TOKEN_TYPES.callPut ? (
              <>
                <RedeemTokenPanel
                  value={callTypedAmount ?? ''}
                  onUserInput={setCallTypedAmount}
                  label="Call Token"
                  currency={currencyA}
                  currencyBalance={parseBalance(balances?.callBalance)}
                  isCall={true}
                />
                <ColumnCenter>
                  <Plus size="28" color={theme.text2} />
                </ColumnCenter>
                <RedeemTokenPanel
                  value={putTypedAmount ?? ''}
                  onUserInput={setPutTypedAmount}
                  label="Put Token"
                  currency={currencyB}
                  negativeMarginTop="-25px"
                  currencyBalance={parseBalance(balances?.putBalance)}
                  isCall={false}
                />
              </>
            ) : (
              <>
                {currencyA && currencyB && (
                  <AutoColumn gap="4px">
                    <AutoRow>
                      <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
                        Token Exercise
                      </TYPE.body>
                    </AutoRow>
                    <div
                      style={{
                        width: '100%',
                        border: `1px solid ${theme.bg3}`,
                        padding: '0 20px',
                        borderRadius: '14px',
                        color: theme.text3,
                        height: '3rem',
                        lineHeight: '48px'
                      }}
                    >
                      {`You have the rights to ${isCallToken ? 'purchase' : 'sell'} ${currencyA?.symbol ??
                        ''} at ${findPrice(selectedOptionType, isCallToken)} ${currencyB?.symbol ?? ''}`}
                    </div>
                  </AutoColumn>
                )}
                <RedeemTokenPanel
                  inputOnly={true}
                  value={isCallToken ? callTypedAmount : putTypedAmount}
                  onUserInput={isCallToken ? setCallTypedAmount : setPutTypedAmount}
                  label={`${isCallToken ? 'CALL' : 'PUT'} Tokens Amount to Exercise`}
                  currency={isCallToken ? currencyA : currencyB}
                  currencyBalance={parseBalance(isCallToken ? balances?.callBalance : balances?.putBalance)}
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
                callVol={delta && parseBalance(delta.dUnd, 4)}
                putVol={delta && parseBalance(delta.dCur, 4)}
              />
            )}

            {!account ? (
              <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
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
                            <Dots>Approving {optionTypes[parseInt(optionTypeIndex)]?.underlyingSymbol}</Dots>
                          ) : (
                            'Approve ' + optionTypes[parseInt(optionTypeIndex)]?.underlyingSymbol
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
                            <Dots>Approving {optionTypes[parseInt(optionTypeIndex)]?.currencySymbol}</Dots>
                          ) : (
                            'Approve ' + optionTypes[parseInt(optionTypeIndex)]?.currencySymbol
                          )}
                        </ButtonPrimary>
                      )}
                    </RowBetween>
                  )}
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
