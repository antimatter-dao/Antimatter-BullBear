import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk'
import React from 'react'
import { Text } from 'rebass'
import { ButtonPrimary } from '../../components/Button'
import { RowBetween, RowFixed } from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import { Field } from '../../state/mint/actions'
import { TYPE } from '../../theme'
import useTheme from 'hooks/useTheme'
import { OutlineCard } from 'components/Card'
import { AutoColumn } from 'components/Column'

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
  const theme = useTheme()
  return (
    <>
      <OutlineCard style={{ backgroundColor: 'rgba(0,0,0,.2)' }}>
        <AutoColumn gap="8px" style={{ color: theme.text1 }}>
          <RowBetween>
            <TYPE.small color={theme.text3}>{currencies[Field.CURRENCY_A]?.symbol} Deposited</TYPE.small>
            <RowFixed>
              <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} size="16px" />
              <TYPE.small>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</TYPE.small>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <TYPE.small color={theme.text3}>{currencies[Field.CURRENCY_B]?.symbol} Deposited</TYPE.small>
            <RowFixed>
              <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} size="16px" />
              <TYPE.small>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</TYPE.small>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <TYPE.small color={theme.text3}>Rates</TYPE.small>
            <TYPE.small>
              {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
                currencies[Field.CURRENCY_B]?.symbol
              }`}
            </TYPE.small>
          </RowBetween>
          <RowBetween style={{ justifyContent: 'flex-end' }}>
            <TYPE.small>
              {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
                currencies[Field.CURRENCY_A]?.symbol
              }`}
            </TYPE.small>
          </RowBetween>
          <RowBetween>
            <TYPE.small color={theme.text3}>Share of Pool:</TYPE.small>
            <TYPE.small>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</TYPE.small>
          </RowBetween>
        </AutoColumn>
      </OutlineCard>
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        <Text fontWeight={500} fontSize={16}>
          {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
        </Text>
      </ButtonPrimary>
    </>
  )
}
