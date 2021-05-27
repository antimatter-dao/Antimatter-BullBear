import React, { useCallback, useEffect, useState } from 'react'
import { Currency } from '@uniswap/sdk'
import styled from 'styled-components'
import { createChart, IChartApi, ISeriesApi, LineStyle } from 'lightweight-charts'
import Swap from '../Swap'
import { getDexTradeList, DexTradeData } from 'utils/option/httpRequests'
import { currencyId } from 'utils/currencyId'
import { useNetwork } from 'hooks/useNetwork'
import { ButtonOutlinedPrimary } from 'components/Button'

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
  margin-left: 3px;
`
const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
  margin-left: 3px;
  position: relative;
`

const ButtonGroup = styled.div`
  width: 100%;
  position: absolute;
  display: flex;
  left: 30px;
  top: 15px;
  button:first-child {
    margin-right: 10px;
  }
`
const Button = styled(ButtonOutlinedPrimary)<{ isActive: boolean }>`
  flex-grow: 0;
  padding: 6px 14px;
  width: auto !important;
  :focus{
    border-color:${({ theme }) => theme.primary1}
    color:${({ theme }) => theme.primary1}
  }
  ${({ isActive, theme }) => (!isActive ? `border-color:${theme.text3}; color:${theme.text3};` : '')}

`

export default function OptionSwap({
  currencyA,
  currencyB
}: {
  currencyA?: Currency | null
  currencyB?: Currency | null
}) {
  const [priceChartData, setPriceChartData] = useState<DexTradeData[] | undefined>()
  const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<'Candlestick'> | undefined>(undefined)
  const [isMarketPriceChart, setIsMarketPriceChart] = useState(true)
  const [chart, setChart] = useState<IChartApi | undefined>(undefined)
  const {
    httpHandlingFunctions: { errorFunction },
    networkErrorModal
  } = useNetwork()
  useEffect(() => {
    const id = currencyB ? currencyId(currencyB) : undefined
    if (id) {
      getDexTradeList(
        (list: DexTradeData[] | undefined) => {
          setPriceChartData(list)
        },
        id,
        errorFunction
      )
    }
  }, [currencyB, errorFunction])

  useEffect(() => {
    const chart = createChart(document.getElementById('chart') ?? '', {
      width: 556,
      height: 354,
      // watermark: {
      //   visible: true,
      //   fontSize: 24,
      //   horzAlign: 'left',
      //   vertAlign: 'top',
      //   color: '#FFFFFF',
      //   text: '327.4739'
      // },
      layout: {
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Roboto'
      },
      grid: {
        vertLines: {
          style: LineStyle.Dotted,
          color: 'rgba(255, 255, 255, 0.4)'
        },
        horzLines: {
          style: LineStyle.Dotted,
          color: 'rgba(255, 255, 255, 0.4)'
        }
      }
    })
    chart.applyOptions({
      rightPriceScale: { autoScale: true },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        shiftVisibleRangeOnNewBar: true,
        tickMarkFormatter: (time: any) => {
          const date = new Date(time)
          const year = date.getUTCFullYear()
          const month = date.getUTCMonth()
          const day = date.getUTCDate()
          return year + '/' + month + '/' + day
        }
      },
      crosshair: {
        vertLine: {
          labelVisible: false
        }
      }
    })
    setChart(chart)
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#33E74F',
      downColor: '#FF0000',
      wickVisible: false,
      priceFormat: {
        type: 'price',
        precision: 2
      }
    })
    setCandlestickSeries(candlestickSeries)
  }, [])

  useEffect(() => {
    if (candlestickSeries) {
      priceChartData && candlestickSeries.setData(priceChartData)
    }
    if (chart) {
      chart.timeScale().fitContent()
    }
  }, [candlestickSeries, priceChartData, chart])

  const handleMarketPriceChart = useCallback(() => setIsMarketPriceChart(true), [])
  const handleModalChart = useCallback(() => setIsMarketPriceChart(false), [])

  return (
    <>
      {networkErrorModal}
      <Wrapper>
        <Swap currencyA={currencyA} currencyB={currencyB} />
        <ChartWrapper>
          <ButtonGroup>
            <Button isActive={isMarketPriceChart} onClick={handleMarketPriceChart}>
              MarketPrice
            </Button>
            <Button isActive={!isMarketPriceChart} onClick={handleModalChart}>
              Price Modeling Prediction
            </Button>
          </ButtonGroup>
          <Chart id="chart" />
        </ChartWrapper>
      </Wrapper>
    </>
  )
}
