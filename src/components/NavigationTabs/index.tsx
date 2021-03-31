import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { useTranslation } from 'react-i18next'
import { NavLink, Link as HistoryLink } from 'react-router-dom'
import { ArrowLeft } from 'react-feather'
import { RowBetween } from '../Row'
// import QuestionHelper from '../QuestionHelper'
import Settings, { SLIPPAGE_TYPE } from '../Settings'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { resetMintState } from 'state/mint/actions'
import { TYPE } from 'theme'
import Setting from '../Settings'

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 20px;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.text1};
`

export function SwapPoolTabs({ active }: { active: 'option_trading' | 'liquidity' }) {
  const { t } = useTranslation()
  return (
    <Tabs style={{ marginBottom: '20px', display: 'none' }}>
      <StyledNavLink id={`swap-nav-link`} to={'/option_trading'} isActive={() => active === 'option_trading'}>
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink id={`pool-nav-link`} to={'/liquidity'} isActive={() => active === 'liquidity'}>
        {t('pool')}
      </StyledNavLink>
    </Tabs>
  )
}

export function FindPoolTabs() {
  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <HistoryLink to="/liquidity">
          <StyledArrowLeft />
        </HistoryLink>
        <TYPE.mediumHeader>Import Pool</TYPE.mediumHeader>
        <Settings />
      </RowBetween>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding, creating }: { adding: boolean; creating: boolean }) {
  // reset states on back
  const dispatch = useDispatch<AppDispatch>()

  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <HistoryLink
          to="/liquidity"
          onClick={() => {
            adding && dispatch(resetMintState())
          }}
        >
          <StyledArrowLeft />
        </HistoryLink>
        <TYPE.mediumHeader>
          {creating ? 'Create a pair' : adding ? 'Add Liquidity' : 'Remove Liquidity'}
        </TYPE.mediumHeader>
        <Settings />
      </RowBetween>
    </Tabs>
  )
}

export function MarketStrategyTabs({ generation }: { generation: boolean }) {
  // reset states on back
  //const dispatch = useDispatch<AppDispatch>()

  return (
    <Tabs>
      <RowBetween style={{ padding: '0rem 1rem 0 1rem' }}>
        <HistoryLink
          to="/option_exercise"
          onClick={() => {
            //adding && dispatch(resetMintState())
          }}
        >
          <StyledArrowLeft />
        </HistoryLink>
        <TYPE.mediumHeader>{generation ? 'Generation' : 'Redemption'}</TYPE.mediumHeader>
        <Setting onlySlippage={true} slippageType={generation ? SLIPPAGE_TYPE.generation : SLIPPAGE_TYPE.redeem} />
      </RowBetween>
    </Tabs>
  )
}
