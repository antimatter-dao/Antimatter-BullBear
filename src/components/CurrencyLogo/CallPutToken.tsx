import React from 'react'
import { Currency } from '@uniswap/sdk'
import styled from 'styled-components'
import CurrencyLogo from './'
import { ReactComponent as CallIcon } from '../../assets/svg/call_icon.svg'
import { ReactComponent as PutIcon } from '../../assets/svg/put_icon.svg'

const StyledCallIcon = styled(CallIcon)`
position:absolute
bottom:-2px;
right:-2px
`

const StyledPutIcon = styled(PutIcon)`
position:absolute
bottom:-2px;
right:-2px
`

export default function CallPutToken({
  currency,
  isCall,
  size = '24px'
}: {
  currency: Currency
  isCall: boolean
  size?: string
}) {
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex' }}>
      <CurrencyLogo currency={currency} size={size}></CurrencyLogo>
      {isCall ? <StyledCallIcon /> : <StyledPutIcon />}
    </div>
  )
}
