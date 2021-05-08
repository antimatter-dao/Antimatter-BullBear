import { ChainId, TokenAmount } from '@uniswap/sdk'
import React, { useEffect, useState } from 'react'
import { ChevronDown, X } from 'react-feather'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
// import { useTranslation } from 'react-i18next'
import { darken } from 'polished'
import { CountUp } from 'use-count-up'
import { useActiveWeb3React } from '../../hooks'
// import { useDarkModeManager } from '../../state/user/hooks'
import { useAggregateUniBalance } from '../../state/wallet/hooks'
// import { CardNoise } from '../earn/styled'
import { /*ExternalLink, */ TYPE } from '../../theme'
import { Base } from 'components/Button'
// import { YellowCard } from '../Card'
// import { Moon, Sun } from 'react-feather'
// import Menu from '../Menu'
import Row, { RowFixed } from '../Row'
import Web3Status from '../Web3Status'
import ClaimModal from '../claim/ClaimModal'
// import { useToggleSelfClaimModal, useShowClaimPopup } from '../../state/application/hooks'
// import { useUserHasAvailableClaim } from '../../state/claim/hooks'
// import { useUserHasSubmittedClaim } from '../../state/transactions/hooks'
// import { Dots } from '../swap/styleds'
import usePrevious from '../../hooks/usePrevious'
import Modal from 'components/Modal'
import ChainModal from 'components/ChainModal'
// import { Text } from 'rebass'
import { ReactComponent as Logo } from '../../assets/svg/antimatter_logo.svg'
import { ReactComponent as ETH } from '../../assets/svg/eth_logo.svg'
import { ReactComponent as HECO } from '../../assets/svg/huobi_inverted.svg'
import { ReactComponent as BSC } from '../../assets/svg/binance.svg'

interface TabContent {
  title: string
  route?: string
  link?: string
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
      { title: 'Support', route: '/support' },
      { title: 'Docs', route: '/docs' },
      { title: 'Statistic', link: '/support' }
    ]
  }
]

const NetworkInfo: { [key: number]: { color: string; icon: JSX.Element } } = {
  [ChainId.MAINNET]: {
    color: '#FFFFFF',
    icon: <ETH />
  },
  [ChainId.ROPSTEN]: {
    color: '#FFFFFF',
    icon: <ETH />
  },
  [ChainId.RINKEBY]: {
    color: '#FFFFFF',
    icon: <ETH />
  },
  128: {
    color: '#059BDC',
    icon: <HECO />
  },
  56: {
    color: '#F0B90B',
    icon: <BSC />
  }
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
  padding: 27px 61px 0;
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

// const HeaderElementWrap = styled.div`
//   display: flex;
//   align-items: center;
// `

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
  svg:first-child {
    height: 24px;
    width: 24px;
  };
  :hover {
    cursor: pointer;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0
`};
`

// const BalanceText = styled(Text)`
//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//     display: none;
//   `};
//   ::after {
//     content: '';
//     border-right: 1px solid ${({ theme }) => theme.text1};
//     margin: 0 16px;
//     height: 16px;
//   }
// `

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
  & > div {
    height: 0;
    position: absolute;
    top: 40px;
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
      :last-child{
        border: none;
      }
      :hover {
        background-color: ${({ theme }) => theme.bg4};
        color: ${({ theme }) => darken(0.1, theme.primary1)};
      }
    }
  }
  svg{
    margin-left: 5px;
  }
  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.primary1)};
    svg {
      transform: rotate(180deg);
    }
    & > div {
      height: auto;
      border: 1px solid ${({ theme }) => theme.text5};
    }
  }
`

// const StyledExternalLink = styled(ExternalLink).attrs({
//   activeClassName
// })<{ isActive?: boolean }>`
//   ${({ theme }) => theme.flexRowNoWrap}
//   align-items: left;
//   border-radius: 3rem;
//   outline: none;
//   cursor: pointer;
//   text-decoration: none;
//   color: ${({ theme }) => theme.text2};
//   font-size: 1rem;
//   width: fit-content;
//   margin: 0 12px;
//   font-weight: 500;

//   &.${activeClassName} {
//     border-radius: 12px;
//     font-weight: 600;
//     color: ${({ theme }) => theme.text1};
//   }

//   :hover,
//   :focus {
//     color: ${({ theme }) => darken(0.1, theme.text1)};
//   }

//   ${({ theme }) => theme.mediaWidth.upToExtraSmall`
//       display: none;
// `}
// `

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

const CloseButton = styled(Base)`
  background: none;
  width: auto;
  position: absolute;
  right: 16px;
  top: 16px;
  :active,
  :focus {
    border: none;
  }
`

const StyledLogo = styled(Logo)`
  width: 160px;
  magin-right: 60px;
`

const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan',
  [ChainId.MAINNET]: 'Eth'
}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  const [warningModalOpen, setWarningModalOpen] = useState(false)
  const [chainModalOpen, setChainModalOpen] = useState(false)
  useEffect(() => {
    if (chainId && chainId !== ChainId.MAINNET && chainId !== ChainId.RINKEBY && chainId !== ChainId.ROPSTEN) {
      setWarningModalOpen(true)
    } else {
      setWarningModalOpen(false)
    }
  }, [chainId, setWarningModalOpen])
  // const { t } = useTranslation()
  // const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  // const [isDark] = useDarkModeManager()
  // const [darkMode, toggleDarkMode] = useDarkModeManager()

  // const toggleClaimModal = useToggleSelfClaimModal()

  // const availableClaim: boolean = useUserHasAvailableClaim(account)

  // const { claimTxn } = useUserHasSubmittedClaim(account ?? undefined)

  const aggregateBalance: TokenAmount | undefined = useAggregateUniBalance()

  // const [showUniBalanceModal, setShowUniBalanceModal] = useState(false)
  // const showClaimPopup = useShowClaimPopup()

  const countUpValue = aggregateBalance?.toFixed(0) ?? '0'
  const countUpValuePrevious = usePrevious(countUpValue) ?? '0'

  return (
    <HeaderFrame>
      <ChainModal isOpen={chainModalOpen} onDismiss={() => setChainModalOpen(false)} />
      <ClaimModal />
      <Modal isOpen={warningModalOpen} onDismiss={() => setWarningModalOpen(false)} maxHeight={400}>
        <div
          style={{
            height: '400px',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            padding: '48px'
          }}
        >
          <CloseButton onClick={() => setWarningModalOpen(false)}>
            <X />
          </CloseButton>
          <TYPE.largeHeader fontSize="24px">Product Launch Phase I</TYPE.largeHeader>
          <TYPE.body fontSize="16px" marginTop={'20px'} color={'rgba(255, 255, 255, 0.6)'}>
            The product is in public testing, please switch your wallet network to Ropston or rinkeby network.
          </TYPE.body>
        </div>
      </Modal>
      {/* <Modal isOpen={showUniBalanceModal} onDismiss={() => setShowUniBalanceModal(false)}>
        <UniBalanceContent setShowUniBalanceModal={setShowUniBalanceModal} />
      </Modal> */}
      <HeaderRow>
        <StyledLogo />
        <HeaderLinks>
          {tabs.map(({ title, route, subTab }) => {
            if (subTab) {
              return (
                <StyledDropdown>
                  {title}
                  <ChevronDown size={15} />
                  <div>
                    {subTab.map(({ title, route, link }) => {
                      return link ? <a href={link}>{title}</a> : route ? <NavLink to={route}>{title}</NavLink> : null
                    })}
                  </div>
                </StyledDropdown>
              )
            }
            return (
              <StyledNavLink id={`stake-nav-link`} to={'/' + route} key={route}>
                {title}
              </StyledNavLink>
            )
          })}
          {/* <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
            {t('swap')}
          </StyledNavLink>
          <StyledNavLink
            id={`pool-nav-link`}
            to={'/pool'}
            isActive={(match, { pathname }) =>
              Boolean(match) ||
              pathname.startsWith('/add') ||
              pathname.startsWith('/remove') ||
              pathname.startsWith('/create') ||
              pathname.startsWith('/find')
            }
          >
            {t('pool')}
          </StyledNavLink>
          <StyledNavLink id={`stake-nav-link`} to={'/uni'}>
            UNI
          </StyledNavLink>
          <StyledNavLink id={`stake-nav-link`} to={'/vote'}>
            Vote
          </StyledNavLink>
          <StyledExternalLink id={`stake-nav-link`} href={'https://uniswap.info'}>
            Charts <span style={{ fontSize: '11px' }}>↗</span>
          </StyledExternalLink> */}
        </HeaderLinks>
      </HeaderRow>
      <HeaderControls>
        <HeaderElement show={!!account}>
          {/* <HideSmall> */}
          {chainId && NETWORK_LABELS[chainId] && (
            <NetworkCard
              title={NETWORK_LABELS[chainId]}
              onClick={() => setChainModalOpen(true)}
              color={NetworkInfo[chainId as number]?.color}
            >
              {NetworkInfo[chainId as number]?.icon} {NETWORK_LABELS[chainId]}
              <ChevronDown size={18} style={{ marginLeft: '5px' }} />
            </NetworkCard>
          )}
          {/* </HideSmall> */}
          <div>
            {/* {availableClaim && !showClaimPopup && (
              <UNIWrapper onClick={toggleClaimModal}>
                <UNIAmount active={!!account && !availableClaim} style={{ pointerEvents: 'auto' }}>
                  <TYPE.white padding="0 2px">
                    {claimTxn && !claimTxn?.receipt ? <Dots>Claiming UNI</Dots> : 'Claim UNI'}
                  </TYPE.white>
                </UNIAmount>
                <CardNoise />
              </UNIWrapper>
            )} */}
            {!!account && aggregateBalance && (
              // <UNIWrapper onClick={() => setShowUniBalanceModal(true)}>
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
