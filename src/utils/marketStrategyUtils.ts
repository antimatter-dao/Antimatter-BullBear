import { Currency, ETHER, JSBI, Token, TokenAmount } from '@uniswap/sdk'
import { tryParseAmount } from 'state/swap/hooks'
import { absolute } from 'state/market/hooks'

export const isNegative = (val?: string): boolean => val?.toString()[0] === '-'

export const parseBalance = ({
  val,
  token,
  toSignificant = 6
}: {
  val?: string
  token: Token
  toSignificant?: number
}) => {
  const string = val?.toString()
  const amount = new TokenAmount(token, JSBI.BigInt(absolute(string ?? ''))).toSignificant(toSignificant)
  if (string && string[0] === '-') {
    return '-' + amount
  } else {
    return amount
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
