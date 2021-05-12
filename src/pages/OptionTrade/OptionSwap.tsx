import React from 'react'
import { Currency } from '@uniswap/sdk'
import Swap from '../Swap'
import styled from 'styled-components'
import { currencyId } from 'utils/currencyId'
import { ExternalLink } from 'theme'

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
const Overlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.2);
  transition: .5s
  z-index: 5
  :hover {
    opacity: 100;
  }
`

const StyledExternalLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.bg1};
  background-color: ${({ theme }) => theme.primary1};
  border-radius: 40px;
  padding: 14px 40px;
  text-decoration: none;
  transition: 0.5s;
  font-weight: 500;
  :hover {
    background-color: ${({ theme }) => theme.primary4};
  }
`

export default function OptionSwap({
  currencyA,
  currencyB
}: {
  currencyA?: Currency | null
  currencyB?: Currency | null
}) {
  const url = `https://v2.info.uniswap.org/token/${currencyB ? currencyId(currencyB) : ''}`
  return (
    <Wrapper>
      <Swap currencyA={currencyA} currencyB={currencyB}></Swap>
      <IframeWrapper>
        <Overlay>
          <StyledExternalLink href={url}>Click to view more details</StyledExternalLink>
        </Overlay>
        <iframe id="graph_iframe" title="graph_iframe" src={url} scrolling="no" />
      </IframeWrapper>
    </Wrapper>
  )
}
