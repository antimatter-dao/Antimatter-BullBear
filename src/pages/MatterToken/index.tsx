import React from 'react'
import styled from 'styled-components'
import { LPT_TYPE } from 'constants/matterToken/matterTokenTokens'
import MatterTokenManageModal from './MatterTokenManageModal'

const Wrapper = styled.div`
  width: 100%;
  padding: 50px 100px
  grid-template-rows: auto;
  grid-template-columns: repeat(auto-fill, 495px);
  grid-gap: 30px;
  display: grid;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 100%;
    padding:0
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
