import { Currency, CurrencyAmount, ETHER, JSBI } from '@uniswap/sdk'
import { tryParseAmount } from 'state/swap/hooks'
import { absolute } from 'state/market/hooks'

export const isNegative = (val?: string): boolean => val?.toString()[0] === '-'

export const parseBalance = (val?: string, toSignificant?: number) => {
  const string = val?.toString()
  if (string && string[0] === '-') {
    return '-' + CurrencyAmount.ether(absolute(string)).toSignificant(toSignificant ?? 6)
  }
  return val ? CurrencyAmount.ether(val).toSignificant(toSignificant ?? 6) : ''
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
