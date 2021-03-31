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

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

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
  return (
    <>
      <HoverCard>
        <RowBetween>
          <RowFixed>
            {/*<DoubleCurrencyLogo currency0={currencyCall} currency1={currencyPut} margin={true} size={20} />*/}
            <Text fontWeight={500} fontSize={20} style={{ marginLeft: '' }}>
              {`${optionType.underlyingSymbol ?? '-'}(${parseBalance(optionType.priceFloor)}$${parseBalance(
                optionType.priceCap
              )})Call`}
            </Text>
          </RowFixed>

          <RowFixed>
            <Text fontWeight={500} fontSize={20} style={{ minWidth: 'unset', marginRight: 12 }}>
              {`${parseBalance(optionType.callBalance, 2)}`}
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
            <Text fontWeight={500} fontSize={20} style={{ marginLeft: '' }}>
              {`${optionType.underlyingSymbol ?? '-'}(${parseBalance(optionType.priceFloor)}$${parseBalance(
                optionType.priceCap
              )})Put`}
            </Text>
          </RowFixed>

          <RowFixed>
            <Text fontWeight={500} fontSize={20} style={{ minWidth: 'unset', marginRight: 12 }}>
              {`${parseBalance(optionType.putBalance, 2)}`}
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
