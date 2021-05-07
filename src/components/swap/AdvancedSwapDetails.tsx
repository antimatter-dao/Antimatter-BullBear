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
                      href={'https://uniswap.info/pair/' + trade.route.pairs[0].liquidityToken.address}
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
      <iframe
        id="tradingview_c46b0"
        name="tradingview_c46b0"
        src="https://www.dextools.io/app/assets/vendors/charting_library/en-tv-chart.b555c6a4.html#symbol=DEXT%2FUSD%20-%20UNI&amp;interval=D&amp;widgetbar=%7B%22details%22%3Afalse%2C%22watchlist%22%3Afalse%2C%22watchlist_settings%22%3A%7B%22default_symbols%22%3A%5B%5D%7D%7D&amp;timeFrames=%5B%7B%22text%22%3A%225y%22%2C%22resolution%22%3A%221W%22%7D%2C%7B%22text%22%3A%221y%22%2C%22resolution%22%3A%221W%22%7D%2C%7B%22text%22%3A%226m%22%2C%22resolution%22%3A%22120%22%7D%2C%7B%22text%22%3A%223m%22%2C%22resolution%22%3A%2260%22%7D%2C%7B%22text%22%3A%221m%22%2C%22resolution%22%3A%2230%22%7D%2C%7B%22text%22%3A%225d%22%2C%22resolution%22%3A%225%22%7D%2C%7B%22text%22%3A%221d%22%2C%22resolution%22%3A%221%22%7D%5D&amp;locale=en&amp;uid=tradingview_c46b0&amp;clientId=0x37a0464f8f4c207b54821f3c799afd3d262aa944&amp;userId=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0IjoiVTJGc2RHVmtYMS9YUDRjZExWSjlPbjl1SVNFdUpaamxXdHd2eWQ2TzVhSDVhRlNuYngwekozSTJkZEYwVWFMZTlKallsY0hTL0VyMU1adVFnbjVvZEdseGxlN0ZCYjFvM0EyN0pFTFd0QkpUOE5TQ2RtTmJoTHRUWURScnA4WHdKWDlnUDFDSEVxaTRUM0R5ak9LaTlBPT0iLCJpYXQiOjE2MjA0MDc5NjUsImV4cCI6MTYyMDQwODM2NX0.e0PH8Cl5TibjGbklOYpj7yZ3JYl6yFg77T8MKRaETRY&amp;chartsStorageVer=1&amp;customCSS=css%2Fcustom_dext_dark.css%3F%24%7BHelpersService.APP_VERSION%7D&amp;debug=false&amp;timezone=Asia%2FShanghai&amp;theme=dark"
        frameBorder="0"
        allowTransparency={true}
        scrolling="no"
        allowFullScreen={false}
        style={{display: 'block', width: '100%', height: 722}}
      ></iframe>
    </>
  )
}
