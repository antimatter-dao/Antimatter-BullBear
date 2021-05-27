import { Currency } from '@uniswap/sdk'
import React from 'react'
import styled from 'styled-components'
import CurrencyLogo from '../CurrencyLogo'

const Wrapper = styled.div<{ mr?: string; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  width: ${({ sizeraw }) => sizeraw * 1.68 + 'px'};
  margin-right: ${({ mr }) => mr ?? 0};
`

interface DoubleCurrencyLogoProps {
  mr?: string
  size?: number
  currency0?: Currency
  currency1?: Currency
}

const HigherLogo = styled(CurrencyLogo)`
  z-index: 1;
`
const CoveredLogo = styled(CurrencyLogo)<{ sizeraw: number }>`
  position: absolute;
  left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

export default function DoubleCurrencyLogoReverse({ currency0, currency1, size = 16, mr }: DoubleCurrencyLogoProps) {
  return (
    <Wrapper sizeraw={size} mr={mr}>
      {currency0 && <HigherLogo currency={currency0} size={size.toString() + 'px'} style={{ zIndex: 2 }} />}
      {currency1 && (
        <CoveredLogo
          currency={currency1}
          size={size.toString() + 'px'}
          sizeraw={size}
          style={{ position: 'absolute', left: size * 0.67 + 'px', top: 0 }}
        />
      )}
    </Wrapper>
  )
}
