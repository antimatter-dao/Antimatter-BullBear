import { Currency, Percent, Price } from '@uniswap/sdk'
import React from 'react'
import DataCard from 'components/Card/DataCard'
import { ONE_BIPS } from '../../constants'
import { Field } from '../../state/mint/actions'

export function PoolPriceBar({
  cardTitle,
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price
}: {
  cardTitle?: string
  currencies: { [field in Field]?: Currency }
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  price?: Price
}) {
  return (
    <DataCard
      cardTitle={cardTitle}
      data={[
        {
          title: `${currencies[Field.CURRENCY_B]?.symbol} per ${currencies[Field.CURRENCY_A]?.symbol}`,
          content: price?.toSignificant(6) ?? '-'
        },
        {
          title: `${currencies[Field.CURRENCY_A]?.symbol} per ${currencies[Field.CURRENCY_B]?.symbol}`,
          content: price?.invert()?.toSignificant(6) ?? '-'
        },
        {
          title: 'Share of Pool',
          content: ` ${
            noLiquidity && price
              ? '100'
              : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'
          }
          %`
        }
      ]}
    />
  )
}
