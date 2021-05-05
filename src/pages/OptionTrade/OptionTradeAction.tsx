import React, { useCallback, useState } from 'react'
import { ChevronLeft } from 'react-feather'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import Swap from '../Swap'
import AppBody from 'pages/AppBody'
import { TYPE } from 'theme'
import AddLiquidity from 'pages/AddLiquidity'
import useTheme from 'hooks/useTheme'
import { AutoRow, RowBetween } from 'components/Row'
import { ButtonEmpty } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { USDT } from '../../constants'
import { useCurrency } from 'hooks/Tokens'
import { currencyId } from 'utils/currencyId'
import { OptionIcon } from 'components/Icons'
import { Option } from './'

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
    stroke: ${({ theme, selected }) => (selected ? theme.text4 : theme.text5)};
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
    color: ${({ selected, theme }) => (selected ? theme.text1 : theme.text3)};
  };

`
enum TABS {
  SWAP = 'swap',
  LIQUIDITY = 'liquidity',
  INFO = 'info'
}

export default function OptionTradeAction({ addressA, option }: { addressA?: string; option?: Option }) {
  const [tab, setTab] = useState(TABS.SWAP)
  const theme = useTheme()
  const history = useHistory()
  const currencyA = USDT
  const currencyB = useCurrency(addressA)

  const handleSetTab = useCallback((tab: TABS) => setTab(tab), [setTab])
  const handleBack = useCallback(() => history.push('/option_trading'), [history])
  return (
    <>
      {option ? (
        <Wrapper>
          <RowBetween style={{ padding: '27px 0' }}>
            <ButtonEmpty width="auto" color={theme.text1} onClick={handleBack}>
              <ChevronLeft />
              Go Back
            </ButtonEmpty>
            <AutoColumn justify="center" gap="8px">
              <TYPE.subHeader fontSize={24} fontWeight={500}>
                <OptionIcon tokenIcon={option.icon} type={option.type} />
                {option.title}
              </TYPE.subHeader>
              <TYPE.smallGray>{currencyB && currencyId(currencyB)}</TYPE.smallGray>
            </AutoColumn>
            <div />
          </RowBetween>
          <AutoRow justify="center">
            <div>
              <SwitchTab tab={tab} setTab={handleSetTab} />
              <AppBody
                maxWidth="1114px"
                style={{ padding: 0, background: 'black', minHeight: '400px', borderColor: theme.text5, width: 1114 }}
              >
                <Elevate>
                  {tab === TABS.SWAP && <Swap currencyA={currencyA} currencyB={currencyB}></Swap>}
                  {tab === TABS.LIQUIDITY && <AddLiquidity currencyA={currencyA} currencyB={currencyB} />}
                  {tab === TABS.INFO && (
                    <AppBody
                      maxWidth="1116px"
                      style={{ width: 1116, minHeight: '402px', margin: '-1px', borderColor: theme.text4 }}
                    >
                      <span></span>
                    </AppBody>
                  )}
                </Elevate>
              </AppBody>
            </div>
          </AutoRow>
        </Wrapper>
      ) : (
        <AppBody>Option not available</AppBody>
      )}
    </>
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
