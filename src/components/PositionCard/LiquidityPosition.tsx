import { JSBI, Pair, Percent, TokenAmount } from '@uniswap/sdk'
import { darken } from 'polished'
import React from 'react'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ButtonPrimary, ButtonOutlined } from '../Button'
import { transparentize } from 'polished'
import { CardNoise } from '../earn/styled'

import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import { Dots } from '../swap/styleds'
import { BIG_INT_ZERO } from '../../constants'
import useTheme from 'hooks/useTheme'
import { ExternalLink } from 'theme'
import Card, { LightCard } from 'components/Card'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`
const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: none;
  background: ${({ theme, bgColor }) =>
    bgColor
      ? `radial-gradient(91.85% 100% at 1.84% 0%, ${transparentize(0.8, bgColor)} 0%, ${theme.bg3} 100%)`
      : 'transparent'};
  position: relative;
  overflow: hidden;
`

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount // optional balance to indicate that liquidity is deposited in mining pool
}

export default function FullPositionCard({ pair, border, stakedBalance }: PositionCardProps) {
  const { account } = useActiveWeb3React()

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const userDefaultPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  // if staked balance balance provided, add to standard liquidity amount
  const userPoolBalance = stakedBalance ? userDefaultPoolBalance?.add(stakedBalance) : userDefaultPoolBalance

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  const backgroundColor = undefined
  const theme = useTheme()

  return (
    <StyledPositionCard border={border} bgColor={backgroundColor} style={{ padding: '14px' }}>
      <CardNoise />
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <AutoRow gap="8px">
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
            <Text fontWeight={500} fontSize={16}>
              {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}
            </Text>
          </AutoRow>
        </FixedHeightRow>

        <AutoColumn gap="8px">
          <FixedHeightRow>
            <Text fontSize={12} fontWeight={500} color={theme.text3}>
              Your total pool tokens:
            </Text>
            <Text fontSize={12} fontWeight={500}>
              {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
            </Text>
          </FixedHeightRow>
          {stakedBalance && (
            <FixedHeightRow>
              <Text fontSize={12} fontWeight={500} color={theme.text3}>
                Pool tokens in rewards pool:
              </Text>
              <Text fontSize={12} fontWeight={500}>
                {stakedBalance.toSignificant(4)}
              </Text>
            </FixedHeightRow>
          )}
          <FixedHeightRow>
            <RowFixed>
              <Text fontSize={12} fontWeight={500} color={theme.text3}>
                Pooled {currency0.symbol}:
              </Text>
            </RowFixed>
            {token0Deposited ? (
              <RowFixed>
                <Text fontSize={12} fontWeight={500} marginLeft={'6px'}>
                  {token0Deposited?.toSignificant(6)}
                </Text>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
              </RowFixed>
            ) : (
              '-'
            )}
          </FixedHeightRow>

          <FixedHeightRow>
            <RowFixed>
              <Text fontSize={12} fontWeight={500} color={theme.text3}>
                Pooled {currency1.symbol}:
              </Text>
            </RowFixed>
            {token1Deposited ? (
              <RowFixed>
                <Text fontSize={12} fontWeight={500} marginLeft={'6px'}>
                  {token1Deposited?.toSignificant(6)}
                </Text>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
              </RowFixed>
            ) : (
              '-'
            )}
          </FixedHeightRow>

          <FixedHeightRow>
            <Text fontSize={12} fontWeight={500} color={theme.text3}>
              Your pool share:
            </Text>
            <Text fontSize={12} fontWeight={500}>
              {poolTokenPercentage
                ? (poolTokenPercentage.toFixed(2) === '0.00' ? '<0.01' : poolTokenPercentage.toFixed(2)) + '%'
                : '-'}
            </Text>
          </FixedHeightRow>

          <ExternalLink
            style={{ width: '100%', textAlign: 'center', color: theme.text1 }}
            href={`https://info.uniswap.org/#/account/${account}`}
          >
            View accrued fees and analytics
          </ExternalLink>

          {userDefaultPoolBalance && JSBI.greaterThan(userDefaultPoolBalance.raw, BIG_INT_ZERO) && (
            <RowBetween marginTop="10px">
              <ButtonOutlined
                style={{ color: theme.primary1, borderColor: theme.primary1 }}
                padding="4px"
                as={Link}
                width="48%"
                to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
              >
                Remove
              </ButtonOutlined>
            </RowBetween>
          )}
          {stakedBalance && JSBI.greaterThan(stakedBalance.raw, BIG_INT_ZERO) && (
            <ButtonPrimary
              padding="8px"
              borderRadius="8px"
              as={Link}
              to={`/uni/${currencyId(currency0)}/${currencyId(currency1)}`}
              width="100%"
            >
              Manage Liquidity in Rewards Pool
            </ButtonPrimary>
          )}
        </AutoColumn>
      </AutoColumn>
    </StyledPositionCard>
  )
}
