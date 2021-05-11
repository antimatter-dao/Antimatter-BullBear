import React from 'react'
import { Currency, Pair } from '@uniswap/sdk'
import Swap from '../Swap'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
`
const IframeWrapper = styled.div`
  width: 100%;
  margin-left: 16px;
  max-height: 480px;
  overflow: hidden;
  border-radius: 32px;
  position: relative;
  iframe {
    position: absolute;
    top: -308px;
    left: -566px;
    width: 1196px;
    border: none;
    height: 2000px;
  }
`

export default function OptionSwap({
  currencyA,
  currencyB,
  pair
}: {
  currencyA?: Currency | null
  currencyB?: Currency | null
  pair: Pair | null | undefined
}) {
  const address = pair?.token0 && pair?.token1 ? Pair.getAddress(pair.token0, pair.token1) : ''
  return (
    <Wrapper>
      <Swap currencyA={currencyA} currencyB={currencyB}></Swap>
      <IframeWrapper>
        <iframe id="graph_iframe" src={`https://v2.info.uniswap.org/pair/${address}`} scrolling="no" />
      </IframeWrapper>
    </Wrapper>
  )
}
