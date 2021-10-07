import { ChainId } from '@uniswap/sdk'
import React, { useCallback } from 'react'
import { Check, ChevronDown } from 'react-feather'
import { Link, NavLink, useHistory, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'
// import { useTranslation } from 'react-i18next'
import { darken } from 'polished'
import { useActiveWeb3React } from '../../hooks'
import { useETHBalances } from '../../state/wallet/hooks'
import { ButtonText, ExternalHeaderLink, ExternalLink, HideMedium, StyledLink, TYPE } from '../../theme'
import Row, { RowFixed, RowBetween, RowFlat } from '../Row'
import Web3Status from '../Web3Status'
import ClaimModal from '../claim/ClaimModal'
import { ReactComponent as Logo } from '../../assets/svg/antimatter_logo.svg'
import { ReactComponent as ETH } from '../../assets/svg/eth_logo.svg'
import { ReactComponent as BSCInvert } from '../../assets/svg/binance.svg'
import { ReactComponent as BSCSelected } from '../../assets/svg/bsc_logo_selected.svg'
import { ReactComponent as Arbitrum } from '../../assets/svg/arbitrum_logo.svg'
import { ReactComponent as AVAX } from '../../assets/svg/avax_logo.svg'
import { ReactComponent as Plus } from '../../assets/svg/plus.svg'
import useTheme from 'hooks/useTheme'
import ToggleMenu from './ToggleMenu'
import { ReactComponent as AntimatterIcon } from 'assets/svg/antimatter_icon.svg'
import { AutoColumn } from 'components/Column'
import { shortenAddress } from 'utils'
import Copy from 'components/AccountDetails/Copy'
import { UserInfoTabRoute, UserInfoTabs } from 'pages/User'
import { useWalletModalToggle } from 'state/application/hooks'
import usePrevious from '../../hooks/usePrevious'
import { CountUp } from 'use-count-up/lib'
import { Symbol } from '../../constants'

interface TabContent {
  title: string
  route?: string
  link?: string
  titleContent?: JSX.Element
}

interface Tab extends TabContent {
  subTab?: TabContent[]
}

export const tabs: Tab[] = [
  { title: 'Option Trading', route: 'option_trading' },
  { title: 'Option Creation', route: 'option_creation' },
  // { title: 'Farm', route: 'farm' },
  {
    title: 'Tools',
    subTab: [
      { title: 'Calculator', route: '/calculator' },
      { title: 'Statistics', route: '/statistics' }
    ]
  },
  {
    title: 'About',
    subTab: [
      { title: 'Docs', link: 'https://docs.antimatter.finance/' },
      { title: 'Governance', link: 'https://governance.antimatter.finance' },
      {
        title: 'Auditing Report',
        link:
          'https://github.com/antimatter-finance/antimatter-assets/blob/main/PeckShield-Audit-Report-AntimatterFinance-v1.0.pdf'
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
  [key: number]: { title: string; color: string; icon: JSX.Element; link?: string; selectedIcon?: JSX.Element }
} = {
  // [ChainId.MAINNET]: {
  //   color: '#FFFFFF',
  //   icon: <ETH />,
  //   title: 'ETH'
  // },
  [ChainId.ROPSTEN]: {
    color: '#FFFFFF',
    icon: <ETH />,
    title: 'Ropsten'
  },
  [ChainId.BSC]: {
    color: '#F0B90B',
    icon: <BSCInvert />,
    selectedIcon: <BSCSelected />,
    title: 'BSC'
  },
  [ChainId.Arbitrum]: {
    color: '#059BDC',
    icon: <Arbitrum />,
    title: 'Arbitrum'
  },
  [ChainId.Avalanche]: {
    color: '#FFFFFF',
    icon: <AVAX />,
    title: 'Avalanche'
  }
}

export const SUPPORTED_NETWORKS: {
  [chainId in ChainId]?: {
    chainId: string
    chainName: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
} = {
  [ChainId.MAINNET]: {
    chainId: '0x1',
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3'],
    blockExplorerUrls: ['https://etherscan.com']
  },
  [ChainId.BSC]: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com']
  },
  [ChainId.Avalanche]: {
    chainId: '0xA86A',
    chainName: 'Avalanche',
    nativeCurrency: {
      name: 'Avalanche Token',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://cchain.explorer.avax.network']
  },
  [ChainId.Arbitrum]: {
    chainId: '0xA4B1',
    chainName: 'Arbitrum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://mainnet-arb-explorer.netlify.app']
  }
}

export const headerHeightDisplacement = '32px'

const HeaderFrame = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  width: 100%;
  top: 0;
  position: relative;
  border-bottom: 1px solid ${({ theme }) => theme.text5};
  padding: 27px 0 0;
  z-index: 99;
  background-color: ${({ theme }) => theme.bg1};
  height: ${({ theme }) => theme.headerHeight};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    padding: 0 1rem;
    width: 100%;
    position: relative;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
        padding: 0.5rem 1rem;
  `}
`

const HeaderControls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 8px;
  margin-feft: auto;
  margin-right: 2rem;
`

// ${({ theme }) => theme.mediaWidth.upToSmall`
// height: ${theme.headerHeight};
// flex-direction: row;
// align-items: center;
// justify-self: center;
// padding: 1rem;
// position: fixed;
// bottom: 0px;
// left: 0px;
// width: 100%;
// z-index: 99;
// background-color: ${theme.bg2};
// justify-content: center;
// border-top: 1px solid;
// border-top-color: #303030;
// `}

// const HeaderElement = styled.div<{
//   show?: boolean
// }>`
//   display: flex;

//   /* addresses safari's lack of support for "gap" */
//   & > *:not(:first-child) {
//     margin-left: 8px;
//   }

//   ${({ theme }) => theme.mediaWidth.upToLarge`
//     align-items: center;
//   `};
//   & > div {
//     border: 1px solid ${({ theme, show }) => (show ? theme.text1 : 'transparent')};
//     border-radius: 4px;
//     height: 32px;
//     display: flex;
//     align-items: center;
//     font-size: 13px;
//   }
// `

const HeaderRow = styled(RowFixed)`
  width: 100%;
  padding-left: 2rem;
  align-items: flex-start;
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: ${({ theme }) => theme.headerHeight};
    background-color: rgb(25, 25, 25);
    border-top: 1px solid rgb(48, 48, 48);
    align-items: center;
    position: fixed;
    bottom: 0;
    left:0 ;
    z-index: 100;
    padding: 0;
    justify-content: center
  `};
`

const HeaderLinks = styled(Row)`
  justify-content: center;
  width: auto;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem 0 1rem 1rem;
    justify-content: flex-end;
    display: none
`};
`

const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #ffffff;
  border-radius: 32px;
  white-space: nowrap;
  padding: ${({ active }) => (active ? '14px 16px' : 'unset')};
  padding-right: 0;
  height: 44px;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  width:100%`}
`

const UNIAmount = styled.div`
  color: ${({ theme }) => theme.bg1};
  font-size: 13px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: transparent;
  &:after {
    content: '';
    border-right: 2px solid ${({ theme }) => theme.text2};
    margin-left: 16px;
    height: 20px;
  }
`

const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
`

// const HideLarge = styled(RowFixed)`
//   display: none;
//   ${({ theme }) => theme.mediaWidth.upToLarge`
//     display: inherit;
//   `};
// `

// const ShowLarge = styled(RowFixed)`
//   ${({ theme }) => theme.mediaWidth.upToLarge`
//     display: none;
//   `};
// `

const NetworkCard = styled.div<{ color?: string }>`
  color: #000000;
  cursor: pointer;
  display: flex;
  padding: 0 8px;
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
  & > svg:first-child {
    height: 20px;
    width: 20px;
  }
  .dropdown_wrapper {
    &>div{
      a {
        padding: 12px 12px 12px 44px ;
      }
    }
  }

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
        position: relative;
          & >svg{
            height: 20px;
            width: 20px;
            margin-right: 15px;
          }
        }
      }
    }
  }
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  align-items: flex-start;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 14px;
  width: fit-content;
  margin: 0 18px;
  font-weight: 400;
  padding: 10px 0 27px;
  white-space: nowrap;
  transition: 0.5s;
  ${({ theme }) => theme.flexRowNoWrap}
  &.${activeClassName} {
    color: ${({ theme }) => theme.primary1};
    border-bottom: 1px solid ${({ theme }) => theme.primary1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin: 0 10px;
  `};
`

const StyledDropdown = styled.div`
  align-items: flex-start;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 14px;
  width: fit-content;
  margin: 0 18px;
  font-weight: 400;
  padding: 10px 0 27px;
  transition: 0.5s;
  position: relative;
  ${({ theme }) => theme.flexRowNoWrap}

  svg {
    margin-left: 5px;
  }
  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.primary1)};
    > svg {
      transform: rotate(180deg);
    }
    #plus {
      transform: unset;
      #hover {
        fill: url(#Gradient1);
      }
    }
    & > div {
      top: 40px;
      height: auto;
      border: 1px solid ${({ theme }) => theme.text5};
    }
  }
  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin: 0 10px;
  `};
`
const Dropdown = styled.div<{ width?: string }>`
  z-index: 3;
  height: 0;
  position: absolute;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: ${({ width }) => width ?? '172px'};
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
  border: none;
  margin: 0;
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
  margin-top: 5px;
`
const UserButtonWrap = styled.div`
  margin-left: 5px;
  position: relative;
  :hover {
    #userButton {
      :hover,
      :focus {
        background: linear-gradient(360deg, #fffa8b 0%, rgba(207, 209, 86, 0) 50%),
          linear-gradient(259.57deg, #b2f355 1.58%, #66d7fa 92.54%);
      }
    }
    div {
      opacity: 1;
      visibility: visible;
    }
  }
  div {
    opacity: 0;
    visibility: hidden;
  }
`
const UserMenuItem = styled.button`
  padding: 12px 24px;
  width: 100%;
  border: none;
  background-color: transparent;
  text-align: left;
  font-size: 16px;
  cursor: pointer;
  :hover {
    background-color: #ededed;
  }
`

const UserButton = styled(ButtonText)<{ isOpen: boolean; size?: string }>`
  height: ${({ size }) => size ?? '44px'};
  width: ${({ size }) => size ?? '44px'};
  border-radius: 50%;
  background: ${({ isOpen }) =>
    isOpen
      ? `linear-gradient(360deg, #fffa8b 0%, rgba(207, 209, 86, 0) 50%),
  linear-gradient(259.57deg, #b2f355 1.58%, #66d7fa 92.54%);`
      : `linear-gradient(360deg, #66d7fa 0%, rgba(207, 209, 86, 0) 50%),
    linear-gradient(259.57deg, #66d7fa 1.58%, #66d7fa 92.54%);`};
  border: none;
  flex-shrink: 0;
  ${({ theme }) => theme.flexRowNoWrap};
  justify-content: center;
  align-items: center;
  transition: 0.4s;
  :disabled {
    cursor: auto;
  }
  :hover {
    background: linear-gradient(360deg, #fffa8b 0%, rgba(207, 209, 86, 0) 50%),
      linear-gradient(259.57deg, #b2f355 1.58%, #66d7fa 92.54%);
  }
`
const UserMenuWrapper = styled.div`
  position: absolute;
  top: 60px;
  right: 0;
  z-index: 2000;
  min-width: 15rem;
  box-sizing: border-box;
  background-color: #ffffff;
  overflow: hidden;
  border-radius: 16px;
  transition-duration: 0.3s;
  transition-property: visibility, opacity;
  display: flex;
  border: 1px solid #ededed;
  flex-direction: column;
  & > div:first-child {
    padding: 16px 24px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ededed;
    width: 100%;
  }
  & > button:last-child {
    padding: 16px 24px;
    border-top: 1px solid #ededed;
  }
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

const MobileHeader = styled.header`
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background-color: ${({ theme }) => theme.bg1};
  height: ${({ theme }) => theme.mobileHeaderHeight};
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: none;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex
`};
`

export default function Header() {
  const { account, chainId, library } = useActiveWeb3React()

  const aggregateBalance = useETHBalances([account ?? undefined])[account ?? '']

  const countUpValue = aggregateBalance?.toFixed(2) ?? '0'
  const countUpValuePrevious = usePrevious(countUpValue) ?? '0'

  const history = useHistory()
  const match = useRouteMatch('/profile')
  const toShowUserPanel = useCallback(() => {
    history.push('/profile')
    return
  }, [history])

  return (
    <HeaderFrame>
      <ClaimModal />
      <HeaderRow>
        <HideMedium>
          <RowFixed>
            <LogoButton />

            <HeaderLinks>
              {tabs.map(({ title, route, link, subTab }) => {
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
                  <React.Fragment key={title}>
                    {link ? (
                      <ExternalHeaderLink href={link} key={title}>
                        {title}
                      </ExternalHeaderLink>
                    ) : (
                      <StyledNavLink id={`stake-nav-link`} to={'/' + route} key={route}>
                        {title}
                      </StyledNavLink>
                    )}
                  </React.Fragment>
                )
              })}
            </HeaderLinks>
          </RowFixed>
        </HideMedium>
        <HeaderControls>
          {/* <HeaderElement show={!!account}> */}
          {/* <HideSmall>
            <HideLarge>
              <ToggleMenu padding={0} />
            </HideLarge>
          </HideSmall> */}
          {account && chainId && NetworkInfo[chainId] && (
            <NetworkCard title={NetworkInfo[chainId].title} color={NetworkInfo[chainId as number]?.color}>
              {NetworkInfo[chainId].selectedIcon ? NetworkInfo[chainId].selectedIcon : NetworkInfo[chainId].icon}
              <span style={{ marginRight: 4 }} />
              {NetworkInfo[chainId].title}
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
                        {info.icon ?? info.icon}
                        {info.title}
                      </ExternalLink>
                    ) : (
                      <StyledLink
                        key={info.title}
                        onClick={() => {
                          if (parseInt(key) === ChainId.MAINNET) {
                            library?.send('wallet_switchEthereumChain', [{ chainId: '0x1' }, account])
                          } else if (parseInt(key) === ChainId.ROPSTEN) {
                            library?.send('wallet_switchEthereumChain', [{ chainId: '0x3' }, account])
                          } else {
                            const params = SUPPORTED_NETWORKS[parseInt(key) as ChainId]
                            library?.send('wallet_addEthereumChain', [params, account])
                          }
                        }}
                      >
                        {parseInt(key) === chainId && (
                          <span style={{ position: 'absolute', left: '15px' }}>
                            <Check size={18} />
                          </span>
                        )}
                        {info.icon ?? info.icon}
                        {info.title}
                      </StyledLink>
                    )
                  })}
                </Dropdown>
              </div>
            </NetworkCard>
          )}

          {/* </HeaderElement> */}
          {/* <HeaderElementWrap>
          <StyledMenuButton onClick={() => toggleDarkMode()}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </StyledMenuButton>
          <Menu />
        </HeaderElementWrap> */}

          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
            {!!account && aggregateBalance && (
              <UNIWrapper>
                <UNIAmount style={{ pointerEvents: 'none' }}>
                  {account && (
                    <TYPE.gray
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
                    </TYPE.gray>
                  )}
                  {Symbol[chainId ?? 1]}
                </UNIAmount>
              </UNIWrapper>
            )}
            <Web3Status />
            {account && (
              <UserButtonWrap>
                <UserButton id="userButton" onClick={toShowUserPanel} isOpen={!!match}>
                  <AntimatterIcon />
                </UserButton>
                <UserMenu account={account} />
              </UserButtonWrap>
            )}
          </AccountElement>
        </HeaderControls>
      </HeaderRow>
      <MobileHeader>
        <RowBetween>
          <LogoButton />
          <ToggleMenu />
        </RowBetween>
      </MobileHeader>
    </HeaderFrame>
  )
}

function LogoButton() {
  return (
    <RowFlat style={{ alignItems: 'flex-start' }}>
      <Link to={'/'}>
        <StyledLogo />
      </Link>
      <StyledDropdown style={{ color: '#ffffff', padding: '6px 25px 18px 20px', margin: 0 }}>
        <Plus style={{ margin: 'auto auto' }} />
        <Dropdown>
          <ExternalLink href={'https://v1.antimatter.finance'}>Antimatter V1</ExternalLink>
          <ExternalLink href={'https://nonfungible.finance/#/'}>
            <span style={{ whiteSpace: 'nowrap' }}>Antimatter NFT</span>
          </ExternalLink>
        </Dropdown>
      </StyledDropdown>
    </RowFlat>
  )
}

function UserMenu({ account }: { account?: string | null }) {
  const toggleWalletModal = useWalletModalToggle()
  const history = useHistory()

  return (
    <UserMenuWrapper>
      <div>
        <UserButton isOpen={true} disabled size="28px">
          <AntimatterIcon />
        </UserButton>
        <TYPE.darkGray fontWeight={400} style={{ marginLeft: 15 }}>
          {account && shortenAddress(account)}
        </TYPE.darkGray>
        {account && <Copy toCopy={account} fixedSize />}
      </div>
      <div>
        <AutoColumn style={{ width: '100%' }}>
          <UserMenuItem onClick={() => history.push('/profile/' + UserInfoTabs.POSITION)}>
            {UserInfoTabRoute[UserInfoTabs.POSITION]}
          </UserMenuItem>
          <UserMenuItem onClick={() => history.push('/profile/' + UserInfoTabs.CREATION)}>
            {UserInfoTabRoute[UserInfoTabs.CREATION]}
          </UserMenuItem>
          <UserMenuItem onClick={() => history.push('/profile/' + UserInfoTabs.TRANSACTION)}>
            {UserInfoTabRoute[UserInfoTabs.TRANSACTION]}
          </UserMenuItem>
          <UserMenuItem onClick={toggleWalletModal}>Wallet</UserMenuItem>
        </AutoColumn>
      </div>
    </UserMenuWrapper>
  )
}
