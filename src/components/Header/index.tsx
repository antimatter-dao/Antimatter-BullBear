import { ChainId, TokenAmount } from '@uniswap/sdk'
import React from 'react'
import { Check, ChevronDown } from 'react-feather'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
// import { useTranslation } from 'react-i18next'
import { darken } from 'polished'
import { CountUp } from 'use-count-up'
import { useActiveWeb3React } from '../../hooks'
import { useAggregateUniBalance } from '../../state/wallet/hooks'
import { ExternalLink, TYPE } from '../../theme'
import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import ClaimModal from '../claim/ClaimModal'
import usePrevious from '../../hooks/usePrevious'
import { ReactComponent as Logo } from '../../assets/svg/antimatter_logo.svg'
import { ReactComponent as ETH } from '../../assets/svg/eth_logo.svg'
import { ReactComponent as HECOInvert } from '../../assets/svg/huobi_inverted.svg'
import { ReactComponent as HECO } from '../../assets/svg/huobi.svg'
import useTheme from 'hooks/useTheme'

interface TabContent {
  title: string
  route?: string
  link?: string
  titleContent?: JSX.Element
}
interface Tab extends TabContent {
  subTab?: TabContent[]
}

const tabs: Tab[] = [
  { title: 'Option Trading', route: 'option_trading' },
  { title: 'Option Exercise', route: 'option_exercise' },
  { title: 'Option Creation', route: 'option_creation' },
  { title: 'Farm', route: 'farm' },
  { title: 'Governance', route: 'governance' },
  {
    title: 'About',
    subTab: [
      { title: 'Docs', link: 'https://docs.antimatter.finance/' },
      { title: 'Github', link: 'https://github.com/antimatter-finance' },
      {
        title: 'Auditing Report',
        link: 'https://github.com/antimatter-finance/antimatter-finance.github.io/blob/main/audit_en.pdf'
      },
      {
        title: 'faq',
        titleContent: <FAQButton />,
        route: 'faq'
      }
    ]
  }
]

const NetworkInfo: {
  [key: number]: { title: string; color: string; icon: JSX.Element; link?: string; linkIcon?: JSX.Element }
} = {
  1: {
    color: '#FFFFFF',
    icon: <ETH />,
    link: 'https://app.antimatter.finance',
    title: 'ETH'
  },
  [ChainId.ROPSTEN]: {
    color: '#FFFFFF',
    icon: <ETH />,
    title: 'Ropsten'
  },
  [ChainId.RINKEBY]: {
    color: '#FFFFFF',
    icon: <ETH />,
    title: 'Rinkeby'
  },
  128: {
    color: '#059BDC',
    icon: <HECOInvert />,
    linkIcon: <HECO />,
    link: 'https://heco.antimatter.finance',
    title: 'HECO'
  }
  // 56: {
  //   color: '#F0B90B',
  //   icon: <BSCInvert />,
  //   linkIcon: <BSC />,
  //  title:'BSC'
  // }
}

export const headerHeightDisplacement = '32px'

const HeaderFrame = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  border-bottom: 1px solid ${({ theme }) => theme.text5};
  padding: 27px 50px 0;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: calc(100%);
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  justify-self: flex-end;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: ${({ theme }) => theme.headerHeight};
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    justify-self: center;
    width: 100%;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 99;
    border-radius: 12px 12px 0 0;
    background-color: ${({ theme }) => theme.bg1};
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  justify-content: center;
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.bg3};
  `}
`

const HeaderElement = styled.div<{
  show?: boolean
}>`
  display: flex;

  /* addresses safari's lack of support for "gap" */
  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: center;
  `};
  & > div {
    border: 1px solid ${({ theme, show }) => (show ? theme.text1 : 'transparent')};
    border-radius: 4px;
    height: 32px;
    display: flex;
    align-items: center;
    font-size: 13px;
  }
`

const HeaderRow = styled(RowFixed)`
  align-items: flex-start
    ${({ theme }) => theme.mediaWidth.upToMedium`
   width: 100%;
   align-items: center
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 0 1rem 1rem;
    justify-content: flex-end;
`};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: transparent
  border-radius: 4px;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;

  :focus {
    border: 1px solid blue;
  }
`

const UNIAmount = styled(AccountElement)`
  color: white;
  font-weight: 500;
  &:after {
    content: '';
    border-right: 1px solid ${({ theme }) => theme.text1};
    margin: 0 16px;
    height: 16px;
  }
`

const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
`

// const HideSmall = styled.span`
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     display: none;
//   `};
// `

const NetworkCard = styled.div<{ color?: string }>`
  color: #000000;
  cursor: pointer;
  display: flex;
  padding: 0 4px;
  height: 32px;
  margin-right: 12px;
  margin-left: 19px;
  justify-content: center;
  border-radius: 4px;
  align-items: center;
  background-color: ${({ color }) => color ?? 'rgba(255, 255, 255, 0.12)'}
  font-size: 13px;
  font-weight: 500;
  position: relative;
  &> svg:first-child {
    height: 24px;
    width: 24px;
  };
  :hover {
    cursor: pointer;
    .dropdown_wrapper {
      top: 100%;
      left: -20px;
      height: 10px;
      position: absolute;
      width: 172px;
      &>div{
        height: auto;
        margin-top: 10px;
        border: 1px solid ${({ theme }) => theme.text5};
        a{
          padding: 8px 17px;
        position: relative;
          & >svg{
            height: 24px;
            width: 24px;
            margin-right: 15px;
            margin-left: 30px;
          }
        }
      }
    }
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0
`};

`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 14px;
  width: fit-content;
  margin: 0 20px;
  font-weight: 400;
  padding: 10px 0 27px;
  transition: 0.5s;
  &.${activeClassName} {
    color: ${({ theme }) => theme.primary1};
    border-bottom: 1px solid ${({ theme }) => theme.primary1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
`

const StyledDropdown = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 14px;
  width: fit-content;
  margin: 0 20px;
  font-weight: 400;
  padding: 10px 0 27px;
  transition: 0.5s;
  position: relative;
  svg {
    margin-left: 5px;
  }
  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.primary1)};
    svg {
      transform: rotate(180deg);
    }
    & > div {
      top: 40px;
      height: auto;
      border: 1px solid ${({ theme }) => theme.text5};
    }
  }
`
const Dropdown = styled.div`
  height: 0;
  position: absolute;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 172px;
  a {
    color: #ffffff;
    background-color: ${({ theme }) => theme.bg2};
    text-decoration: none;
    padding: 14px 17px;
    border-bottom: 1px solid ${({ theme }) => theme.text5}
    transition: 0.5s;
    display: flex;
    align-items: center;
    :last-child{
      border: none;
    }
    :hover {
      background-color: ${({ theme }) => theme.bg4};
      color: ${({ theme }) => darken(0.1, theme.primary1)};
    }
  }
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledLogo = styled(Logo)`
  width: 160px;
  magin-right: 60px;
`

function FAQButton() {
  const theme = useTheme()
  return (
    <RowFixed>
      <RowFixed
        justify="center"
        style={{
          borderRadius: '50%',
          border: `1px solid ${theme.primary1}`,
          width: '18px',
          height: '18px',
          marginRight: '12px'
        }}
      >
        <TYPE.body fontSize={14} color={theme.primary1}>
          ?
        </TYPE.body>
      </RowFixed>
      FAQ
    </RowFixed>
  )
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()

  const aggregateBalance: TokenAmount | undefined = useAggregateUniBalance()

  const countUpValue = aggregateBalance?.toFixed(0) ?? '0'
  const countUpValuePrevious = usePrevious(countUpValue) ?? '0'

  return (
    <HeaderFrame>
      <ClaimModal />
      <HeaderRow>
        <StyledLogo />
        <HeaderLinks>
          {tabs.map(({ title, route, subTab }) => {
            if (subTab) {
              return (
                <StyledDropdown key={title}>
                  {title}
                  <ChevronDown size={15} />
                  <Dropdown>
                    {subTab.map(({ title, route, link, titleContent }) => {
                      return link ? (
                        <ExternalLink href={link} key={title}>
                          {titleContent ?? title}
                        </ExternalLink>
                      ) : route ? (
                        <NavLink to={route} key={title}>
                          {titleContent ?? title}
                        </NavLink>
                      ) : null
                    })}
                  </Dropdown>
                </StyledDropdown>
              )
            }
            if (route === 'option_exercise') {
              return (
                <StyledNavLink
                  key={route}
                  to={`/${route}`}
                  isActive={(match, { pathname }) =>
                    Boolean(match) || pathname.startsWith('/generate') || pathname.startsWith('/redeem')
                  }
                >
                  {title}
                </StyledNavLink>
              )
            }
            return (
              <StyledNavLink id={`stake-nav-link`} to={'/' + route} key={route}>
                {title}
              </StyledNavLink>
            )
          })}
        </HeaderLinks>
      </HeaderRow>
      <HeaderControls>
        <HeaderElement show={!!account}>
          {/* <HideSmall> */}
          {chainId && NetworkInfo[chainId] && (
            <NetworkCard title={NetworkInfo[chainId].title} color={NetworkInfo[chainId as number]?.color}>
              {NetworkInfo[chainId as number]?.icon} {NetworkInfo[chainId].title}
              <ChevronDown size={18} style={{ marginLeft: '5px' }} />
              <div className="dropdown_wrapper">
                <Dropdown>
                  {Object.keys(NetworkInfo).map(key => {
                    const info = NetworkInfo[parseInt(key) as keyof typeof NetworkInfo]
                    if (!info) {
                      return null
                    }
                    return info.link ? (
                      <ExternalLink href={info.link} key={info.link}>
                        {parseInt(key) === chainId && (
                          <span style={{ position: 'absolute', left: '15px' }}>
                            <Check size={18} />
                          </span>
                        )}
                        {info.linkIcon ?? info.icon}
                        {info.title}
                      </ExternalLink>
                    ) : null
                  })}
                </Dropdown>
              </div>
            </NetworkCard>
          )}
          {/* </HideSmall> */}
          <div style={{ paddingLeft: 8 }}>
            {!!account && aggregateBalance && (
              <UNIWrapper>
                <UNIAmount active={!!account} style={{ pointerEvents: 'none' }}>
                  {account && (
                    // <HideSmall>
                    <TYPE.white
                      style={{
                        paddingRight: '.4rem'
                      }}
                    >
                      <CountUp
                        key={countUpValue}
                        isCounting
                        start={parseFloat(countUpValuePrevious)}
                        end={parseFloat(countUpValue)}
                        thousandsSeparator={','}
                        duration={1}
                      />
                    </TYPE.white>
                    // </HideSmall>
                  )}
                  MATTER
                </UNIAmount>
                {/* <CardNoise /> */}
              </UNIWrapper>
            )}
            <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
              {/* {account && userEthBalance ? (
                <BalanceText style={{ flexShrink: 0 }} fontWeight={500}>
                  {userEthBalance?.toSignificant(4)} ETH
                </BalanceText>
              ) : null} */}
              <Web3Status />
            </AccountElement>
          </div>
        </HeaderElement>
        {/* <HeaderElementWrap>
          <StyledMenuButton onClick={() => toggleDarkMode()}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </StyledMenuButton>
          <Menu />
        </HeaderElementWrap> */}
      </HeaderControls>
    </HeaderFrame>
  )
}
