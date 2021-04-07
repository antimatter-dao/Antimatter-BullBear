import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'react-feather'
import styled from 'styled-components'
// import { useTranslation } from 'react-i18next'
import { ReactComponent as Logo } from '../../assets/svg/antimatter_logo.svg'
import { ReactComponent as Menu } from '../../assets/svg/menu.svg'
import { headerHeight } from '../Header'
import { AutoColumn } from 'components/Column'
import { Base } from '../Button'

const tabs = [
  { title: 'Option Trading', route: 'option_trading' },
  { title: 'Option Exercise', route: 'option_exercise' },
  { title: 'Liquidity', route: 'liquidity' },
  {
    title: 'Matter Token',
    route: 'matter_token',
    children: [
      {
        title: 'Liquidity Mining',
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
  height:  calc(100vh - ${headerHeight});
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
  margin: 38px auto 120px auto;
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
  z-index:2;
  position: absolute;
  left: 0;
  width: 100vw;
  border-radius: 32px;
  background: ${({ theme }) => theme.gradient2}
  top: ${({ theme }) => theme.mobileHeaderHeight}
  height:calc(100vh - ${({ theme }) => theme.mobileHeaderHeight});
`

function ToggleMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ToggleMenuButton onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X /> : <Menu />}</ToggleMenuButton>
      {isOpen && (
        <TogggleMenuWrapper>
          <AutoColumn>
            {tabs.map(({ title, route }) => (
              <TabBasic key={title} to={`/${route}`} onClick={() => setIsOpen(!isOpen)}>
                {title}
              </TabBasic>
            ))}
          </AutoColumn>
        </TogggleMenuWrapper>
      )}
    </>
  )
}

export default function Sidebar() {
  return (
    <>
      <MobileHeader>
        <Logo />
        <ToggleMenu />
      </MobileHeader>
      <StyledSidebar>
        {/* <Title href=".">
        <UniIcon>
          <img width={'24px'} src={darkMode ? LogoDark : Logo} alt="logo" />
        </UniIcon>
      </Title> */}
        <StyledLogo />
        {tabs.map(({ title, route, children }) =>
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
            <>
              <Tab
                key={title}
                to={`/${route}`}
                isActive={(match, { pathname }) => Boolean(match) || pathname.startsWith('/matter')}
              >
                {title}
              </Tab>
              {children &&
                children.map(({ title, route }) => {
                  return (
                    <SubTab
                      key={title}
                      isActive={(match, { pathname }) =>
                        Boolean(match) || pathname.startsWith('/generate') || pathname.startsWith('/redeem')
                      }
                      to={`/${route}`}
                    >
                      {title}
                    </SubTab>
                  )
                })}
              {children && <TabDivider />}
            </>
          ) : (
            <>
              <Tab key={title} to={`/${route}`}>
                {title}
              </Tab>
            </>
          )
        )}
      </StyledSidebar>
    </>
  )
}
