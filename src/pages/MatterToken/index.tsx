import React from 'react'
import { AutoColumn } from 'components/Column'
import { LPT_TYPE } from 'constants/matterToken/matterTokenTokens'
import MatterTokenManageModal from './MatterTokenManageModal'

export default function MatterToken() {
  return (
    <AutoColumn gap="4rem">
      {Object.keys(LPT_TYPE).map(lpt => (
        <MatterTokenManageModal lptType={LPT_TYPE[lpt as keyof typeof LPT_TYPE]} />
      ))}
    </AutoColumn>
  )
}
