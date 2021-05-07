import React, { useEffect, useState, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X } from 'react-feather'
import styled from 'styled-components'
// import { useTranslation } from 'react-i18next'
import { ReactComponent as Logo } from '../../assets/svg/antimatter_logo.svg'
import { ReactComponent as Menu } from '../../assets/svg/menu.svg'
import arrowUpUrl from 'assets/svg/arrow_up.svg'
import { AutoColumn } from 'components/Column'
import { Base } from '../Button'
import { TYPE } from 'theme'
import useTheme from 'hooks/useTheme'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
interface TabContent {
  title: string
  route: string
}
interface Tab extends TabContent {
  childrenLink?: TabContent[]
}

const tabs: Tab[] = [
  { title: 'Option Trading', route: 'option_trading' },
  { title: 'Option Exercise', route: 'option_exercise' },
  { title: 'Liquidity', route: 'liquidity' },
  {
    title: 'Matter Token',
    route: 'matter_token',
    childrenLink: [
      {
        title: 'Farming',
        route: 'matter_token'
      },
      { title: 'Matter Option Redemption ', route: 'matter_redemption' }
    ]
  },
  { title: 'Governance', route: 'governance' },
  { title: 'Info', route: 'info' }
]

// import Logo from '../../assets/svg/logo.svg'
// import LogoDark from '../../assets/svg/logo_white.svg'

const StyledSidebar = styled.div`
  width: 212px;
  height: 100vh;
  border-radius: 0 42px 42px 0;
  padding: 36px 0;
  background: linear-gradient(
      283.31deg,
      rgba(255, 255, 255, 0.09) -2.53%,
      rgba(255, 255, 255, 0.085) 18.66%,
      rgba(255, 255, 255, 0) 98.68%
    ),
    #000000;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  height:  calc(100vh - ${({ theme }) => theme.headerHeight});
  `}
  ${({ theme }) => theme.desktop}
`

const activeClassName = 'active'
const TabBasic = styled(NavLink)`
  width: 100%;
  font-size: 1rem;
  padding: 16px 30px;
  opacity: 0.6;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text1};
  :focus,
  :hover {
    opacity: 1;
  }
`
const Tab = styled(TabBasic)`
  border-left: 4px solid transparent;

  &.${activeClassName}, :hover,
  :focus,
  :active {
    border-left: 4px solid;
    border-color: ${({ theme }) => theme.primary1};
    background-color: ${({ theme }) => theme.translucent};
    opacity: 1;
  }
`
const TabMobile = styled(TabBasic)`
  font-size: 24px;
  color: ${({ theme }) => theme.text1};
  opacity: 1;
`
const SubTabMobile = styled(TabMobile)`
  font-size: 16px;
  line-height: 24px;
  padding: 8px 32px;
  color: ${({ theme }) => theme.text3};
  &.${activeClassName}, :focus,
  :active,
  :hover {
    color: ${({ theme }) => theme.text1};
  }
`

const ToggleTabMobile = styled(TabMobile)<{ isopen: 'true' | 'false' }>`
  position: relative;
  :after {
    content: '';
    width: 14px;
    height: 8px;
    background: url(${arrowUpUrl});
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%) ${({ isopen }) => (isopen === 'true' ? '' : 'rotate(180deg)')};
  }
`

const ToggleTabStyle = styled(Tab)<{ isopen: 'true' | 'false' }>`
  position: relative;
  &.${activeClassName}, :hover {
    :after {
      content: '';
      width: 14px;
      height: 8px;
      background: url(${arrowUpUrl});
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%) ${({ isopen }) => (isopen === 'true' ? '' : 'rotate(180deg)')};
    }
  }
`

const SubTab = styled(NavLink)`
  width: 100%;
  font-size: 12px;
  padding: 16px 36px;
  opacity: 0.4;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text1};
  &.${activeClassName}, :focus,
  :active,
  :hover {
    opacity: 1;
  }
`

const TabDivider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
`

const StyledLogo = styled(Logo)`
  width: 150px;
  margin: 0 auto 120px auto;
`
// const UniIcon = styled.div`
//   transition: transform 0.3s ease;
//   :hover {
//     transform: rotate(-5deg);
//   }
// `
// const Title = styled.a`
//   display: flex;
//   align-items: center;
//   pointer-events: auto;
//   justify-self: flex-start;
//   margin-right: 12px;
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     justify-self: center;
//   `};
//   :hover {
//     cursor: pointer;
//   }
//   `
const MobileHeader = styled.header`
  width:100%;
  display:flex;
  justify-content:space-between;
  align-items: center;
  padding: 0 24px;
  position:relative;
  ${({ theme }) => theme.mobile}
  height:${({ theme }) => theme.mobileHeaderHeight}
  position:fixed;
  top: 0;
  left: 0;
  z-index: 100
`
const MobileHeaderFiller = styled.div`
  height: ${({ theme }) => theme.mobileHeaderHeight};
`

const ToggleMenuButton = styled(Base)`
  background: none;
  width: auto;
  :active,
  :focus {
    border: none;
  }
`
const TogggleMenuWrapper = styled.div`
  z-index: 100;
  position: absolute;
  left: 0;
  width: 100vw;
  border-radius: 32px;
  background: ${({ theme }) => theme.gradient2};
  top: ${({ theme }) => theme.mobileHeaderHeight};
  height: calc(100vh - ${({ theme }) => theme.mobileHeaderHeight + ' - ' + theme.headerHeight}});
`

function ToggleMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ToggleMenuButton onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</ToggleMenuButton>
      {isOpen && (
        <TogggleMenuWrapper>
          <AutoColumn>
            {tabs.map(({ title, route, childrenLink }) =>
              childrenLink ? (
                <ToggleTab
                  key={title}
                  route={`/${route}`}
                  title={title}
                  matchString="/matter"
                  isMobile={true}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <>
                    {childrenLink &&
                      childrenLink.map(({ title, route }) => {
                        return (
                          <SubTabMobile
                            key={title}
                            to={`/${route}`}
                            onClick={() => setIsOpen(!isOpen)}
                            isActive={match => Boolean(match)}
                          >
                            {title}
                          </SubTabMobile>
                        )
                      })}
                  </>
                </ToggleTab>
              ) : (
                <TabMobile key={title} to={`/${route}`} onClick={() => setIsOpen(!isOpen)}>
                  {title}
                </TabMobile>
              )
            )}
            <FAQButton onClick={() => setIsOpen(!isOpen)} />
          </AutoColumn>
        </TogggleMenuWrapper>
      )}
    </>
  )
}

function ToggleTab({
  route,
  matchString,
  children,
  title,
  isMobile,
  onClick
}: {
  route: string
  matchString: string
  children: JSX.Element | string
  title: string
  isMobile?: boolean
  onClick?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { pathname } = useLocation()
  const isActive = pathname.includes(matchString)
  useEffect(() => setIsOpen(isActive), [isActive])
  const handleClick = useCallback(() => {
    setIsOpen(!isOpen)
    onClick && onClick()
  }, [setIsOpen, isOpen, onClick])
  return (
    <>
      {isMobile ? (
        <>
          <ToggleTabMobile
            title={title}
            to={route}
            isActive={(match, { pathname }) => Boolean(match) || pathname.startsWith(matchString)}
            onClick={handleClick}
            isopen={isOpen ? 'true' : 'false'}
          >
            {title}
          </ToggleTabMobile>
          {isOpen && <>{isActive && children}</>}
        </>
      ) : (
        <>
          <ToggleTabStyle
            title={title}
            to={route}
            isActive={(match, { pathname }) => Boolean(match) || pathname.startsWith(matchString)}
            onClick={handleClick}
            isopen={isOpen ? 'true' : 'false'}
          >
            {title}
          </ToggleTabStyle>
          {isOpen && (
            <>
              {isActive && children}
              {isActive && <TabDivider />}
            </>
          )}
        </>
      )}
    </>
  )
}
function FAQButton({ onClick }: { onClick?: () => void }) {
  const theme = useTheme()
  return (
    <TabBasic to="/faq" style={{ marginTop: 'auto' }} onClick={onClick}>
      <RowFixed>
        <AutoRow
          justify="center"
          style={{
            borderRadius: '50%',
            border: `1px solid ${theme.primary1}`,
            width: '20px',
            height: '20px',
            marginRight: '12px'
          }}
        >
          <TYPE.body color={theme.primary1}>?</TYPE.body>
        </AutoRow>
        <TYPE.body>FAQ</TYPE.body>
      </RowFixed>
    </TabBasic>
  )
}
export default function Sidebar() {
  return (
    <>
      <MobileHeaderFiller />
      <MobileHeader>
        <RowBetween>
          <Logo />
          <ToggleMenu />
        </RowBetween>
      </MobileHeader>
      <StyledSidebar>
        {/* <Title href=".">
        <UniIcon>
          <img width={'24px'} src={darkMode ? LogoDark : Logo} alt="logo" />
        </UniIcon>
      </Title> */}
        <StyledLogo />
        {tabs.map(({ title, route, childrenLink }) =>
          route === tabs[2].route ? (
            <Tab
              key={title}
              to={`/${route}`}
              isActive={(match, { pathname }) =>
                Boolean(match) ||
                pathname.startsWith('/add') ||
                pathname.startsWith('/remove') ||
                pathname.startsWith('/create') ||
                pathname.startsWith('/find')
              }
            >
              {title}
            </Tab>
          ) : route === tabs[1].route ? (
            <Tab
              key={title}
              to={`/${route}`}
              isActive={(match, { pathname }) =>
                Boolean(match) || pathname.startsWith('/generate') || pathname.startsWith('/redeem')
              }
            >
              {title}
            </Tab>
          ) : route === tabs[3].route ? (
            <ToggleTab key={title} route={`/${route}`} title={title} matchString="/matter">
              <>
                {childrenLink &&
                  childrenLink.map(({ title, route }) => {
                    return (
                      <SubTab key={title} isActive={match => Boolean(match)} to={`/${route}`}>
                        {title}
                      </SubTab>
                    )
                  })}
              </>
            </ToggleTab>
          ) : (
            <>
              <Tab key={title} to={`/${route}`}>
                {title}
              </Tab>
            </>
          )
        )}
        <FAQButton />
      </StyledSidebar>
    </>
  )
}
