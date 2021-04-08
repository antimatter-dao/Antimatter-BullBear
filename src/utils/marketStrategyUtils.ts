import { Currency, CurrencyAmount, ETHER, JSBI } from '@uniswap/sdk'
import { tryParseAmount } from 'state/swap/hooks'
import { absolute } from 'state/market/hooks'

export const isNegative = (val?: string): boolean => val?.toString()[0] === '-'

const precisionUtil = (string: string, precision: number) => {
  return (parseInt(string) * Math.pow(10, 18 - precision)).toString()
}

export const parseBalance = (val?: string, toSignificant = 6, precisionString = '18') => {
  console.log(val?.toString(), precisionString)
  const precision = parseInt(precisionString)
  const string = val?.toString()
  if (!string) return ''
  const digit = toSignificant + (18 - precision)
  const beforePrecision = CurrencyAmount.ether(absolute(string)).toSignificant(digit)

  const withPrecision = precision === 18 ? beforePrecision : precisionUtil(beforePrecision, precision)
  if (string && string[0] === '-') {
    return '-' + withPrecision
  } else {
    return withPrecision
  }
}
export const parsedGreaterThan = (userInput: string, balance: string) => {
  if (userInput && balance) {
    const v1 = tryParseAmount(userInput, ETHER)?.raw
    const v2 = JSBI.BigInt(balance.toString())
    return v1 && v2 ? JSBI.greaterThan(v1, v2) : undefined
  }
  return
}
export const currencyNameHelper = (currency?: Currency | null, defaultString?: string) =>
  (currency && currency.symbol && currency.symbol.length > 20
    ? currency.symbol.slice(0, 4) + '...' + currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
    : currency?.symbol === 'WETH'
    ? 'ETH'
    : currency?.symbol) ||
  defaultString ||
  ''
