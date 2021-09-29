import { ChainId, Currency, WETH } from '@uniswap/sdk'
import { useActiveWeb3React } from 'hooks'
import { useMemo } from 'react'
import { tryParseAmount } from 'state/swap/hooks'
import { currencyId } from 'utils/currencyId'
import { useAntimatterContract } from './useContract'

const parseNumber = (val: string, currency: Currency) => {
  return tryParseAmount(val, currency)?.raw.toString() ?? '0'
}
const getAddress = (currency: Currency, chainId: ChainId) => {
  const id = currencyId(currency)
  if (id === 'ETH') {
    return currencyId(WETH[chainId as ChainId])
  }
  return id
}

export function useCreationCallback(): {
  callback: null | ((...args: any[]) => Promise<any>)
} {
  const contract = useAntimatterContract()
  const { chainId } = useActiveWeb3React()
  return useMemo(() => {
    if (!contract) return { callback: null }
    return {
      callback: async function(
        underlying: Currency,
        currency: Currency,
        priceFloor: string,
        priceCap: string
      ): Promise<{} | null> {
        if (!underlying || !currency || !priceCap || !priceFloor || !chainId) {
          return null
        }
        return contract.createOption(
          getAddress(underlying, chainId),
          getAddress(currency, chainId),
          parseNumber(priceFloor, currency),
          parseNumber(priceCap, currency)
        )
      }
    }
  }, [chainId, contract])
}
