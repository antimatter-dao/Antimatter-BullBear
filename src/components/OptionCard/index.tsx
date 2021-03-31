import React from 'react'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import { ButtonSecondary } from '../Button'
import { RowBetween, RowFixed } from '../Row'
import styled from 'styled-components'
import Card from '../Card'
import { darken } from 'polished'
import { OptionTypeData } from '../../state/market/hooks'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
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
    <HoverCard>
      <RowBetween>
        <FixedHeightRow>
          <RowFixed>
            {/*<DoubleCurrencyLogo currency0={currencyCall} currency1={currencyPut} margin={true} size={20} />*/}
            <Text fontWeight={500} fontSize={20} style={{ marginLeft: '' }}>
              {`${optionType.underlyingSymbol}/${optionType.currencySymbol}`}
            </Text>
          </RowFixed>
        </FixedHeightRow>

        <RowBetween marginTop="10px">
          <Text fontWeight={500} fontSize={20} style={{ marginLeft: '' }}>
            {`${optionType.underlyingSymbol}`}
          </Text>
          <ButtonSecondary style={{ backgroundColor: 'transparent' }} width="28%" as={Link} to={`/remove/v1/`}>
            Trade
          </ButtonSecondary>
        </RowBetween>
      </RowBetween>
    </HoverCard>
  )
}
