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
import { Currency, CurrencyAmount, Pair } from '@uniswap/sdk'
import { Field } from '../mint/actions'
import { PairState, usePair } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { useMintState } from '../mint/hooks'
const CALL_OR_PUT_INTERFACE = new Interface(CALL_OR_PUT_ABI)

export interface OptionTypeData {
  id: string
  underlying: string
  currency: string
  priceFloor: string
  priceCap: string
  underlyingSymbol?: string
  currencySymbol?: string
  underlyingDecimals: string
  currencyDecimals: string
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
  //const putAddressesRes = useSingleContractMultipleData(antimatterContract, 'allPuts', optionTypeIndexes)
  const callAddresses = useMemo(() => {
    return callAddressesRes
      .filter(item => {
        return item.result
      })
      .map(item => {
        return item?.result?.[0]
      })
  }, [callAddressesRes])

  // const putAddresses = useMemo(() => {
  //   return putAddressesRes
  //     .filter(item => {
  //       return item.result
  //     })
  //     .map(item => {
  //       return item?.result?.[0]
  //     })
  // }, [putAddressesRes])

  const allCalls = useMultipleContractSingleData(
    callAddresses,
    CALL_OR_PUT_INTERFACE,
    'attributes',
    undefined,
    NEVER_RELOAD
  )
  //const allPuts = useMultipleContractSingleData(putAddresses, CALL_OR_PUT_INTERFACE, 'attributes')

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
  currencyA: Currency | undefined,
  currencyB: Currency | undefined
): {
  dependentField: Field
  currencies: { [field in Field]?: Currency }
  pair?: Pair | null
  pairState: PairState
  currencyBalances: { [field in Field]?: CurrencyAmount }
  error?: string
} {
  const { account } = useActiveWeb3React()

  const { independentField } = useMintState()

  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  // tokens
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA ?? undefined,
      [Field.CURRENCY_B]: currencyB ?? undefined
    }),
    [currencyA, currencyB]
  )

  // pair
  const [pairState, pair] = usePair(currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B])

  // balances
  const balances = useCurrencyBalances(account ?? undefined, [
    currencies[Field.CURRENCY_A],
    currencies[Field.CURRENCY_B]
  ])
  const currencyBalances: { [field in Field]?: CurrencyAmount } = {
    [Field.CURRENCY_A]: balances[0],
    [Field.CURRENCY_B]: balances[1]
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }

  if (pairState === PairState.INVALID) {
    error = error ?? 'Invalid pair'
  }

  return {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    error
  }
}
