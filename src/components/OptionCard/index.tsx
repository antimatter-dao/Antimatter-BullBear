import React from 'react'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import { ButtonSecondary } from '../Button'
import { RowBetween, RowFixed } from '../Row'
import styled from 'styled-components'
import Card from '../Card'
import { darken } from 'polished'
import { OptionTypeData } from '../../state/market/hooks'
import { parseBalance } from '../../utils/marketStrategyUtils'
import { useCurrency } from '../../hooks/Tokens'
import AntimatterCurrencyLogo from '../CurrencyLogo/AntimatterCurrencyLogo'
import { ChainId, Token, WETH } from '@uniswap/sdk'

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  padding: 0.25rem 1.25rem;
  background-color: rgba(255, 255, 255, 0.08);
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`

interface OptionCardProps {
  optionType: OptionTypeData
}

export function OptionCard({ optionType }: OptionCardProps) {
  const currencyUnderlying = useCurrency(optionType?.callAddress)
  const currencyCurrency = useCurrency(optionType?.putAddress)
  const currencyToken = new Token(1, optionType.currency, Number(optionType.currencyDecimals ?? '0'))
  return (
    <>
      <HoverCard>
        <RowBetween>
          <RowFixed>
            {/*<DoubleCurrencyLogo currency0={currencyCall} currency1={currencyPut} margin={true} size={20} />*/}
            <AntimatterCurrencyLogo currency={currencyUnderlying ?? undefined} />
            <Text fontWeight={500} fontSize={16} style={{ marginLeft: '12px' }}>
              {`+${optionType.underlyingSymbol ?? '-'}($${parseBalance({
                val: optionType.priceFloor,
                token: currencyToken
              })})`}
            </Text>
          </RowFixed>

          <RowFixed>
            <Text fontWeight={500} fontSize={16} style={{ minWidth: 'unset', marginRight: 12 }}>
              {`${parseBalance({ val: optionType.callBalance, token: WETH[ChainId.MAINNET] })}`}
            </Text>
            <ButtonSecondary
              style={{ backgroundColor: 'transparent' }}
              as={Link}
              to={`/swap?inputCurrency=${optionType.callAddress}`}
            >
              Trade
            </ButtonSecondary>
          </RowFixed>
        </RowBetween>
      </HoverCard>
      <HoverCard>
        <RowBetween>
          <RowFixed>
            {/*<DoubleCurrencyLogo currency0={currencyCall} currency1={currencyPut} margin={true} size={20} />*/}
            <AntimatterCurrencyLogo currency={currencyCurrency ?? undefined} />
            <Text fontWeight={500} fontSize={16} style={{ marginLeft: '12px' }}>
              {`-${optionType.underlyingSymbol ?? '-'}($${parseBalance({
                val: optionType.priceCap,
                token: currencyToken
              })})`}
            </Text>
          </RowFixed>

          <RowFixed>
            <Text fontWeight={500} fontSize={16} style={{ minWidth: 'unset', marginRight: 12 }}>
              {`${parseBalance({
                val: optionType.putBalance,
                token: WETH[ChainId.MAINNET]
              })}`}
            </Text>
            <ButtonSecondary
              style={{ backgroundColor: 'transparent' }}
              as={Link}
              to={`/swap?inputCurrency=${optionType.putAddress}`}
            >
              Trade
            </ButtonSecondary>
          </RowFixed>
        </RowBetween>
      </HoverCard>
    </>
  )
}
