import { Trade, TradeType } from '@uniswap/sdk'
import DataCard from 'components/Card/DataCard'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE, ExternalLink } from '../../theme'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '../../utils/prices'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import SwapRoute from './SwapRoute'

const InfoLink = styled(ExternalLink)`
  display:block
  padding: 6px 6px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  margin: 0 auto;
  text-decoration: none;
`

export interface AdvancedSwapDetailsProps {
  trade?: Trade
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const theme = useContext(ThemeContext)

  const [allowedSlippage] = useUserSlippageTolerance()
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade && trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return (
    <>
      <AutoColumn gap="0px">
        {trade ? (
          <>
            <DataCard
              data={[
                {
                  title: (
                    <>
                      {isExactIn ? 'Minimum received' : 'Maximum sold'}
                      <QuestionHelper
                        text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
                        size={12}
                      />
                    </>
                  ),
                  content: isExactIn
                    ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${
                        trade.outputAmount.currency.symbol
                      }` ?? '-'
                    : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${
                        trade.inputAmount.currency.symbol
                      }` ?? '-'
                },
                {
                  title: (
                    <>
                      Price Impact
                      <QuestionHelper
                        text="The difference between the market price and estimated price due to trade size."
                        size={12}
                      />
                    </>
                  ),
                  content: <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
                },
                {
                  title: (
                    <>
                      Liquidity Provider Fee
                      <QuestionHelper
                        text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive."
                        size={12}
                      />
                    </>
                  ),
                  content: realizedLPFee
                    ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}`
                    : '-'
                }
              ]}
              cardBottom={
                <>
                  {showRoute && (
                    <>
                      <RowBetween style={{ padding: '0 16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
                            Route
                          </TYPE.black>
                          <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
                        </span>
                        <SwapRoute trade={trade} />
                      </RowBetween>
                    </>
                  )}
                  {!showRoute && (
                    <InfoLink
                      href={'https://info.uniswap.org/#/pools' + trade.route.pairs[0].liquidityToken.address}
                      target="_blank"
                    >
                      View pair analytics
                    </InfoLink>
                  )}
                </>
              }
            />
          </>
        ) : (
          <DataCard
            data={[
              {
                title: (
                  <>
                    {isExactIn ? 'Minimum received' : 'Maximum sold'}
                    <QuestionHelper
                      text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
                      size={12}
                    />
                  </>
                ),
                content: '-'
              },
              {
                title: (
                  <>
                    Price Impact
                    <QuestionHelper
                      text="The difference between the market price and estimated price due to trade size."
                      size={12}
                    />
                  </>
                ),
                content: '-'
              },
              {
                title: (
                  <>
                    Liquidity Provider Fee
                    <QuestionHelper
                      text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive."
                      size={12}
                    />
                  </>
                ),
                content: '-'
              }
            ]}
          />
        )}
      </AutoColumn>
    </>
  )
}
