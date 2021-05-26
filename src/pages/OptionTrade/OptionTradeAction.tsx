import React, { useCallback, useState } from 'react'
import { ChevronLeft } from 'react-feather'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import OptionSwap from './OptionSwap'
import AppBody from 'pages/AppBody'
import { CustomLightSpinner, ExternalLink, TYPE } from 'theme'
import Liquidity from './Liquidity'
import useTheme from 'hooks/useTheme'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { ButtonEmpty } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { USDT } from '../../constants'
import { useCurrency } from 'hooks/Tokens'
import { currencyId } from 'utils/currencyId'
import { OptionIcon } from 'components/Icons'
import { OptionInterface } from './'
import Loader from 'assets/svg/gray_loader.svg'
import CurrencyLogo from 'components/CurrencyLogo'
import { getEtherscanLink } from 'utils'
import { useActiveWeb3React } from 'hooks'
import { ChainId, WETH } from '@uniswap/sdk'
import { useDerivedMintInfo } from 'state/mint/hooks'

const Wrapper = styled.div`
  min-height: calc(100vh - ${({ theme }) => theme.headerHeight});
  width: 100%;
  padding: 0 160px;
`

const ActionWrapper = styled.div`
  margin-top: 10px;
`

const Elevate = styled.div`
  z-index: 2;
  height: 100%;
`

const SwitchTabWrapper = styled.div`
  display: flex;
  margin-bottom: -1px;
  margin-left: -1px;
  flex-direction: row-reverse;
  justify-content: flex-end;
`

const Circle = styled.div`
  margin-right: 16px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.bg5};
  background-color: ${({ theme }) => theme.bg4};
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
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

export const StyledExternalLink = styled(ExternalLink)`
  text-decoration: none;
  font-size: 12px;
  color: ${({ theme }) => theme.text3};
  :hover {
    color: ${({ theme }) => theme.text4};
  }
`

enum TABS {
  SWAP = 'swap',
  LIQUIDITY = 'liquidity',
  INFO = 'info'
}

export default function OptionTradeAction({ addressA, option }: { addressA?: string; option?: OptionInterface }) {
  const { chainId } = useActiveWeb3React()
  const [tab, setTab] = useState(TABS.SWAP)

  const theme = useTheme()
  const history = useHistory()

  const currencyA = chainId === ChainId.MAINNET ? USDT : chainId && WETH[chainId]
  const currencyB = useCurrency(addressA)
  const underlyingCurrency = useCurrency(option?.underlyingAddress ?? undefined)
  const { pair } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

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
              <RowFixed>
                <Circle>
                  <OptionIcon
                    tokenIcon={<CurrencyLogo currency={underlyingCurrency ?? undefined} size="20px" />}
                    type={option.type}
                    size="20px"
                  />
                </Circle>
                <TYPE.subHeader fontSize={24} fontWeight={500}>
                  {option.title}
                </TYPE.subHeader>
              </RowFixed>
              {currencyB && chainId && (
                <StyledExternalLink href={getEtherscanLink(chainId, currencyId(currencyB), 'token')}>
                  {currencyId(currencyB)}
                </StyledExternalLink>
              )}
            </AutoColumn>

            <div />
          </RowBetween>
          <AutoRow justify="center">
            <ActionWrapper>
              <SwitchTab tab={tab} setTab={handleSetTab} />
              <AppBody
                maxWidth="1114px"
                style={{ padding: 0, background: 'black', borderColor: theme.text5, width: 1114, overflow: 'hidden' }}
              >
                <Elevate>
                  {tab === TABS.SWAP && <OptionSwap currencyA={currencyA} currencyB={currencyB} />}
                  {tab === TABS.LIQUIDITY && <Liquidity currencyA={currencyA} currencyB={currencyB} pair={pair} />}
                  {tab === TABS.INFO && <Info option={option} />}
                </Elevate>
              </AppBody>
            </ActionWrapper>
          </AutoRow>
        </Wrapper>
      ) : (
        <AppBody style={{ minHeight: '402px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CustomLightSpinner src={Loader} alt="loader" size={'100px'} />
        </AppBody>
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
        Liquidity
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
              strokeWidth="0"
              stroke="transparent"
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

function Info({ option }: { option?: OptionInterface }) {
  const theme = useTheme()
  return (
    <AppBody
      maxWidth="1116px"
      style={{
        width: 1116,
        minHeight: '402px',
        margin: '-1px',
        borderColor: theme.text4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div>
        <TYPE.smallHeader style={{ marginBottom: 20 }}>Option Information</TYPE.smallHeader>
        <AppBody style={{ minWidth: 550, width: '50%' }}>
          <AutoColumn style={{ width: '100%' }} justify="center" gap="md">
            {option &&
              option.details &&
              Object.keys(option.details).map(key => (
                <RowBetween key={key}>
                  <TYPE.darkGray>{key}</TYPE.darkGray>
                  <TYPE.body>{option.details[key as keyof typeof option.details]}</TYPE.body>
                </RowBetween>
              ))}
          </AutoColumn>
        </AppBody>
      </div>
    </AppBody>
  )
}
