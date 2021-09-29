import { CurrencyAmount, currencyEquals, ETHER, Trade } from '@uniswap/sdk'
import React, { useCallback, useMemo } from 'react'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent
} from '../TransactionConfirmationModal'
import SwapModalFooter from './SwapModalFooter'
import SwapModalHeader from './SwapModalHeader'
import { Auction } from '../../state/swap/actions'
import { OptionPrice } from '../../state/market/hooks'
import { Symbol } from '../../constants'
import { useActiveWeb3React } from '../../hooks'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

export default function ConfirmSwapModal({
  auction,
  optionPrice,
  optionCurrencyAmount,
  payTitle,
  payCurrencyAmount,
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash
}: {
  auction: Auction
  optionPrice: OptionPrice | undefined
  optionCurrencyAmount: CurrencyAmount | undefined
  payTitle: string
  payCurrencyAmount: CurrencyAmount | undefined
  isOpen: boolean
  trade: Trade | undefined
  originalTrade: Trade | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  allowedSlippage: number
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: string | undefined
  onDismiss: () => void
}) {
  const { chainId } = useActiveWeb3React()
  const payCurrencySymbol =
    payCurrencyAmount?.currency === ETHER ? Symbol[chainId ?? 1] : payCurrencyAmount?.currency.symbol

  const showAcceptChanges = useMemo(
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )

  const modalHeader = useCallback(() => {
    return auction && optionCurrencyAmount && payCurrencyAmount ? (
      <SwapModalHeader
        optionPrice={optionPrice}
        auction={auction}
        optionCurrencyAmount={optionCurrencyAmount}
        payTitle={payTitle}
        payCurrencyAmount={payCurrencyAmount}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [auction, onAcceptChanges, optionCurrencyAmount, optionPrice, payCurrencyAmount, payTitle, showAcceptChanges])

  const modalBottom = useCallback(() => {
    return (
      <SwapModalFooter
        onConfirm={onConfirm}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
        allowedSlippage={allowedSlippage}
      />
    )
  }, [allowedSlippage, onConfirm, showAcceptChanges, swapErrorMessage])

  // text to show while loading
  const pendingText = `Swapping ${
    auction === Auction.BUY ? payCurrencyAmount?.toSignificant(6) : optionCurrencyAmount?.toSignificant(6)
  } ${auction === Auction.BUY ? payCurrencySymbol : optionCurrencyAmount?.currency.symbol} for ${
    auction === Auction.BUY ? optionCurrencyAmount?.toSignificant(6) : payCurrencyAmount?.toSignificant(6)
  } ${auction === Auction.BUY ? optionCurrencyAmount?.currency.symbol : payCurrencySymbol}`

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title="Confirm Option Trading"
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      currencyToAdd={optionCurrencyAmount?.currency}
    />
  )
}
