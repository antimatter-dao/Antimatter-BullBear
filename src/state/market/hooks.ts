import { useAntimatterContract } from '../../hooks/useContract'
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
import { useUserGenerationSlippageTolerance, useUserRedeemSlippageTolerance } from '../user/hooks'
import { ETHER, JSBI } from '@uniswap/sdk'
import { tryParseAmount } from '../swap/hooks'
import { TOKEN_TYPES } from 'components/MarketStrategy/TypeRadioButton'
import { useETHBalances } from '../wallet/hooks'
import { MATTER_OPTION } from '../../constants'
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
  callBalance: string
  putBalance: string
  underlyingBalance: number | undefined
  currencyBalance: number | undefined
}
interface Balances {
  callBalance: string
  putBalance: string
}

interface Value {
  priceUnderlying: string
  valueReserve: string
}

export function useOptionTypeCount(): number | undefined {
  const antimatterContract = useAntimatterContract()
  const res = useSingleCallResult(antimatterContract, 'length')
  if (res.result && !res.loading) {
    return parseInt(res.result[0])
  }
  return undefined
}

export function useValues(): Value[] | undefined {
  const antimatterContract = useAntimatterContract()
  //const optionTypeCount = useOptionTypeCount()
  const optionTypeIndexes = []
  for (let i = 1; i < 2; i++) {
    optionTypeIndexes.push([i])
  }
  const callAddressesRes = useSingleContractMultipleData(antimatterContract, 'allCalls', optionTypeIndexes)
  //const putAddressesRes = useSingleContractMultipleData(antimatterContract, 'allPuts', optionTypeIndexes)
  const callAddresses = useMemo(() => {
    return callAddressesRes
      .filter(item => {
        return item.result
      })
      .map(item => {
        return [item?.result?.[0]]
      })
  }, [callAddressesRes])

  const valuesRes = useSingleContractMultipleData(antimatterContract, 'priceValue1', callAddresses)

  return valuesRes
    .filter(item => {
      return item.result
    })
    .map(item => {
      return {
        priceUnderlying: item?.result?.priceUnderlying,
        valueReserve: item?.result?.valueReserve
      }
    })
}

export function useAllOptionTypes() {
  const { account } = useActiveWeb3React()
  const antimatterContract = useAntimatterContract()
  //const optionTypeCount = useOptionTypeCount()
  const optionTypeIndexes = useMemo(() => {
    const indexes = []
    for (let i = 1; i < 2; i++) {
      indexes.push([i])
    }
    return indexes
  }, [])

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

export function useMatterOption() {
  const { chainId, account } = useActiveWeb3React()
  const matterOption = chainId ? MATTER_OPTION[chainId] : undefined

  const balanceRes = useMultipleContractSingleData(
    [matterOption?.callAddress, matterOption?.putAddress],
    CALL_OR_PUT_INTERFACE,
    'balanceOf',
    [account ?? undefined]
  )

  const totalsRes = useMultipleContractSingleData(
    [matterOption?.callAddress, matterOption?.putAddress],
    CALL_OR_PUT_INTERFACE,
    'totalSupply',
    undefined,
    NEVER_RELOAD
  )

  const optionTypeData: OptionTypeData = {
    id: '',
    callAddress: matterOption?.callAddress ?? '',
    putAddress: matterOption?.putAddress ?? '',
    callBalance: balanceRes[0]?.result?.[0],
    putBalance: balanceRes[1]?.result?.[0],
    callTotal: totalsRes[0]?.result?.[0],
    putTotal: totalsRes[1]?.result?.[0],
    underlying: matterOption?.underlying ?? '',
    currency: matterOption?.currency ?? '',
    priceFloor: matterOption?.priceFloor ?? '',
    priceCap: matterOption?.priceCap ?? '',
    underlyingSymbol: matterOption?.underlyingSymbol,
    underlyingDecimals: matterOption?.underlyingDecimals ?? '',
    currencySymbol: matterOption?.currencySymbol,
    currencyDecimals: matterOption?.currencyDecimals ?? ''
  }

  return optionTypeData
}

export const absolute = (val: string) => {
  if (val && val[0] === '-') {
    return val.slice(1)
  }
  return val
}
const parseAbsolute = (val: string) => {
  if (val === '0') {
    return '0'
  }
  const value = tryParseAmount(absolute(val), ETHER)?.raw.toString()
  if (value && val[0] === '-') {
    return '-' + value
  }
  return value
}

export function useDerivedStrategyInfo(
  isGeneration: boolean,
  optionType: OptionTypeData | undefined,
  callTyped: string | undefined,
  putTyped: string | undefined,
  tokenType: string
): {
  delta?: DeltaData
  error?: string
  balances?: Balances
} {
  const { account } = useActiveWeb3React()
  const antimatterContract = useAntimatterContract()
  const [userGenerationSlippageTolerance] = useUserGenerationSlippageTolerance() // custom from users
  const [userRedeemSlippageTolerance] = useUserRedeemSlippageTolerance() // custom from users

  const queryData = useMemo(() => {
    let callAmount = callTyped
    let putAmount = putTyped

    if (tokenType === TOKEN_TYPES.call) {
      putAmount = '0'
    }
    if (tokenType === TOKEN_TYPES.put) {
      callAmount = '0'
    }

    if (
      !optionType ||
      !optionType.priceFloor ||
      !optionType.priceCap ||
      !optionType.callTotal ||
      !optionType.putTotal ||
      !callAmount ||
      !putAmount
    )
      return undefined

    const callVal = parseAbsolute(callAmount)
    const putVal = parseAbsolute(putAmount)

    return [
      optionType?.priceFloor.toString(),
      optionType?.priceCap.toString(),
      optionType?.callTotal.toString(),
      optionType?.putTotal.toString(),
      callVal,
      putVal,
      JSBI.multiply(
        JSBI.BigInt(isGeneration ? userGenerationSlippageTolerance ?? 50 : userRedeemSlippageTolerance ?? 50),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(15))
      ).toString()
    ]
  }, [
    optionType,
    callTyped,
    putTyped,
    isGeneration,
    tokenType,
    userGenerationSlippageTolerance,
    userRedeemSlippageTolerance
  ])
  const ETHBalance = useETHBalances(account ? [account] : [])
  const delta = useSingleCallResult(antimatterContract, 'calcDeltaWithFeeAndSlippage', queryData ?? [undefined])
  const balancesRes = useMultipleContractSingleData(
    [optionType?.callAddress, optionType?.putAddress, optionType?.underlying, optionType?.currency],
    ERC20_INTERFACE,
    'balanceOf',
    [account ?? undefined]
  )

  const deltaResult = delta?.result?.undMax
    ? {
        dUnd: delta.result?.undMax,
        dCur: delta.result?.curMax,
        totalUnd: delta.result?.totalUnd,
        totalCur: delta.result?.totalCur,
        callBalance: balancesRes?.[0]?.result?.[0],
        putBalance: balancesRes?.[1]?.result?.[0],
        underlyingBalance: balancesRes?.[2]?.result?.[0],
        currencyBalance: balancesRes?.[3]?.result?.[0]
      }
    : undefined
  const balances = balancesRes
    ? {
        callBalance: balancesRes?.[0]?.result?.[0],
        putBalance: balancesRes?.[1]?.result?.[0]
      }
    : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  } else if (!optionType) {
    error = 'Select a OptionCard Type'
  } else if (!callTyped && tokenType !== TOKEN_TYPES.put) {
    error = 'Enter call amount'
  } else if (!putTyped && tokenType !== TOKEN_TYPES.call) {
    error = 'Enter put amount'
  }

  const underlyingBalance =
    optionType?.underlyingSymbol === 'ETH' && account
      ? ETHBalance?.[account]?.raw.toString()
      : deltaResult?.underlyingBalance
  const currencyBalance =
    optionType?.currencySymbol === 'ETH' && account
      ? ETHBalance?.[account]?.raw.toString()
      : deltaResult?.currencyBalance
  if (
    deltaResult?.underlyingBalance &&
    deltaResult?.dUnd &&
    JSBI.greaterThan(JSBI.BigInt(deltaResult.dUnd), JSBI.BigInt(underlyingBalance))
  ) {
    error = `Insufficient ${optionType?.underlyingSymbol} Balance`
  }

  if (
    deltaResult?.currencyBalance &&
    deltaResult?.dCur &&
    JSBI.greaterThan(JSBI.BigInt(deltaResult.dCur), JSBI.BigInt(currencyBalance))
  ) {
    error = `Insufficient ${optionType?.currencySymbol} Balance`
  }

  return {
    delta: deltaResult,
    balances,
    error
  }
}
