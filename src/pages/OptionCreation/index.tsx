import React, { useState } from 'react'
import styled from 'styled-components'
import { ButtonOutlinedPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import { RowBetween } from '../../components/Row'
import Creation from './Creation'
import Pool from '../Pool'

enum TAB {
  CREATION = 'Option Creation',
  LIQUIDITY = 'Liquidity'
}

const TabButton = styled(ButtonOutlinedPrimary)<{ active?: boolean }>`
  border: 1px solid #b2f355;
  opacity: ${({ active }) => (active ? '1' : '0.5')};
  width: 264px;
  height: 48px;
`
const Wrapper = styled(AutoColumn)`
  margin-top: 100px;
  width: 560px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 60px;
    width: 100%;
    margin-bottom: 100px;
  `}
`

export default function OptionCreation() {
  const [curTab, setCurTab] = useState(TAB.CREATION)

  return (
    <Wrapper gap={'28px'}>
      <RowBetween>
        <TabButton
          onClick={() => {
            setCurTab(TAB.CREATION)
          }}
          active={curTab === TAB.CREATION}
        >
          {TAB.CREATION}
        </TabButton>
        <TabButton
          onClick={() => {
            setCurTab(TAB.LIQUIDITY)
          }}
          active={curTab === TAB.LIQUIDITY}
        >
          {TAB.LIQUIDITY}
        </TabButton>
      </RowBetween>

      {curTab === TAB.CREATION && <Creation />}
      {curTab === TAB.LIQUIDITY && <Pool />}
    </Wrapper>
  )
}
