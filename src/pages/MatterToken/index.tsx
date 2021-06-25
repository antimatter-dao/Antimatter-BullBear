import React from 'react'
import styled from 'styled-components'
import { LPT_TYPE } from 'constants/matterToken/matterTokenTokens'
import MatterTokenManageModal, { cardWidth } from './MatterTokenManageModal'

const Wrapper = styled.div`
  width: 100%;
  padding: 50px;
  grid-template-rows: 340px;
  grid-template-columns: repeat(auto-fill, ${cardWidth});
  grid-gap: 20px;
  display: grid;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 100%;
    padding:0
  `}
  justify-content: center;
  margin-bottom: auto;
  ${({ theme }) => theme.mediaWidth.upToLarge`
  padding-bottom: 100px
`}
`
export default function MatterToken() {
  return (
    <Wrapper>
      {Object.keys(LPT_TYPE).map(lpt => (
        <MatterTokenManageModal key={lpt} lptType={LPT_TYPE[lpt as keyof typeof LPT_TYPE]} />
      ))}
    </Wrapper>
  )
}
