import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Swap from '../Swap'
import AppBody from 'pages/AppBody'
import { TYPE } from 'theme'
import AddLiquidity from 'pages/AddLiquidity'

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  padding: 0 160px;
`

const Elevate = styled.div`
  z-index: 2;
`

const SwitchTabWrapper = styled.div`
  display: flex;
  margin-bottom: -1px;
  margin-left: -1px;
  flex-direction: row-reverse;
  justify-content: flex-end;
`

const TabStyle = styled.button<{ selected?: boolean; isFirstChild?: boolean }>`
  outline: none
  border:none;
  background: none;
  position: relative;
  min-width: ${({ isFirstChild }) => (isFirstChild ? '157px' : '229px')};
  padding: 0;
  height: 42px;
  margin-left:${({ isFirstChild }) => (isFirstChild ? '0' : '-74px')};
  svg {
    z-index:${({ selected }) => (selected ? '2' : '0')}
    position: absolute;
    top: ${({ selected }) => (selected ? '0' : '-1px')};
    left: 0;
    stroke: ${({ theme }) => theme.text5};
    fill:${({ selected, theme, isFirstChild }) => (selected ? '#141414' : isFirstChild ? 'transparent' : theme.bg1)}
    stroke-width: 1px;
  }
  div{
    z-index: 2;
    position: absolute;
    line-height: 41px;
    text-align: center
    top: 0;
    left:${({ isFirstChild }) => (isFirstChild ? '50px' : '90px')};
    color: #FFFFFF
  };

`
enum TABS {
  SWAP = 'swap',
  LIQUIDITY = 'liquidity',
  INFO = 'info'
}

export default function OptionTrade() {
  const [tab, setTab] = useState(TABS.SWAP)
  const handleSetTab = useCallback((tab: TABS) => setTab(tab), [setTab])
  return (
    <Wrapper>
      <SwitchTab tab={tab} setTab={handleSetTab} />
      <AppBody maxWidth="100%" style={{ padding: 0, background: 'black', minHeight: '400px' }}>
        <Elevate>
          {tab === TABS.SWAP && <Swap></Swap>}
          {tab === TABS.LIQUIDITY && <AddLiquidity />}
        </Elevate>
      </AppBody>
    </Wrapper>
  )
}

function SwitchTab({ tab, setTab }: { tab: TABS; setTab: (tab: TABS) => void }) {
  const swapClick = useCallback(() => setTab(TABS.SWAP), [setTab])
  const liquidityClick = useCallback(() => setTab(TABS.LIQUIDITY), [setTab])
  const infoClick = useCallback(() => setTab(TABS.INFO), [setTab])
  return (
    <SwitchTabWrapper>
      <Tab onClick={infoClick} selected={tab === TABS.INFO}>
        Info
      </Tab>
      <Tab onClick={liquidityClick} selected={tab === TABS.LIQUIDITY}>
        Liqidity
      </Tab>
      <Tab isFirstChild={true} onClick={swapClick} selected={tab === TABS.SWAP}>
        Swap
      </Tab>
    </SwitchTabWrapper>
  )
}
function Tab({
  isFirstChild,
  selected,
  children,
  onClick
}: {
  isFirstChild?: boolean
  selected?: boolean
  children: string
  onClick: () => void
}) {
  return (
    <TabStyle selected={selected} isFirstChild={isFirstChild} onClick={onClick}>
      {isFirstChild ? (
        <svg width="157" height="76" viewBox="0 0 157 76" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M157 42V42C150.187 42 143.885 38.3867 140.443 32.5068L127.793 10.8964C124.205 4.76683 117.635 1 110.533 1H33C15.3269 1 1 15.3269 1 33V76" />
          {!selected && (
            <path
              d="M157 42V42C150.187 42 143.885 38.3867 140.443 32.5068L127.793 10.8964C124.205 4.76683 117.635 1 110.533 1H33C15.3269 1 1 15.3269 1 33V42"
              fill="#000000"
            />
          )}
        </svg>
      ) : (
        <svg width="229" height="43" viewBox="0 0 229 43" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 42H12.8469C25.0603 42 36.2086 35.0479 41.5827 24.0804L44.1114 18.9196C49.4854 7.95208 60.6338 1 72.8472 1H161.754C169.37 1 176.325 5.32574 179.693 12.157L188.904 30.843C192.272 37.6742 199.227 42 206.843 42H228.5" />
        </svg>
      )}
      <TYPE.smallHeader fontSize={18}>{children}</TYPE.smallHeader>
    </TabStyle>
  )
}
