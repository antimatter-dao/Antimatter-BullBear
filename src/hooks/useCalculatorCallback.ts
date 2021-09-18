// import JSBI from 'jsbi'
import { ETHER } from '@uniswap/sdk'
import { useMemo } from 'react'
import { tryParseAmount } from 'state/swap/hooks'
import { useAntimatterContract } from './useContract'

const parseNumber = (val: string) => {
  return tryParseAmount(val, ETHER)?.raw.toString() ?? '0'
}

export function useCalculatorCallback(): {
  callback: null | ((...args: any[]) => Promise<any>)
} {
  const contract = useAntimatterContract()
  return useMemo(() => {
    if (!contract) return { callback: null }
    return {
      callback: async function onSwap(
        price: string,
        priceFloor: string,
        priceCap: string,
        totalCall: string,
        totalPut: string
      ): Promise<{
        priceCall: string
        pricePut: string
        totalUnd: string
        totalCur: string
        totalValue: string
      } | null> {
        if (!price || !priceFloor || !priceCap || !totalCall || !totalPut) {
          return null
        }
        return contract
          .calcPrice(
            parseNumber(price),
            parseNumber(priceFloor),
            parseNumber(priceCap),
            parseNumber(totalCall),
            parseNumber(totalPut)
          )
          .then((response: any) => {
            return {
              priceCall: response[0],
              pricePut: response[1],
              totalUnd: response[2],
              totalCur: response[3],
              totalValue: response[4]
            }
          })
          .catch((error: any) => {
            throw new Error(`Calculator fail: ${error.message}`)
          })
      }
    }
  }, [contract])
}
