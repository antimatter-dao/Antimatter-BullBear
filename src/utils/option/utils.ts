import { OptionTypeData } from 'state/market/hooks'
import { OptionInterface } from 'pages/OptionTrade'
import { parseBalance } from 'utils/marketStrategyUtils'
import { Token } from '@uniswap/sdk'
import { ZERO_ADDRESS } from 'constants/index'
import { DexTradeData } from './httpRequests'
import { UTCTimestamp } from 'lightweight-charts'

export const parsePrice = (price: string, decimals: string | number) =>
  parseBalance({
    val: price,
    token: new Token(1, ZERO_ADDRESS, Number(decimals ?? '18'))
  })

export function formatOptionType(allOptionType: OptionTypeData[]) {
  if (!Array.isArray(allOptionType)) {
    return []
  }
  return allOptionType.reduce((acc: OptionInterface[], item: OptionTypeData): OptionInterface[] => {
    const {
      currencyDecimals = '6',
      priceFloor,
      priceCap,
      underlying,
      underlyingSymbol,
      callAddress,
      putAddress,
      callBalance,
      underlyingDecimals,
      putBalance,
      currency,
      id
    } = item
    const floor = parsePrice(priceFloor, currencyDecimals)
    const cap = parsePrice(priceCap, currencyDecimals)
    const range = `$${floor} ~ $${cap}`
    const symbol = underlyingSymbol === 'WETH' ? 'ETH' : underlyingSymbol
    return [
      ...acc,
      {
        optionId: id,
        title: `${symbol ?? ''}(${floor}$${cap})`,
        underlyingAddress: underlying,
        currencyAddress: currency,
        underlyingSymbol: symbol,
        underlyingDecimals,
        optionType: id,
        addresses: {
          callAddress,
          putAddress
        },
        details: {
          'Option Price Range': range,
          'Underlying Asset': symbol ? symbol : '-',
          'Your Bull Position': parsePrice(callBalance, underlyingDecimals),
          'Your Bear Position': parsePrice(putBalance, underlyingDecimals)
        },
        range: { floor, cap }
      }
    ]
  }, [] as OptionInterface[])
}

interface DexTradeDataInputSingle {
  time: string
  close: string
  high: string
  low: string
  open: string
  price: string
}
interface DexTradeDataInput {
  [key: string]: DexTradeDataInputSingle[]
}

export const formatDexTradeData = (data: DexTradeDataInput | undefined): DexTradeData[] | undefined => {
  if (!data) return undefined
  let prevClose = 0
  return Object.keys(data).map(
    (timestamp, index): DexTradeData => {
      const list = data[timestamp as keyof typeof data]
      return list.reduce(
        (acc: DexTradeData, { high, low, open, time, price }, idx): DexTradeData => {
          const parsedHigh = parseFloat(high)
          const parsedLow = parseFloat(low)
          const parsedPrice = parseFloat(price)

          const res = {
            time: +time as UTCTimestamp,
            close: parsedPrice,
            // high: idx === 0 ? parsedHigh : acc.high > parsedPrice ? acc.high : parsedPrice,
            // low: idx === 0 ? parsedLow : acc.low < parsedPrice ? acc.low : parsedPrice,
            high: idx === 0 ? parsedHigh : acc.high > parsedHigh ? acc.high : parsedHigh,
            low: idx === 0 ? parsedLow : acc.low < parsedLow ? acc.low : parsedLow,
            open: index === 0 ? parseFloat(open) : prevClose
          }
          if (idx === list.length - 1) {
            prevClose = parsedPrice
          }
          return res
        },
        {
          time: new Date().getTime(),
          close: 0,
          high: 0,
          low: 0,
          open: 0
        } as DexTradeData
      )
    }
  )
}
export interface DexTradeLineData {
  time: UTCTimestamp
  value: number
}

export const formatDexTradeLineData = (data: DexTradeDataInput | undefined): DexTradeLineData[] | undefined => {
  if (!data) return undefined
  // let prevClose = 0
  const list = Object.keys(data).map(
    (timestamp): DexTradeLineData => {
      // const { time, price } = data[timestamp as keyof typeof data]
      const [{ time, price }] = data[timestamp as keyof typeof data]
      return {
        time: +time as UTCTimestamp,
        value: parseFloat(price)
      }
    }
  )
  return list
}

export interface Underlying {
  underlying: string
  underlyingDecimals: string
  underlyingSymbol: string
}

export const formatUnderlying = (
  data: {
    underlyingList: Underlying[]
  },
  chainId: number | undefined | null
) => {
  if (!data?.underlyingList || !chainId) return []

  const set = new Set()
  return data.underlyingList.reduce(
    (acc: Token[], { underlying, underlyingDecimals, underlyingSymbol }: Underlying) => {
      if (set.has(underlying)) return acc
      set.add(underlying)
      acc.push(new Token(chainId, underlying, underlyingDecimals ? parseInt(underlyingDecimals) : 18, underlyingSymbol))
      return acc
    },
    []
  )
}
