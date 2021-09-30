import React, { useCallback, useEffect, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, LineStyle } from 'lightweight-charts'
import styled from 'styled-components'
import Swap, { OptionField } from '../Swap'
import { Option, OptionPrice } from '../../state/market/hooks'
import SwitchTab from 'components/SwitchTab'
import { Axios } from 'utils/option/axios'
import { useActiveWeb3React } from 'hooks'
import { DexTradeData } from 'utils/option/httpRequests'
import { useNetwork } from 'hooks/useNetwork'
import { ButtonOutlinedPrimary } from 'components/Button'
import { formatDexTradeData } from 'utils/option/utils'

const Wrapper = styled.div`
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  gap: 20px
  `}
`

const GraphWrapper = styled.div`
  margin: 20px 40px;
  width: 100%;
  height: 100%;
  position: relative;
  max-width: 559px;
  /* ${({ theme }) => theme.mediaWidth.upToMedium`
  max-width: 50%;
  `} */
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: auto;
  margin: 20px 24px 20px 14px;
  max-width: unset
  `}
`

const Chart = styled.div`
  background-color: #000;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 3px;
`
// const ChartWrapper = styled.div`
//   width: 100%;
//   height: 100%;
//   margin-left: 3px;
//   position: relative;
// `

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  margin: 36px 0;
  button:first-child {
    margin-right: 10px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
  button{
    font-size: 14px
  }
  `}
`
const Button = styled(ButtonOutlinedPrimary)<{ isActive: boolean }>`
  flex-grow: 0;
  padding: 6px 14px;
  width: auto !important;
  :focus {
    border-color: ${({ theme }) => theme.primary1};
    color: ${({ theme }) => theme.primary1};
  }
  ${({ isActive, theme }) => (!isActive ? `border-color:${theme.text3}; color:${theme.text3};` : '')}
`

const CurrentPrice = styled.div`
  position: absolute;
  right: 0;
  top: 7;
  white-space: nowrap;
  font-size: 18px;
  font-weight: 500;
  font-family: Futura PT;
  color: ${({ theme }) => theme.primary1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    white-space: pre-wrap;
    text-align: right;
    font-size: 14px;
    font-weight: 400;
  `}
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    font-size: 12px;
  `}
`

const Tabs = {
  CALL: 'Call Token',
  PUT: 'Put Token'
}

export default function OptionSwap({
  option,
  optionType,
  handleOptionType,
  optionPrice
}: {
  option?: Option
  optionType: string
  handleOptionType: (option: string) => void
  optionPrice: OptionPrice | undefined
}) {
  const { chainId } = useActiveWeb3React()
  const [currentTab, setCurrentTab] = useState<keyof typeof Tabs>('CALL')
  const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<'Candlestick'> | undefined>(undefined)
  const [isMarketPriceChart, setIsMarketPriceChart] = useState(true)
  const [chart, setChart] = useState<IChartApi | undefined>(undefined)
  const [callChartData, setCallChartData] = useState<DexTradeData[] | undefined>(undefined)
  const [putChartData, setPutChartData] = useState<DexTradeData[] | undefined>(undefined)
  const [graphLoading, setGraphLoading] = useState(true)

  const priceCall = optionPrice?.priceCall
  const pricePut = optionPrice?.pricePut

  const {
    httpHandlingFunctions: { errorFunction, pendingFunction, pendingCompleteFunction },
    NetworkErrorModal,
    NetworkPendingSpinner
  } = useNetwork()

  useEffect(() => {
    pendingFunction()
    const callId = option?.callToken?.address ?? undefined
    const putId = option?.putToken?.address ?? undefined

    if (!callId || !putId) return

    const complete = { call: false, put: false }

    if (callId) {
      Axios.get('getDexTradesList', { chainId: chainId, tokenAddress: callId })
        .then(r => {
          complete.call = true
          if (r.data) {
            setCallChartData(formatDexTradeData(r.data.data))
          }
          if (complete.put) {
            pendingCompleteFunction()
            setGraphLoading(false)
          }
        })
        .catch(() => errorFunction())
    }
    if (putId) {
      Axios.get('getDexTradesList', { chainId: chainId, tokenAddress: putId })
        .then(r => {
          complete.put = true
          if (r.data) {
            setPutChartData(formatDexTradeData(r.data.data))
          }
          if (complete.call) {
            pendingCompleteFunction()
            setGraphLoading(false)
          }
        })
        .catch(() => errorFunction())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chainId,
    errorFunction,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    option?.callToken?.address,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    option?.putToken?.address,
    pendingCompleteFunction,
    pendingFunction
  ])

  useEffect(() => {
    const chartElement = document.getElementById('chart') ?? ''
    const chart = createChart(chartElement, {
      width: chartElement ? chartElement.offsetWidth : 556,
      height: 328,
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
      leftPriceScale: { autoScale: true, visible: true },
      rightPriceScale: { visible: false },
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
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true
      }
    })
    const resizeFunction = () => {
      chart.resize(chartElement ? chartElement.offsetWidth : 556, 328)
    }
    window.addEventListener('resize', resizeFunction)
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
    return () => window.removeEventListener('resize', resizeFunction)
  }, [])

  useEffect(() => {
    if (candlestickSeries) {
      if (currentTab === 'CALL') {
        callChartData && candlestickSeries.setData(callChartData)
      } else {
        putChartData && candlestickSeries.setData(putChartData)
      }
    }
    if (chart) {
      chart.timeScale().fitContent()
    }
  }, [candlestickSeries, chart, currentTab, putChartData, callChartData])

  const handleMarketPriceChart = useCallback(() => setIsMarketPriceChart(true), [])
  // const handleModalChart = useCallback(() => setIsMarketPriceChart(false), [])

  const handleTabClick = useCallback(
    (tab: string) => () => {
      setCurrentTab(tab as keyof typeof Tabs)
    },
    []
  )

  return (
    <>
      <NetworkErrorModal />
      <Wrapper>
        <Swap optionPrice={optionPrice} handleOptionType={handleOptionType} option={option} />
        <GraphWrapper>
          {graphLoading && <NetworkPendingSpinner paddingTop="0" />}
          <CurrentPrice>
            Current price: {'\n'}${' '}
            {currentTab === OptionField.CALL
              ? priceCall
                ? priceCall.toSignificant(6)
                : '-'
              : pricePut
              ? pricePut.toSignificant(6)
              : '-'}
          </CurrentPrice>
          <SwitchTab onTabClick={handleTabClick} currentTab={currentTab} tabs={Tabs} />

          <ButtonGroup>
            <Button isActive={isMarketPriceChart} onClick={handleMarketPriceChart}>
              MarketPrice
            </Button>
            {/* <Button isActive={!isMarketPriceChart} onClick={handleModalChart}>
              Price Modeling Prediction
            </Button> */}
          </ButtonGroup>

          <Chart id="chart" />
        </GraphWrapper>
      </Wrapper>
    </>
  )
}
