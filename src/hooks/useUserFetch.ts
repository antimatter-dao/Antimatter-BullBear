import JSBI from 'jsbi'
import { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router'
import { useAllOptionTypes } from 'state/market/hooks'
import { formatMyCreation, formatMyPositionRow, formatMyTransactionRow } from 'utils/option/formatTableData'
import { parsePrice } from 'utils/option/utils'
import { useActiveWeb3React } from '.'
import { Axios } from '../utils/option/axios'
import ERC20_INTERFACE from 'constants/abis/erc20'
import { useMultipleContractSingleData } from 'state/multicall/hooks'

export function useMyCreation() {
  const { chainId, account } = useActiveWeb3React()
  const history = useHistory()
  const [data, setData] = useState<any[] | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      if (!chainId) return
      setData(undefined)
      try {
        const res = await Axios.get('getMyCreation', { chainId: chainId, creator: account })
        if (res.data.code !== 200) {
          setData([])
          return
        }
        setData(formatMyCreation(res.data.data, history.push))
      } catch (error) {
        setData([])
        console.error('request error getMyCreation', error)
      }
    })()
  }, [account, chainId, history.push])

  return data
}

export enum MyPositionType {
  Call = 'Bull',
  Put = 'Bear'
}
export interface MyTransactionProp {
  id: string
  type: MyPositionType
  tradesAmount: string
  hash: string
  contract: string
  creater: string
  chainId: string
  optionIndex: string
  price: string
  priceFloor: string
  priceCap: string
}

export function useMyTransaction(): {
  loading: boolean
  page: {
    totalPages: number
    currentPage: number
    setCurrentPage: (page: number) => void
  }
  data: any[]
} {
  const { chainId, account } = useActiveWeb3React()
  const [tokenAddresses, setTokenAddresses] = useState<string[]>([])
  const [underlyingAddresses, setUnderlyingAddresses] = useState<string[]>([])
  const [currencyAddresses, setCurrencyAddresses] = useState<string[]>([])
  const [data, setData] = useState<MyTransactionProp[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const history = useHistory()

  const tokenDecimalsRes = useMultipleContractSingleData(tokenAddresses, ERC20_INTERFACE, 'decimals')

  const currencyDecimalsRes = useMultipleContractSingleData(currencyAddresses, ERC20_INTERFACE, 'decimals')

  const underlyingSymbolRes = useMultipleContractSingleData(underlyingAddresses, ERC20_INTERFACE, 'symbol')

  // 'OPTION', 'TYPE', 'AMOUNT', 'PRICE', 'ACTION', ''
  const result = useMemo(() => {
    if (!underlyingSymbolRes || !currencyDecimalsRes || !tokenDecimalsRes) {
      return []
    }
    if (underlyingSymbolRes[0]?.loading || currencyDecimalsRes[0]?.loading || tokenDecimalsRes[0]?.loading) {
      return []
    }

    try {
      const list = data.map((item, idx) => {
        const currencyDecimal = currencyDecimalsRes?.[idx]?.result?.[0]
        const underlyingSymbol = underlyingSymbolRes?.[idx]?.result?.[0]
        const tokenDecimal = tokenDecimalsRes?.[idx]?.result?.[0]
        if (!underlyingSymbol || !currencyDecimal || !tokenDecimal) throw Error
        return formatMyTransactionRow(item, currencyDecimal, underlyingSymbol, tokenDecimal, history.push)
      })
      setLoading(false)
      return list
    } catch (e) {}
    return []
  }, [underlyingSymbolRes, currencyDecimalsRes, tokenDecimalsRes, data, history.push])

  useEffect(() => {
    ;(async () => {
      if (!chainId || !account) {
        setData([])
        return
      }
      try {
        setLoading(true)
        const res = await Axios.get('getMyposition', { chainId, creator: account, pageNum: currentPage })
        if (res.data.code !== 200) {
          setData([])
          return
        }
        const tokenAddressList: string[] = []
        const underlyingAddressList: string[] = []
        const currencyAddressList: string[] = []
        setData(
          res.data.data.records.map((item: any) => {
            item.type = item.type === '1' ? MyPositionType.Call : MyPositionType.Put
            tokenAddressList.push(item.contract)
            underlyingAddressList.push(item.underlying)
            currencyAddressList.push(item.currency)
            return item
          })
        )
        setTokenAddresses(tokenAddressList)
        setUnderlyingAddresses(underlyingAddressList)
        setCurrencyAddresses(currencyAddressList)
        setTotalPages(Number(res.data.data.pages))
      } catch (error) {
        setLoading(false)
        console.error('request error getMyposition', error)
        setData([])
        return
      }
    })()
  }, [chainId, account, currentPage])
  const res = useMemo(() => ({ page: { totalPages, currentPage, setCurrentPage }, loading, data: result }), [
    currentPage,
    loading,
    result,
    totalPages
  ])
  return res
}

export function useMyPosition() {
  const all = useAllOptionTypes()
  const history = useHistory()

  const resData = useMemo(() => {
    try {
      const call = all.reduce((acc, item) => {
        if (!JSBI.equal(JSBI.BigInt(item.callBalance), JSBI.BigInt(0))) {
          const decimal = item.currencyDecimals.toString()
          const option = `+${item.underlyingSymbol}($${parsePrice(item.priceFloor, decimal)}~${parsePrice(
            item.priceCap,
            decimal
          )})`
          acc.push(
            formatMyPositionRow(
              {
                option,
                type: MyPositionType.Call,
                amount: parsePrice(item.callBalance, item.callDecimals ?? '18'),
                address: item.callAddress,
                id: item.id
              },
              history.push
            )
          )
        }
        if (!JSBI.equal(JSBI.BigInt(item.putBalance), JSBI.BigInt(0))) {
          const decimal = item.currencyDecimals.toString()
          const option = `+${item.underlyingSymbol}($${parsePrice(item.priceFloor, decimal)}~${parsePrice(
            item.priceCap,
            decimal
          )})`
          acc.push(
            formatMyPositionRow(
              {
                option,
                type: MyPositionType.Put,
                amount: parsePrice(item.putBalance, item.putDecimals ?? '18'),
                address: item.putAddress,
                id: item.id
              },
              history.push
            )
          )
        }
        return acc
      }, [] as any[][])
      return { data: call, loading: !(all && all.length > 0) }
    } catch (e) {
      return { data: [] as any[][], loading: true }
    }
  }, [all, history.push])

  return resData
}
