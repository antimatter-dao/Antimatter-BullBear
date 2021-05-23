import React, { useEffect } from 'react'
import { Currency } from '@uniswap/sdk'
import styled from 'styled-components'
import { createChart } from 'lightweight-charts'
import Swap from '../Swap'

const Wrapper = styled.div`
  display: flex;
`

const Chart = styled.div`
  background-color: #000;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 72px;
`

export default function OptionSwap({
  currencyA,
  currencyB
}: {
  currencyA?: Currency | null
  currencyB?: Currency | null
}) {
  useEffect(() => {
    const chart = createChart(document.getElementById('chart') ?? '', {
      width: 556,
      height: 354,
      watermark: {
        visible: true,
        fontSize: 24,
        horzAlign: 'left',
        vertAlign: 'top',
        color: '#FFFFFF',
        text: '327.4739'
      },
      layout: {
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Roboto'
      },
      grid: {
        vertLines: {
          color: 'rgba(197, 203, 206, 0.5)'
        },
        horzLines: {
          color: 'rgba(197, 203, 206, 0.5)'
        }
      }
    })
    const lineSeries = chart.addLineSeries({
      color: '#33E74F',
      lineWidth: 1
    })
    lineSeries.setData([
      { time: '2019-04-11', value: 80.01 },
      { time: '2019-04-12', value: 96.63 },
      { time: '2019-04-13', value: 76.64 },
      { time: '2019-04-14', value: 81.89 },
      { time: '2019-04-15', value: 74.43 },
      { time: '2019-04-16', value: 80.01 },
      { time: '2019-04-17', value: 96.63 },
      { time: '2019-04-18', value: 76.64 },
      { time: '2019-04-19', value: 81.89 },
      { time: '2019-04-20', value: 74.43 }
    ])
  }, [])

  return (
    <Wrapper>
      <Swap currencyA={currencyA} currencyB={currencyB}/>
      <Chart id="chart" />
    </Wrapper>
  )
}
