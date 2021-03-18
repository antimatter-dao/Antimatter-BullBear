import { Currency, Percent, Price } from '@uniswap/sdk'
import React, { useContext } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import { ONE_BIPS } from '../../constants'
import { Field } from '../../state/mint/actions'
import { TYPE } from '../../theme'

export function PoolPriceBar({
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price
}: {
  currencies: { [field in Field]?: Currency }
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  price?: Price
}) {
  const theme = useContext(ThemeContext)
  return (
    <AutoColumn gap="md">
      <AutoRow justify="space-around" gap="2px">
        <AutoRow justify="space-between">
          <Text fontWeight={500} fontSize={12} color={theme.text3}>
            {currencies[Field.CURRENCY_B]?.symbol} per {currencies[Field.CURRENCY_A]?.symbol}
          </Text>
          <TYPE.black fontSize={12}>{price?.toSignificant(6) ?? '-'}</TYPE.black>
        </AutoRow>
        <AutoRow justify="space-between">
          <Text fontWeight={500} fontSize={12} color={theme.text3}>
            {currencies[Field.CURRENCY_A]?.symbol} per {currencies[Field.CURRENCY_B]?.symbol}
          </Text>
          <TYPE.black fontSize={12}>{price?.invert()?.toSignificant(6) ?? '-'}</TYPE.black>
        </AutoRow>
        <AutoRow justify="space-between">
          <Text fontWeight={500} fontSize={12} color={theme.text3}>
            Share of Pool
          </Text>
          <TYPE.black fontSize={12}>
            {noLiquidity && price
              ? '100'
              : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
            %
          </TYPE.black>
        </AutoRow>
      </AutoRow>
    </AutoColumn>
  )
}
