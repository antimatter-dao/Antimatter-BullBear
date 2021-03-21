import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk'
import React from 'react'
import { Text } from 'rebass'
import { ButtonPrimary } from '../../components/Button'
import { RowFixed } from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import { Field } from '../../state/mint/actions'
import DataCard from 'components/Card/DataCard'

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
}) {
  return (
    <>
      <DataCard
        data={[
          {
            title: `${currencies[Field.CURRENCY_A]?.symbol} Deposited`,
            content: (
              <RowFixed>
                <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} size="16px" />
                {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
              </RowFixed>
            )
          },
          {
            title: `${currencies[Field.CURRENCY_B]?.symbol} Deposited`,
            content: (
              <RowFixed>
                <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} size="16px" />
                {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
              </RowFixed>
            )
          },
          {
            title: 'Rates',
            content: `1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
              currencies[Field.CURRENCY_B]?.symbol
            }`
          },
          {
            title: '',
            content: `1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
              currencies[Field.CURRENCY_A]?.symbol
            }`
          },
          { title: 'Share of Pool:', content: noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4) }
        ]}
      />
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        <Text fontWeight={500} fontSize={16}>
          {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
        </Text>
      </ButtonPrimary>
    </>
  )
}
