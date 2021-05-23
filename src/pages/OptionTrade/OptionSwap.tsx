import React, { useCallback, useEffect, useState } from 'react'
import { Currency } from '@uniswap/sdk'
import styled from 'styled-components'
import { createChart, ISeriesApi } from 'lightweight-charts'
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
  padding: 8px;
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
  const [lineSeries, setLineSeries] = useState<ISeriesApi<'Line'> | undefined>(undefined)
  const [isMarketPriceChart, setIsMarketPriceChart] = useState(true)
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
    setLineSeries(lineSeries)
    // lineSeries.setData([
    //   { time: '2019-04-11', value: 80.01 },
    //   { time: '2019-04-12', value: 96.63 },
    //   { time: '2019-04-13', value: 76.64 },
    //   { time: '2019-04-14', value: 81.89 },
    //   { time: '2019-04-15', value: 74.43 },
    //   { time: '2019-04-16', value: 80.01 },
    //   { time: '2019-04-17', value: 96.63 },
    //   { time: '2019-04-18', value: 76.64 },
    //   { time: '2019-04-19', value: 81.89 },
    //   { time: '2019-04-20', value: 74.43 }
    // ])
  }, [])

  useEffect(() => {
    if (lineSeries) {
      priceChartData && lineSeries.setData(priceChartData)
    }
  }, [lineSeries, priceChartData])

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
