import React from 'react'
import { NavLink } from 'react-router-dom'
// import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ReactComponent as Logo } from '../../assets/svg/antimatter_logo.svg'
import { headerHeight } from '../Header'

const tabs = [
  { title: 'Option Trading', route: 'swap' },
  { title: 'Market Strategy', route: 'markeStrategy' },
  {
    title: 'Liquidity',
    route: 'pool'
  },
  { title: 'Option Exercise', route: 'option exercise' },
  { title: 'Matter Token', route: 'matterToken' },
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
`

const activeClassName = 'active'
const Tab = styled(NavLink)`
  width: 100%;
  border-left: 4px solid transparent;
  color: ${({ theme }) => theme.text1};
  font-size: 1rem;
  padding: 16px 30px;
  opacity: 0.6;
  cursor: pointer;
  text-decoration: none;

  &.${activeClassName}, :hover,
  :focus {
    border-left: 4px solid;
    border-color: ${({ theme }) => theme.primary1};
    background-color: ${({ theme }) => theme.translucent};
    opacity: 1;
  }
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

export default function Sidebar() {
  return (
    <StyledSidebar>
      {/* <Title href=".">
        <UniIcon>
          <img width={'24px'} src={darkMode ? LogoDark : Logo} alt="logo" />
        </UniIcon>
      </Title> */}
      <StyledLogo />
      {tabs.map(({ title, route }) =>
        route === 'pool' ? (
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
        ) : (
          <Tab key={title} to={`/${route}`}>
            {title}
          </Tab>
        )
      )}
    </StyledSidebar>
  )
}
