import React, { useCallback, useContext, useState, useMemo } from 'react'
import { Plus } from 'react-feather'
// import { TransactionResponse } from '@ethersproject/providers'
import { /*ETHER , TokenAmount,*/ JSBI } from '@uniswap/sdk'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonError, ButtonPrimary } from '../../components/Button'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import RedeemTokenPanel from '../../components/MarketStrategy/RedeemTokenPanel'
import { MarketStrategyTabs } from '../../components/NavigationTabs'
import Row, { RowFlat } from '../../components/Row'

// import { ROUTER_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
// import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useWalletModalToggle } from '../../state/application/hooks'
// import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'

// import { useTransactionAdder } from '../../state/transactions/hooks'
import { useIsExpertMode, useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
// import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
// import { wrappedCurrency } from '../../utils/wrappedCurrency'
import AppBody from '../AppBody'
import { Wrapper } from '../Pool/styleds'
// import { ConfirmAddModalBottom } from './ConfirmAddModalBottom'
import { GenerateBar } from '../../components/MarketStrategy/GenerateBar'
// import { useIsTransactionUnsupported } from 'hooks/Trades'
import { useMarketCurrency } from '../../hooks/Tokens'
import { useAllOptionTypes, useDerivedStrategyInfo } from '../../state/market/hooks'
import ButtonSelect from '../../components/Button/ButtonSelect'
import { tryParseAmount } from '../../state/swap/hooks'

const parstBalance = (val?: string) => {
  return val ? JSBI.divide(JSBI.BigInt(val), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18))).toString() : ''
}

export default function Redeem() {
  const [optionTypeIndex, setOptionTypeIndex] = useState('')
  const [callTypedAmount, setCallTypedAmount] = useState<string>()
  const [putTypedAmount, setPutTypedAmount] = useState<string>()

  const optionTypes = useAllOptionTypes()
  const { account /*, chainId, library */ } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const currencyA = useMarketCurrency(optionTypes[parseInt(optionTypeIndex)]?.underlying)
  const currencyB = useMarketCurrency(optionTypes[parseInt(optionTypeIndex)]?.currency)

  const selectedOptionType = useMemo(() => {
    if (!optionTypes || !optionTypeIndex) return undefined
    return optionTypes?.[parseInt(optionTypeIndex)]
  }, [optionTypes, optionTypeIndex])
  console.log(888, optionTypes, selectedOptionType)
  // mint state
  // const { independentField, typedValue, otherTypedValue } = useMintState()
  const { delta, error, balances } = useDerivedStrategyInfo(
    selectedOptionType ?? undefined,
    callTypedAmount ?? undefined,
    putTypedAmount ?? undefined
  )
  console.log(77777, balances, delta)
  console.log(90909090909, parstBalance(balances?.putBalance))
  const isValid = !error
  // const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  // const deadline = useTransactionDeadline() // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
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

  async function onAdd() {
    // if (!chainId || !library || !account) return
    // const router = getRouterContract(chainId, library, account)
    // const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    // if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
    //   return
    // }
    // const amountsMin = {
    //   [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
    //   [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0]
    // }
    // let estimate,
    //   method: (...args: any) => Promise<TransactionResponse>,
    //   args: Array<string | string[] | number>,
    //   value: BigNumber | null
    // if (currencyA === ETHER || currencyB === ETHER) {
    //   const tokenBIsETH = currencyB === ETHER
    //   estimate = router.estimateGas.addLiquidityETH
    //   method = router.addLiquidityETH
    //   args = [
    //     wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
    //     (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
    //     amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
    //     amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
    //     account,
    //     deadline.toHexString()
    //   ]
    //   value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
    // } else {
    //   estimate = router.estimateGas.addLiquidity
    //   method = router.addLiquidity
    //   args = [
    //     wrappedCurrency(currencyA, chainId)?.address ?? '',
    //     wrappedCurrency(currencyB, chainId)?.address ?? '',
    //     parsedAmountA.raw.toString(),
    //     parsedAmountB.raw.toString(),
    //     amountsMin[Field.CURRENCY_A].toString(),
    //     amountsMin[Field.CURRENCY_B].toString(),
    //     account,
    //     deadline.toHexString()
    //   ]
    //   value = null
    // }
    // setAttemptingTxn(true)
    // await estimate(...args, value ? { value } : {})
    //   .then(estimatedGasLimit =>
    //     method(...args, {
    //       ...(value ? { value } : {}),
    //       gasLimit: calculateGasMargin(estimatedGasLimit)
    //     }).then(response => {
    //       setAttemptingTxn(false)
    //       addTransaction(response, {
    //         summary:
    //           'Add ' +
    //           parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
    //           ' ' +
    //           currencyA?.symbol +
    //           ' and ' +
    //           parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
    //           ' ' +
    //           currencyB?.symbol
    //       })
    //       setTxHash(response.hash)
    //     })
    //   )
    //   .catch(error => {
    //     setAttemptingTxn(false)
    //     // we only care if the error is something _other_ than the user rejected the tx
    //     if (error?.code !== 4001) {
    //       console.error(error)
    //     }
    //   })
  }

  const modalHeader = () => {
    return (
      <>
        <AutoColumn gap="20px">
          <RowFlat style={{ marginTop: '20px' }}>
            <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
              {/* {liquidityMinted?.toSignificant(6)} */}
            </Text>
            {/* <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} size={30} /> */}
          </RowFlat>
          <Row>
            <Text fontSize="24px">{currencyA?.symbol + '/' + currencyB?.symbol + ' Pool Tokens'}</Text>
          </Row>
          <TYPE.italic fontSize={12} textAlign="left" padding={'8px 0 0 0 '}>
            {`Output is estimated. If the price changes by more than ${allowedSlippage /
              100}% your transaction will revert.`}
          </TYPE.italic>
        </AutoColumn>
      </>
    )
  }

  const modalBottom = () => {
    return (
      // <ConfirmAddModalBottom
      //   price={price}
      //   currencies={currencies}
      //   parsedAmounts={parsedAmounts}
      //   noLiquidity={noLiquidity}
      //   onAdd={onAdd}
      //   poolTokenPercentage={poolTokenPercentage}
      // />
      <></>
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
                title={'You will receive'}
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
            <RedeemTokenPanel
              value={callTypedAmount ?? ''}
              onUserInput={setCallTypedAmount}
              label="Call Token"
              onMax={() => {
                console.log(maxAmountSpend(tryParseAmount(balances?.callBalance))?.toExact() ?? '')
              }}
              currency={currencyA}
              // currencyBalance={JSBI.BigInt(balances?.putBalance)}
              currencyBalance={parstBalance(balances?.callBalance)}
            />
            <ColumnCenter>
              <Plus size="28" color={theme.text2} />
            </ColumnCenter>
            <RedeemTokenPanel
              value={putTypedAmount ?? ''}
              onUserInput={setPutTypedAmount}
              label="Put Token"
              onMax={() => {
                console.log(maxAmountSpend(tryParseAmount(balances?.putBalance))?.toExact() ?? '')
              }}
              currency={currencyB}
              negativeMarginTop="-25px"
              // currencyBalance={JSBI.BigInt(balances?.putBalance)}
              currencyBalance={parstBalance(balances?.putBalance)}
            />
            {currencyA && currencyB && (
              <GenerateBar cardTitle={`You will receive`} currency0={currencyA} currency1={currencyB} />
            )}

            {!account ? (
              <ButtonPrimary onClick={toggleWalletModal}>Connect Wallet</ButtonPrimary>
            ) : (
              <AutoColumn gap={'md'}>
                <ButtonError
                  onClick={() => {
                    expertMode ? onAdd() : setShowConfirm(true)
                  }}
                  disabled={!isValid}
                >
                  <Text fontSize={16} fontWeight={500}>
                    {error ?? 'Redeem'}
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
