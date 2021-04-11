import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import { TYPE, HideSmall } from '../../theme'
import { Text } from 'rebass'
import Card from '../../components/Card'
import { RowBetween, RowFixed } from '../../components/Row'
import { ButtonPrimary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'

import { useActiveWeb3React } from '../../hooks'
import { Dots } from '../../components/swap/styleds'
import AppBody from 'pages/AppBody'
import { useAllOptionTypes } from '../../state/market/hooks'
import { OptionCard } from '../../components/OptionCard'

const PageWrapper = styled(AutoColumn)`
  width: 100%;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const ButtonRow = styled(RowFixed)`
  gap: 8px;

  width: 100%;
  flex-direction: row-reverse;
  justify-content: space-between;
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;

  width: 48%;
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export default function MarketStrategy() {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()

  const optionTypes = useAllOptionTypes()

  return (
    <>
      <AppBody>
        <PageWrapper>
          <SwapPoolTabs active={'liquidity'} />
          <AutoColumn gap="lg" justify="center">
            <AutoColumn gap="lg" style={{ width: '100%' }}>
              <TitleRow padding={'0'}>
                <HideSmall>
                  <TYPE.mediumHeader style={{ justifySelf: 'flex-start' }}>Your Options</TYPE.mediumHeader>
                  <TYPE.white fontSize={14} style={{ justifySelf: 'flex-start', color: theme.text2, marginTop: '4px' }}>
                    Please choose your market strategy
                  </TYPE.white>
                </HideSmall>
              </TitleRow>
              <ButtonRow>
                <ResponsiveButtonPrimary as={Link} padding="14px 10px" to="/redeem">
                  Option redemption
                </ResponsiveButtonPrimary>
                <ResponsiveButtonPrimary id="join-pool-button" as={Link} padding="14px 10px" to="/generate">
                  <Text fontWeight={500} fontSize={16}>
                    Option generation
                  </Text>
                </ResponsiveButtonPrimary>
              </ButtonRow>

              {!account ? (
                <Card padding="12px" border={`1px solid ${theme.text3}`} borderRadius="14px">
                  <TYPE.body color={theme.text3} textAlign="center">
                    Connect to a wallet to view your options.
                  </TYPE.body>
                </Card>
              ) : optionTypes.length === 0 ? (
                <EmptyProposals>
                  <TYPE.body color={theme.text3} textAlign="center">
                    <Dots>Loading</Dots>
                  </TYPE.body>
                </EmptyProposals>
              ) : optionTypes.length > 0 ? (
                <>
                  {optionTypes.map(item => {
                    return <OptionCard key={item.id} optionType={item} />
                  })}
                </>
              ) : (
                <EmptyProposals>
                  <TYPE.body color={theme.text3} textAlign="center">
                    No token found.
                  </TYPE.body>
                </EmptyProposals>
              )}

              {/*<AutoColumn justify={'center'} gap="md" style={{ marginTop: '20px' }}>*/}
              {/*  <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>*/}
              {/*    {hasV1Liquidity ? 'Uniswap V1 liquidity found!' : "Don't see a pool you joined?"}{' '}*/}
              {/*    <StyledInternalLink*/}
              {/*      id="import-pool-link"*/}
              {/*      to={hasV1Liquidity ? '/migrate/v1' : '/find'}*/}
              {/*      style={{ color: theme.text1, textDecoration: 'underline' }}*/}
              {/*    >*/}
              {/*      {hasV1Liquidity ? 'Migrate now.' : 'Import it.'}*/}
              {/*    </StyledInternalLink>*/}
              {/*  </Text>*/}
              {/*</AutoColumn>*/}
            </AutoColumn>
          </AutoColumn>
        </PageWrapper>
      </AppBody>
    </>
  )
}
