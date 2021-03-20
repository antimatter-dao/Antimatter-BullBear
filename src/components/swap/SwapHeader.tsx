import React from 'react'
import styled from 'styled-components'
import Settings from '../Settings'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'

const StyledSwapHeader = styled.div`
  margin-bottom: -4px;
  font-size: 22px;
  width: 100%;
  max-width: 480px;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
`

export default function SwapHeader() {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <TYPE.mediumHeader>Option Trading</TYPE.mediumHeader>
        <Settings />
      </RowBetween>
    </StyledSwapHeader>
  )
}
