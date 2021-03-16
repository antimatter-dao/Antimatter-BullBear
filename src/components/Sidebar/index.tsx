import React from 'react'
import styled from 'styled-components'
import { ReactComponent as Logo } from '../../assets/svg/antimatter_logo.svg'
import { NavLink } from 'react-router-dom'
const tabs = ['optionMarket', 'marketStrategy', 'liquidity', 'matterToken', 'governance', 'info']

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
`
const Tab = styled(NavLink)`
  width: 100%;
  border-left: 4px solid rgba(0, 0, 0, 0);
  color: ${({ theme }) => theme.text1};
  font-size: 1rem;
  padding: 16px 30px;
  opacity: 0.6;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    border-left: 4px solid;
    border-color: ${({ theme }) => theme.primary1};
    background-color: ${({ theme }) => theme.bg2};
    opacity: 1;
  }
`
const StyledLogo = styled(Logo)`
  width: 150px;
  margin: 38px auto 120px auto;
`

export default function Sidebar() {
  return (
    <StyledSidebar>
      <StyledLogo />
      {tabs.map(tab => (
        <Tab key={tab} id={tab} to={`/${tab}`}>
          {tab}
        </Tab>
      ))}
    </StyledSidebar>
  )
}
