import React, { useCallback, useContext, useMemo, useState } from 'react'
import { TokenAmount } from '@uniswap/sdk'
import { Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonError, ButtonOutlined, ButtonPrimary } from '../../components/Button'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CallOrPutInputPanel from '../../components/CallOrPutInputPanel'
import { MarketStrategyTabs } from '../../components/NavigationTabs'
import { RowBetween } from '../../components/Row'
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
import ButtonSelect from '../../components/Button/ButtonSelect'
import { tryParseAmount } from '../../state/swap/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { useAntimatterContract } from '../../hooks/useContract'
import { GenerateBar } from '../../components/MarketStrategy/GenerateBar'
import { isNegative, parseBalance } from '../../utils/marketStrategyUtils'
import { OptionField } from '../Swap'

export default function Generate({
  match: {
    params: { optionTypeIndex }
  }
}: RouteComponentProps<{ optionTypeIndex?: string }>) {
  const option = useOption(optionTypeIndex)
  // const [optionType, setOptionType] = useState('')
  const [callTyped, setCallTyped] = useState<string>()
  const [putTyped, setPutTyped] = useState<string>()

  const theme = useContext(ThemeContext)

  const { account, chainId, library } = useActiveWeb3React()

  const antimatterContract = useAntimatterContract()
  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()

  const { delta } = useDerivedStrategyInfo(option, callTyped ?? undefined, putTyped ?? undefined)

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // // txn values
  // const deadline = useTransactionDeadline() // custom from users settings
  const [txHash, setTxHash] = useState<string>('')

  const parsedAmounts = {
    [OptionField.CALL]: tryParseAmount(callTyped, option?.call?.token),
    [OptionField.PUT]: tryParseAmount(putTyped, option?.put?.token)
  }

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    tryParseAmount(delta?.totalUnd.toString(), option?.underlying ?? undefined),
    chainId ? ANTIMATTER_ADDRESS : undefined
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    tryParseAmount(delta?.totalCur.toString(), option?.currency ?? undefined),
    chainId ? ANTIMATTER_ADDRESS : undefined
  )

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
    console.log('args--->', ...args)
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
            putTyped={putTyped}
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
              {optionName}
            </ButtonSelect>
            <CallOrPutInputPanel
              value={callTyped ?? ''}
              onUserInput={setCallTyped}
              currency={option?.call?.token || undefined}
              id="generate-output-token"
              showCommonBases
              defaultSymbol={option?.call?.token.symbol}
              halfWidth={true}
              isCall={true}
            />
            <ColumnCenter>
              <Plus size="28" color={theme.text2} />
            </ColumnCenter>
            <CallOrPutInputPanel
              value={putTyped ?? ''}
              onUserInput={setPutTyped}
              currency={option?.put?.token || undefined}
              id="generate-output-token"
              showCommonBases
              halfWidth={true}
              defaultSymbol={option?.put?.token.symbol}
              negativeMarginTop={'-20px'}
              isCall={false}
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
                {(approvalA === ApprovalState.NOT_APPROVED ||
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
                  disabled={approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                  error={!callTyped && !putTyped}
                >
                  <Text fontSize={16} fontWeight={500}>
                    {'Generate'}
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
