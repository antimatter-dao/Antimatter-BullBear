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
import { useUserSlippageTolerance } from '../user/hooks'
import { ETHER, JSBI } from '@uniswap/sdk'
import { tryParseAmount } from '../swap/hooks'
import { TOKEN_TYPES } from 'components/MarketStrategy/TokenTypeRadioButton'
const CALL_OR_PUT_INTERFACE = new Interface(CALL_OR_PUT_ABI)

export interface OptionTypeData {
  id: string
  callAddress: string
  putAddress: string
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

export function useOptionTypeCount(): number | undefined {
  const antimatterContract = useAntimatterContract()
  const res = useSingleCallResult(antimatterContract, 'length')
  if (res.result && !res.loading) {
    return parseInt(res.result[0])
  }
  return undefined
}

export function useAllOptionTypes() {
  const antimatterContract = useAntimatterContract()
  const optionTypeCount = useOptionTypeCount()
  const optionTypeIndexes = []
  for (let i = 0; i < (optionTypeCount ?? 0); i++) {
    optionTypeIndexes.push([i])
  }

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
    underlyingAddresses,
    ERC20_INTERFACE,
    'decimals',
    undefined,
    NEVER_RELOAD
  )

  return allCalls
    .filter(item => {
      return item?.result
    })
    .map((item, index) => {
      const optionTypeData: OptionTypeData = {
        id: index.toString(),
        callAddress: callAddresses[index],
        putAddress: putAddresses[index],
        callTotal: callTotalsRes[index].result?.[0],
        putTotal: putTotalsRes[index].result?.[0],
        underlying: item.result?.[0],
        currency: item.result?.[1],
        priceFloor: item.result?.[2],
        priceCap: item.result?.[3],
        underlyingSymbol: underlyingSymbolRes[index].result?.[0],
        underlyingDecimals: underlyingDecimalsRes[index].result?.[0],
        currencySymbol: currencySymbolRes[index].result?.[0],
        currencyDecimals: currencyDecimalsRes[index].result?.[0]
      }
      return optionTypeData
    })
}

export const absolute = (val: string) => {
  if (val && val[0] === '-') {
    return val.slice(1)
  }
  return val
}

export function useDerivedStrategyInfo(
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
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users

  const queryData = useMemo(() => {
    console.log(callTyped, putTyped, tokenType)
    if (
      !optionType ||
      !optionType.priceFloor ||
      !optionType.priceCap ||
      !optionType.callTotal ||
      !optionType.putTotal ||
      !callTyped ||
      !putTyped
    )
      return undefined
    console.log('yayyyyyy')
    let callVal = tryParseAmount(absolute(callTyped), ETHER)?.raw.toString()
    let putVal = tryParseAmount(absolute(putTyped), ETHER)?.raw.toString()

    if (callVal && callTyped[0] === '-') {
      const temp = callVal
      callVal = '-' + temp
    }
    if (putVal && putTyped[0] === '-') {
      const temp = putVal
      putVal = '-' + temp
    }
    return [
      optionType?.priceFloor.toString(),
      optionType?.priceCap.toString(),
      optionType?.callTotal.toString(),
      optionType?.putTotal.toString(),
      callVal,
      putVal,
      JSBI.multiply(JSBI.BigInt(allowedSlippage ?? 50), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16))).toString()
    ]
  }, [optionType, callTyped, putTyped, allowedSlippage, tokenType])

  console.log('query Data', queryData)
  const delta = useSingleCallResult(antimatterContract, 'calcDeltaWithFeeAndSlippage', queryData ?? [undefined])
  const balancesRes = useMultipleContractSingleData(
    [optionType?.callAddress, optionType?.putAddress, optionType?.underlying, optionType?.currency],
    ERC20_INTERFACE,
    'balanceOf',
    [account ?? undefined]
  )
  const deltaResult = delta?.result?.dUnd
    ? {
        dUnd: delta.result?.dUnd,
        dCur: delta.result?.dCur,
        totalUnd: delta.result?.totalUnd,
        totalCur: delta.result?.totalCur,
        callBalance: balancesRes?.[0].result?.[0],
        putBalance: balancesRes?.[1].result?.[0],
        underlyingBalance: balancesRes?.[2].result?.[0],
        currencyBalance: balancesRes?.[3].result?.[0]
      }
    : undefined
  const balances = balancesRes
    ? {
        callBalance: balancesRes?.[0].result?.[0],
        putBalance: balancesRes?.[1].result?.[0]
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

  if (
    deltaResult?.underlyingBalance &&
    deltaResult?.dUnd &&
    JSBI.greaterThan(JSBI.BigInt(deltaResult.dUnd), JSBI.BigInt(deltaResult.underlyingBalance))
  ) {
    error = `Insufficient ${optionType?.underlyingSymbol} Balance`
  }

  if (
    deltaResult?.currencyBalance &&
    deltaResult?.dCur &&
    JSBI.greaterThan(JSBI.BigInt(deltaResult.dCur), JSBI.BigInt(deltaResult.currencyBalance))
  ) {
    error = `insufficient ${optionType?.currencySymbol} Balance`
  }

  return {
    delta: deltaResult,
    balances,
    error
  }
}
