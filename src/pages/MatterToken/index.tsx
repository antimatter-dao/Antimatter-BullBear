import React from 'react'
import styled from 'styled-components'
import { LPT_TYPE } from 'constants/matterToken/matterTokenTokens'
import MatterTokenManageModal from './MatterTokenManageModal'

const Wrapper = styled.div`
  grid-template-rows: auto;
  grid-template-columns: 50% 50%;
  grid-gap: 20px;
  display: grid;
  ${({ theme }) => theme.mediaWidth.upToMedium`  grid-template-columns: 100%;`}
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
