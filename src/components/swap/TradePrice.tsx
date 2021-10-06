import React from 'react'
import { CurrencyAmount } from '@uniswap/sdk'
import { Text } from 'rebass'

interface TradePriceProps {
  currencyAmount?: CurrencyAmount
}

export default function TradePrice({ currencyAmount }: TradePriceProps) {
  return (
    <Text
      fontWeight={500}
      fontSize={14}
      color={'rgba(178, 243, 85, 1)'}
      style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}
    >
      {currencyAmount ? (
        <>
          ~ {currencyAmount.toExact().toString() ?? '-'} {currencyAmount.currency.symbol}
        </>
      ) : (
        '-'
      )}
    </Text>
  )
}
