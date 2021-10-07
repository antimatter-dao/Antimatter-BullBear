import { ChainId, Currency, ETHER, Token } from '@uniswap/sdk'
import { Symbol } from 'constants/index'

export function getCurrencySymbol(currency: Currency, chainId: ChainId | undefined): string {
  if (currency === ETHER) return Symbol[chainId ?? 1] ?? ''
  if (currency instanceof Token) return currency.symbol ?? ''
  return ''
}
