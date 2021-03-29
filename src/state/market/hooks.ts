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
  console.log('allCalls', allCalls)
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
      console.log('optionTypeData', optionTypeData)
      return optionTypeData
    })
}

export function useDerivedStrategyInfo(
  optionType: OptionTypeData | undefined,
  callTyped: string | undefined,
  putTyped: string | undefined
): {
  delta?: DeltaData
  error?: string
} {
  const { account } = useActiveWeb3React()
  const antimatterContract = useAntimatterContract()
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users

  const queryData = useMemo(() => {
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
    return [
      optionType?.priceFloor.toString(),
      optionType?.priceCap.toString(),
      optionType?.callTotal.toString(),
      optionType?.putTotal.toString(),
      tryParseAmount(callTyped, ETHER)?.raw.toString(),
      tryParseAmount(putTyped, ETHER)?.raw.toString(),
      JSBI.multiply(JSBI.BigInt(allowedSlippage ?? 50), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16))).toString()
    ]
  }, [optionType, callTyped, putTyped])
  console.log('queryData--->', queryData)
  const delta = useSingleCallResult(antimatterContract, 'calcDeltaWithFeeAndSlippage', queryData ?? [undefined])

  const deltaResult = delta?.result?.dUnd
    ? {
        dUnd: delta.result?.dUnd,
        dCur: delta.result?.dCur,
        totalUnd: delta.result?.totalUnd,
        totalCur: delta.result?.totalCur
      }
    : undefined
  console.log('queryResult--->', deltaResult)

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }

  if (!optionType) {
    error = 'Select a Option Type'
  }

  if (!callTyped) {
    error = 'Enter call amount'
  }

  if (!callTyped) {
    error = 'Enter put amount'
  }

  return {
    delta: deltaResult,
    error
  }
}
