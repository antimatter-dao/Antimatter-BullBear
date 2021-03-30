import React, { useCallback, useContext, useState, useMemo } from 'react'
import { Plus } from 'react-feather'
// import { TransactionResponse } from '@ethersproject/providers'
import { CurrencyAmount, JSBI, ETHER } from '@uniswap/sdk'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { TransactionResponse } from '@ethersproject/providers'
import { ButtonError, ButtonPrimary } from '../../components/Button'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import RedeemTokenPanel from '../../components/MarketStrategy/RedeemTokenPanel'
import { MarketStrategyTabs } from '../../components/NavigationTabs'
import { AutoRow } from '../../components/Row'
import { useActiveWeb3React } from '../../hooks'
// import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useWalletModalToggle } from '../../state/application/hooks'
// import { useTransactionAdder } from '../../state/transactions/hooks'
import { useIsExpertMode } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import AppBody from '../AppBody'
import { Wrapper } from '../Pool/styleds'
import ConfirmRedeemModalBottom from './ConfirmRedeemModalBottom'
import { GenerateBar } from '../../components/MarketStrategy/GenerateBar'
import { useMarketCurrency } from '../../hooks/Tokens'
import { useAllOptionTypes, useDerivedStrategyInfo } from '../../state/market/hooks'
import ButtonSelect from '../../components/Button/ButtonSelect'
import { tryParseAmount } from '../../state/swap/hooks'
import TokenTypeRadioButton, { TOKEN_TYPES } from '../../components/MarketStrategy/TokenTypeRadioButton'
import { useAntimatterContract } from '../../hooks/useContract'
// import { calculateGasMargin } from '../../utils'
import { useTransactionAdder } from '../../state/transactions/hooks'

const parstBalance = (val?: string, toSignificant?: number) => {
  return val ? CurrencyAmount.ether(val?.toString()).toSignificant(toSignificant ?? 6) : ''
}
const parsedGreaterThan = (userInput: string, balance: string) => {
  if (userInput && balance) {
    const v1 = tryParseAmount(userInput, ETHER)?.raw
    const v2 = JSBI.BigInt(balance.toString())
    return v1 && v2 ? JSBI.greaterThan(v1, v2) : undefined
  }
  return
}

export default function Redeem() {
  const [optionTypeIndex, setOptionTypeIndex] = useState('')
  const [callTypedAmount, setCallTypedAmount] = useState<string>('')
  const [putTypedAmount, setPutTypedAmount] = useState<string>('')
  const [tokenType, setTokenType] = useState(TOKEN_TYPES.callPut)
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)

  const antimatterContract = useAntimatterContract()
  const optionTypes = useAllOptionTypes()
  const { account, chainId, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const addTransaction = useTransactionAdder()
  const currencyA = useMarketCurrency(optionTypes[parseInt(optionTypeIndex)]?.underlying)
  const currencyB = useMarketCurrency(optionTypes[parseInt(optionTypeIndex)]?.currency)

  const selectedOptionType = useMemo(() => {
    if (!optionTypes || !optionTypeIndex) return undefined
    return optionTypes?.[parseInt(optionTypeIndex)]
  }, [optionTypes, optionTypeIndex])

  const { delta, error, balances } = useDerivedStrategyInfo(
    selectedOptionType ?? undefined,
    callTypedAmount ?? undefined,
    putTypedAmount ?? undefined
  )

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
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts

  // get the max amounts user can add
  // const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
  //   (accumulator, field) => {
  //     return {
  //       ...accumulator,
  //       [field]: maxAmountSpend(currencyBalances[field])
  //     }
  //   },
  //   {}
  // )

  // const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
  //   (accumulator, field) => {
  //     return {
  //       ...accumulator,
  //       [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0')
  //     }
  //   },
  //   {}
  // )

  // check whether the user has approved the router on the tokens
  // const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS)
  // const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS)

  // const addTransaction = useTransactionAdder()

  async function onRedeem() {
    console.log('onRedeem')
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
      '-' + tryParseAmount(callTypedAmount ?? '0', ETHER)?.raw.toString(),
      '-' + tryParseAmount(putTypedAmount ?? '0', ETHER)?.raw.toString(),
      delta.dUnd.toString(),
      delta.dCur.toString()
    ]

    setAttemptingTxn(true)

    if (estimate) {
      await estimate(...args)
        // .then(estimatedGasLimit =>
        .then(() =>
          method(...args, {
            // gasLimit: calculateGasMargin(estimatedGasLimit)
            gasLimit: 379614
          }).then(response => {
            setAttemptingTxn(false)
            addTransaction(response, {
              summary: 'generate '
            })

            setTxHash(response.hash)
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
        <AutoColumn gap="20px">
          <AutoRow justify="center" style={{ marginTop: '20px' }}>
            <Text fontSize="14px" fontWeight={400}>
              You will generate
            </Text>
          </AutoRow>
        </AutoColumn>
      </>
    )
  }

  const modalBottom = () => {
    return (
      <ConfirmRedeemModalBottom
        currencies={{ CURRENCY_A: currencyA ?? undefined, CURRENCY_B: currencyB ?? undefined }}
        onRedeem={onRedeem}
        callVol={delta && parstBalance(delta.dUnd)}
        putVol={delta && parstBalance(delta.dCur)}
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

  // const addIsUnsupported = useIsTransactionUnsupported(currencyA, currencyB)
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
  const handleCheck = useCallback((tokenType: string) => {
    if (tokenType === TOKEN_TYPES.call) {
      setPutTypedAmount('')
    }
    if (tokenType === TOKEN_TYPES.put) {
      setCallTypedAmount('')
    }
    setTokenType(tokenType)
  }, [])
  const isCallToken = useMemo(() => tokenType === TOKEN_TYPES.call, [tokenType])

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
            <TokenTypeRadioButton selected={tokenType} onCheck={handleCheck} />
            {tokenType === TOKEN_TYPES.callPut ? (
              <>
                <RedeemTokenPanel
                  value={callTypedAmount ?? ''}
                  onUserInput={setCallTypedAmount}
                  label="Call Token"
                  currency={currencyA}
                  currencyBalance={parstBalance(balances?.callBalance)}
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
                  currencyBalance={parstBalance(balances?.putBalance)}
                />
              </>
            ) : (
              <>
                <AutoColumn gap="4px">
                  <AutoRow>
                    <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
                      Token Execrise
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
                    You have the rights to purchase ETH at 100 USDT
                  </div>
                </AutoColumn>
                <RedeemTokenPanel
                  inputOnly={true}
                  value={isCallToken ? callTypedAmount : putTypedAmount}
                  onUserInput={setPutTypedAmount}
                  label={`${isCallToken ? 'CALL' : 'PUT'} Tokens Amount to Exercise`}
                  currency={isCallToken ? currencyA : currencyB}
                  currencyBalance={parstBalance(isCallToken ? balances?.callBalance : balances?.putBalance)}
                />
              </>
            )}
            {currencyA && currencyB && (
              <GenerateBar
                cardTitle={`You will receive`}
                currency0={currencyA}
                currency1={currencyB}
                subTitle="Output Token"
                callVol={delta && parstBalance(delta.dUnd, 4)}
                putVol={delta && parstBalance(delta.dCur, 4)}
              />
            )}

            {!account ? (
              <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
            ) : (
              <AutoColumn gap={'md'}>
                <ButtonError
                  onClick={() => {
                    expertMode ? onRedeem() : setShowConfirm(true)
                  }}
                  disabled={!!redeemError}
                >
                  <Text fontSize={16} fontWeight={500}>
                    {redeemError ?? 'Redeem'}
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
