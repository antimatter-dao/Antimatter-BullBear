import { Trade } from '@uniswap/sdk'
import DataCard from 'components/Card/DataCard'
import React from 'react'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'

// const InfoLink = styled(ExternalLink)`
//   display:block
//   padding: 6px 6px;
//   border-radius: 8px;
//   text-align: center;
//   font-size: 14px;
//   color: ${({ theme }) => theme.text1};
//   margin: 0 auto;
//   text-decoration: none;
// `

export interface AdvancedSwapDetailsProps {
  trade?: Trade
  undTrade?: Trade
  curTrade?: Trade
}

export function AdvancedSwapDetails({ undTrade, curTrade }: AdvancedSwapDetailsProps) {
  return (
    <>
      <AutoColumn gap="0px">
        <DataCard
          data={[
            {
              title: (
                <>
                  Ratio
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
      </AutoColumn>
    </>
  )
}
