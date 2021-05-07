import React from 'react'
import styled from 'styled-components'
import { Currency } from '@uniswap/sdk'
import Swap from 'pages/Swap'
import PairChart from 'components/PairChart'

const Wrapper = styled.div`
  min-height: 100%;
  display: flex;
`

const AdvanceInfoWrapper = styled.div`
  width: 100%;
  height: 100%;
`

export default function OptionSwap({
  currencyA,
  currencyB
}: {
  currencyA?: Currency | null
  currencyB?: Currency | null
}) {
  const {
    token0,
    token1,
    reserve0,
    reserve1,
    reserveUSD,
    trackedReserveUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    oneDayVolumeUntracked,
    volumeChangeUntracked,
    liquidityChangeUSD
  } = usePairData(pairAddress)
  return (
    <Wrapper>
      <Swap currencyA={currencyA} currencyB={currencyB}></Swap>
      <AdvanceInfoWrapper>
        <PairChart
          address={'0x6c8a55f67a7a6274d11e20bde30ee45049bdb570'}
          color={'#000000'}
          base0={reserve1 / reserve0}
          base1={reserve0 / reserve1}
        />
      </AdvanceInfoWrapper>
    </Wrapper>
  )
}
