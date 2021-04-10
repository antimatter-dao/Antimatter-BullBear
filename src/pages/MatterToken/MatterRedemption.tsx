import React, { useCallback, useState, useMemo } from 'react'
import { ChainId, ETHER, Token, WETH } from '@uniswap/sdk'
import { Text } from 'rebass'
import { TransactionResponse } from '@ethersproject/providers'
import { ButtonError, ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
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
import { useDerivedStrategyInfo, useMatterOption } from '../../state/market/hooks'
import { ButtonSelectStyle } from '../../components/Button/ButtonSelect'
import { tryParseAmount } from '../../state/swap/hooks'
import { TOKEN_TYPES } from '../../components/MarketStrategy/TypeRadioButton'
import { useAntimatterContract } from '../../hooks/useContract'
import { calculateGasMargin } from '../../utils'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { isNegative, parseBalance, parsedGreaterThan } from '../../utils/marketStrategyUtils'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { ANTIMATTER_ADDRESS, ZERO_ADDRESS } from '../../constants'
import { Dots } from '../../components/swap/styleds'

export default function Redeem() {
  const { account, chainId, library } = useActiveWeb3React()

  const [callTypedAmount, setCallTypedAmount] = useState<string>('')
  const [putTypedAmount, setPutTypedAmount] = useState<string>('')
  const tokenType = TOKEN_TYPES.callPut
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)

  const optionType = useMatterOption()

  const antimatterContract = useAntimatterContract()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const addTransaction = useTransactionAdder()
  const currencyA = useMarketCurrency(optionType?.underlying)
  const currencyB = useMarketCurrency(optionType?.currency)

  const { delta, error, balances } = useDerivedStrategyInfo(
    false,
    optionType ?? undefined,
    callTypedAmount ? '-' + callTypedAmount : undefined,
    putTypedAmount ? '-' + putTypedAmount : undefined,
    TOKEN_TYPES.call
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

  const [approvalA, approveACallback] = useApproveCallback(
    tryParseAmount(delta?.totalUnd.toString(), currencyA?.symbol === 'WETH' ? ETHER : currencyA ?? undefined),
    chainId ? ANTIMATTER_ADDRESS[chainId] : undefined
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    tryParseAmount(delta?.totalCur.toString(), currencyB?.symbol === 'WETH' ? ETHER : currencyB ?? undefined),
    chainId ? ANTIMATTER_ADDRESS[chainId] : undefined
  )

  // txn values
  // const deadline = useTransactionDeadline() // custom from users settings
  // const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [txHash, setTxHash] = useState<string>('')

  async function onRedeem() {
    if (!chainId || !library || !account) return

    if (!delta) {
      return
    }

    const estimate = antimatterContract?.estimateGas.burn

    const method: (...args: any) => Promise<TransactionResponse> = antimatterContract?.burn

    const args = [
      optionType?.callAddress,
      '-' + tryParseAmount(callTypedAmount ?? '0', ETHER)?.raw.toString(),
      0,
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
        tokenType={TOKEN_TYPES.call}
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
            <ButtonSelectStyle>
              <RowBetween>
                <div style={{ display: 'flex', alignItems: 'center' }}>Matter Option Token</div>
              </RowBetween>
            </ButtonSelectStyle>
            <>
              <RedeemTokenPanel
                value={callTypedAmount ?? ''}
                onUserInput={setCallTypedAmount}
                label="+Matter($1)"
                currency={currencyA}
                currencyBalance={parseBalance({ val: balances?.callBalance, token: WETH[ChainId.MAINNET] })}
                isCall={true}
              />
            </>
            {currencyA && currencyB && delta?.dCur && delta?.dUnd && (
              <GenerateBar
                cardTitle={`You will receive`}
                currency0={currencyA}
                currency1={currencyB}
                subTitle="Output Token"
                callVol={
                  delta &&
                  parseBalance({ val: delta.dUnd, token: new Token(1, ZERO_ADDRESS, currencyA.decimals ?? 18) })
                }
                putVol={
                  delta &&
                  parseBalance({ val: delta.dCur, token: new Token(1, ZERO_ADDRESS, currencyB.decimals ?? 18) })
                }
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
                            <Dots>Approving {optionType.underlyingSymbol}</Dots>
                          ) : (
                            'Approve ' + optionType.underlyingSymbol
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
                            <Dots>Approving {optionType.currencySymbol}</Dots>
                          ) : (
                            'Approve ' + optionType?.currencySymbol
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
