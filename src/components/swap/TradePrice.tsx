import React from 'react'
import { CurrencyAmount, ETHER } from '@uniswap/sdk'
import { Text } from 'rebass'
import { Symbol } from '../../constants'
import { useActiveWeb3React } from '../../hooks'

interface TradePriceProps {
  currencyAmount?: CurrencyAmount
}

export default function TradePrice({ currencyAmount }: TradePriceProps) {
  const { chainId } = useActiveWeb3React()
  return (
    <Text
      fontWeight={500}
      fontSize={14}
      color={'rgba(178, 243, 85, 1)'}
      style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}
    >
      {currencyAmount ? (
        <>
          {currencyAmount.toExact().toString() ?? '-'}{' '}
          {currencyAmount.currency === ETHER ? Symbol[chainId ?? 1] : currencyAmount.currency.symbol}
        </>
      ) : (
        '-'
      )}
    </Text>
  )
}
