import JSBI from 'jsbi'
import { useEffect, useMemo, useState } from 'react'
import { useHistory } from 'react-router'
import { useAllOptionTypes } from 'state/market/hooks'
import { formatMyCreation, formatMyPositionRow } from 'utils/option/formatTableData'
import { parsePrice } from 'utils/option/utils'
import { useActiveWeb3React } from '.'
import { Axios } from '../utils/option/axios'

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
}

export function useMyTransaction(): {
  loading: boolean
  page: {
    totalPages: number
    currentPage: number
    setCurrentPage: (page: number) => void
  }
  data: MyTransactionProp[]
} {
  const { chainId, account } = useActiveWeb3React()
  const [data, setData] = useState<MyTransactionProp[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      if (!chainId || !account) {
        setData([])
        return
      }
      try {
        setLoading(true)
        const res = await Axios.get('getMyposition', { chainId, creator: account, pageNum: currentPage })
        setLoading(false)
        if (res.data.code !== 200) {
          setData([])
          return
        }
        console.debug(res.data.data.records)
        setData(
          res.data.data.records.map((item: any) => {
            item.type = item.type === '1' ? MyPositionType.Call : MyPositionType.Put
            return item
          })
        )
        setTotalPages(Number(res.data.data.pages))
      } catch (error) {
        setLoading(false)
        console.error('request error getMyposition', error)
        setData([])
        return
      }
    })()
  }, [chainId, account, currentPage])
  const res = useMemo(() => ({ page: { totalPages, currentPage, setCurrentPage }, loading, data }), [
    currentPage,
    data,
    loading,
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
                amount: parsePrice(item.callBalance, '18'),
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
                amount: parsePrice(item.putBalance, '18'),
                address: item.putAddress,
                id: item.id
              },
              history.push
            )
          )
        }
        return acc
      }, [] as any[][])
      return call
    } catch (e) {
      return [] as any[][]
    }
  }, [all, history.push])

  return resData
}
