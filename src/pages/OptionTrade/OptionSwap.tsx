import React from 'react'
import { Currency } from '@uniswap/sdk'
import Swap from '../Swap'
import styled from 'styled-components'
import { currencyId } from 'utils/currencyId'

const Wrapper = styled.div`
  display: flex;
`
const IframeWrapper = styled.div`
  width: 100%;
  margin: 0 0 0 16px;
  max-height: 480px;
  overflow: hidden;
  position: relative;
  iframe {
    position: absolute;
    top: -207px;
    left: -573px;
    width: 1229px
    border: none;
    height: 2000px;
  }
`

export default function OptionSwap({
  currencyA,
  currencyB
}: {
  currencyA?: Currency | null
  currencyB?: Currency | null
}) {
  return (
    <Wrapper>
      <Swap currencyA={currencyA} currencyB={currencyB}></Swap>
      <IframeWrapper>
        <iframe
          id="graph_iframe"
          title="graph_iframe"
          src={`https://v2.info.uniswap.org/token/${currencyB ? currencyId(currencyB) : ''}`}
          scrolling="no"
        />
      </IframeWrapper>
    </Wrapper>
  )
}
