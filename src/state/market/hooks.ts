import { useAntimatterContract, useAttributesContract } from '../../hooks/useContract'
import {
  NEVER_RELOAD,
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData
} from '../multicall/hooks'
import { Interface } from '@ethersproject/abi'
import CALL_OR_PUT_ABI from '../../constants/abis/callOrPut.json'
import { useMemo } from 'react'
import ERC20_INTERFACE from '../../constants/abis/erc20'
import { useActiveWeb3React } from '../../hooks'
import { useUserSlippageTolerance } from '../user/hooks'
import { Currency, CurrencyAmount, JSBI, Token, TokenAmount, WETH } from '@uniswap/sdk'
import { RouteDelta, tryFormatAmount, tryParseAmount, useOptionSwapInfo, useRouteDelta } from '../swap/hooks'
import { useToken } from '../../hooks/Tokens'
import { useTotalSupply } from '../../data/TotalSupply'
const CALL_OR_PUT_INTERFACE = new Interface(CALL_OR_PUT_ABI)

export interface OptionTypeData {
  id: string
  callAddress: string
  putAddress: string
  callBalance: string
  putBalance: string
  callTotal: string
  putTotal: string
  underlying: string
  currency: string
  priceFloor: string
  priceCap: string
  underlyingSymbol?: string
  currencySymbol?: string
  underlyingDecimals: string
  currencyDecimals: string
}

export interface DeltaData {
  dUnd: string
  dCur: string
  totalUnd: string
  totalCur: string
  callBalance?: string
  putBalance?: string
  underlyingBalance?: number | undefined
  currencyBalance?: number | undefined
}

export interface Option {
  call: TokenAmount | undefined | null
  put: TokenAmount | undefined | null
  underlying: Token | undefined | null
  currency: Token | undefined | null
  priceFloor: string | undefined
  priceCap: string | undefined
}

export function useOptionTypeCount(): number {
  const antimatterContract = useAntimatterContract()
  const res = useSingleCallResult(antimatterContract, 'length')
  if (res.result && !res.loading) {
    return parseInt(res.result[0])
  }
  return 0
}

export function useAllOptionTypes() {
  const { account } = useActiveWeb3React()
  const antimatterContract = useAntimatterContract()
  const optionTypeCount = useOptionTypeCount()
  const optionTypeIndexes = useMemo(() => {
    return Array.from({ length: optionTypeCount }, (v, i) => [i])
  }, [optionTypeCount])

  const callAddressesRes = useSingleContractMultipleData(antimatterContract, 'allCalls', optionTypeIndexes)
  const putAddressesRes = useSingleContractMultipleData(antimatterContract, 'allPuts', optionTypeIndexes)
  const callAddresses = useMemo(() => {
    return callAddressesRes
      .filter(item => {
        return item.result
      })
      .map(item => {
        return item?.result?.[0]
      })
  }, [callAddressesRes])

  const putAddresses = useMemo(() => {
    return putAddressesRes
      .filter(item => {
        return item.result
      })
      .map(item => {
        return item?.result?.[0]
      })
  }, [putAddressesRes])

  const allCalls = useMultipleContractSingleData(
    callAddresses,
    CALL_OR_PUT_INTERFACE,
    'attributes',
    undefined,
    NEVER_RELOAD
  )
  //const allPuts = useMultipleContractSingleData(putAddresses, CALL_OR_PUT_INTERFACE, 'attributes')

  const callTotalsRes = useMultipleContractSingleData(
    callAddresses,
    CALL_OR_PUT_INTERFACE,
    'totalSupply',
    undefined,
    NEVER_RELOAD
  )

  const putTotalsRes = useMultipleContractSingleData(
    putAddresses,
    CALL_OR_PUT_INTERFACE,
    'totalSupply',
    undefined,
    NEVER_RELOAD
  )

  const callBalancesRes = useMultipleContractSingleData(callAddresses, CALL_OR_PUT_INTERFACE, 'balanceOf', [
    account ?? undefined
  ])

  const putBalancesRes = useMultipleContractSingleData(putAddresses, CALL_OR_PUT_INTERFACE, 'balanceOf', [
    account ?? undefined
  ])

  const underlyingAddresses = useMemo(() => {
    return allCalls
      .filter(item => {
        return item.result
      })
      .map(item => {
        return item?.result?.[0]
      })
  }, [allCalls])

  const currencyAddresses = useMemo(() => {
    return allCalls
      .filter(item => {
        return item.result
      })
      .map(item => {
        return item?.result?.[1]
      })
  }, [allCalls])
  const underlyingSymbolRes = useMultipleContractSingleData(
    underlyingAddresses,
    ERC20_INTERFACE,
    'symbol',
    undefined,
    NEVER_RELOAD
  )
  const underlyingDecimalsRes = useMultipleContractSingleData(
    underlyingAddresses,
    ERC20_INTERFACE,
    'decimals',
    undefined,
    NEVER_RELOAD
  )
  const currencySymbolRes = useMultipleContractSingleData(
    currencyAddresses,
    ERC20_INTERFACE,
    'symbol',
    undefined,
    NEVER_RELOAD
  )
  const currencyDecimalsRes = useMultipleContractSingleData(
    currencyAddresses,
    ERC20_INTERFACE,
    'decimals',
    undefined,
    NEVER_RELOAD
  )

  const list = useMemo(() => {
    return allCalls
      .filter(item => {
        return item?.result
      })
      .map((item, index) => {
        const optionTypeData: OptionTypeData = {
          id: index.toString(),
          callAddress: callAddresses[index],
          putAddress: putAddresses[index],
          callBalance: callBalancesRes[index]?.result?.[0],
          putBalance: putBalancesRes[index]?.result?.[0],
          callTotal: callTotalsRes[index]?.result?.[0],
          putTotal: putTotalsRes[index]?.result?.[0],
          underlying: item.result?.[0],
          currency: item.result?.[1],
          priceFloor: item.result?.[2],
          priceCap: item.result?.[3],
          underlyingSymbol:
            underlyingSymbolRes[index].result?.[0] === 'WETH' ? 'ETH' : underlyingSymbolRes[index].result?.[0],
          underlyingDecimals:
            underlyingDecimalsRes[index].result?.[0] === 'WETH' ? 'ETH' : underlyingDecimalsRes[index].result?.[0],
          currencySymbol: currencySymbolRes[index].result?.[0],
          currencyDecimals: currencyDecimalsRes[index].result?.[0]
        }
        return optionTypeData
      })
  }, [
    allCalls,
    callAddresses,
    callBalancesRes,
    callTotalsRes,
    currencyDecimalsRes,
    currencySymbolRes,
    putAddresses,
    putBalancesRes,
    putTotalsRes,
    underlyingDecimalsRes,
    underlyingSymbolRes
  ])
  return list
}

export function useOption(id: string | undefined): Option | undefined {
  const { account } = useActiveWeb3React()
  const factoryContract = useAntimatterContract()

  const callAddressRes = useSingleCallResult(factoryContract, 'allCalls', id ? [id] : undefined)
  const putAddressRes = useSingleCallResult(factoryContract, 'allPuts', id ? [id] : undefined)

  const attributesContract = useAttributesContract(callAddressRes?.result?.[0])

  const attributesRes = useSingleCallResult(attributesContract, 'attributes', undefined)

  const balancesRes = useMultipleContractSingleData(
    [callAddressRes?.result?.[0], putAddressRes?.result?.[0]],
    CALL_OR_PUT_INTERFACE,
    'balanceOf',
    [account ?? undefined]
  )

  const underlyingAddress = useMemo(() => {
    return attributesRes?.result?.[0]
  }, [attributesRes])

  const currencyAddress = useMemo(() => {
    return attributesRes?.result?.[1]
  }, [attributesRes])
  const call = useToken(callAddressRes?.result?.[0])
  const put = useToken(putAddressRes?.result?.[0])

  const underlying = useToken(underlyingAddress)
  const currency = useToken(currencyAddress)

  return useMemo(() => {
    if (!call || !put || !underlying || !currency || !attributesRes?.result?.[2] || !attributesRes?.result?.[3])
      return undefined
    const callTokenAmount = new TokenAmount(call, balancesRes?.[0]?.result?.[0] ?? '0')
    const putTokenAmount = new TokenAmount(put, balancesRes?.[1]?.result?.[0] ?? '0')
    return {
      priceFloor: attributesRes?.result?.[2].toString(),
      priceCap: attributesRes?.result?.[3].toString(),
      call: callTokenAmount,
      put: putTokenAmount,
      underlying,
      currency
    }
  }, [attributesRes?.result, balancesRes, call, currency, put, underlying])
}

export const absolute = (val: string) => {
  if (val && val[0] === '-') {
    return val.slice(1)
  }
  return val
}
export const parseAbsolute = (val: string, token: Token) => {
  if (val === '0') {
    return '0'
  }
  const value = tryParseAmount(absolute(val), token)?.raw.toString()
  if (value && val[0] === '-') {
    return '-' + value
  }
  return value
}

export function useDerivedStrategyInfo(
  option: Option | undefined,
  callAmount: string | undefined,
  putAmount: string | undefined
): {
  delta?: DeltaData
} {
  const antimatterContract = useAntimatterContract()
  const [userSlippageTolerance] = useUserSlippageTolerance() // custom from users
  const totalCall = useTotalSupply(option?.call?.token)
  const totalPut = useTotalSupply(option?.put?.token)

  const queryData = useMemo(() => {
    if (
      !option ||
      !option.call?.token ||
      !option.put?.token ||
      !totalCall ||
      !totalPut ||
      !option.priceFloor ||
      !option.priceCap ||
      !callAmount ||
      !putAmount
    )
      return undefined
    const callVal = parseAbsolute(callAmount, option.call?.token)
    const putVal = parseAbsolute(putAmount, option.put?.token)

    return [
      option.priceFloor,
      option.priceCap,
      totalCall?.raw.toString(),
      totalPut?.raw.toString(),
      callVal,
      putVal,
      JSBI.multiply(
        JSBI.BigInt(userSlippageTolerance ?? 50),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(15))
      ).toString()
    ]
  }, [option, callAmount, putAmount, userSlippageTolerance, totalCall, totalPut])

  const delta = useSingleCallResult(antimatterContract, 'calcDeltaWithFeeAndSlippage', queryData ?? [undefined])

  const deltaResult = delta?.result?.undMax
    ? {
        dUnd: delta.result?.undMax,
        dCur: delta.result?.curMax,
        totalUnd: delta.result?.totalUnd,
        totalCur: delta.result?.totalCur
      }
    : undefined

  return {
    delta: deltaResult
  }
}

export function useSwapInfo(
  option: Option | undefined,
  callAmount: string | undefined,
  putAmount: string | undefined,
  undCurrency?: Currency | undefined | null,
  curCurrency?: Currency | undefined | null,
  payCurrency?: Currency | undefined | null
): RouteDelta | undefined {
  const { chainId } = useActiveWeb3React()
  const { delta } = useDerivedStrategyInfo(option, callAmount, putAmount)
  const dUnd = delta?.dUnd.toString()
  const dCur = delta?.dCur.toString()
  const { undTrade, curTrade } = useOptionSwapInfo(dUnd, dCur, undCurrency, curCurrency, payCurrency)
  const underlying = option?.underlying
  const currency = option?.currency

  const undTradeAddresses: string[] | undefined = useMemo(() => {
    if (dUnd?.toString() === '0') {
      return underlying?.address ? [underlying.address] : undefined
    }
    if (payCurrency?.symbol?.toUpperCase() === 'ETH' && underlying?.symbol?.toUpperCase() === 'WETH') {
      return [WETH[chainId ?? 3].address]
    }
    if (underlying?.symbol === payCurrency?.symbol) {
      return underlying?.address ? [underlying.address] : undefined
    }
    if (undTrade) {
      return dUnd?.toString()[0] === '-'
        ? undTrade.route.path.map(({ address }) => address)
        : undTrade.route.path.reverse().map(({ address }) => address)
    }
    return undefined
  }, [chainId, dUnd, payCurrency, undTrade, underlying])

  const curTradeAddresses: string[] | undefined = useMemo(() => {
    if (dCur?.toString() === '0') {
      return currency?.address ? [currency.address] : undefined
    }
    if (payCurrency?.symbol?.toUpperCase() === 'ETH' && currency?.symbol?.toUpperCase() === 'WETH') {
      return [WETH[chainId ?? 3].address]
    }
    if (currency?.symbol === payCurrency?.symbol) {
      return currency?.address ? [currency?.address] : undefined
    }
    if (curTrade) {
      return dCur?.toString()[0] === '-'
        ? curTrade.route.path.map(({ address }) => address)
        : curTrade.route.path.reverse().map(({ address }) => address)
    }
    return
  }, [payCurrency, currency, curTrade, chainId, dCur])

  return useRouteDelta(
    option,
    undTradeAddresses,
    curTradeAddresses,
    callAmount ?? '0',
    option?.call?.token,
    putAmount ?? '0',
    option?.put?.token
  )
}

export function usePayCurrencyAmount(
  routeDelta: RouteDelta | undefined,
  payCurrency: Currency | undefined
): CurrencyAmount | undefined {
  const payFormattedAmount = useMemo(() => {
    if (!routeDelta?.undMax || !routeDelta.curMax) return undefined
    return JSBI.add(JSBI.BigInt(routeDelta.undMax), JSBI.BigInt(routeDelta.curMax)).toString()
  }, [routeDelta])

  return tryFormatAmount(absolute(payFormattedAmount ?? ''), payCurrency)
}
