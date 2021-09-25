import { SearchQuery } from 'components/Search'
import { useEffect, useState } from 'react'
import { Axios } from '../utils/option/axios'
import { useActiveWeb3React } from './index'
import { useBlockNumber } from 'state/application/hooks'
import { useNetwork } from './useNetwork'

export function useOptionList(
  searchParams: SearchQuery
): {
  page: {
    totalPages: number
    currentPage: number
    setCurrentPage: (page: number) => void
  }
  data: string[]
} {
  const [totalPages, setTotalPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const { chainId } = useActiveWeb3React()
  const [ids, setIds] = useState([])
  const blockNumber = useBlockNumber()
  const {
    httpHandlingFunctions: { errorFunction }
  } = useNetwork()

  useEffect(() => {
    ;(async () => {
      if (!chainId) {
        return
      }
      const r: any = await Axios.post(
        'getCreateOptionList',
        {},
        { chainId, pageNum: currentPage, ...searchParams }
      ).catch(e => {
        console.error(e)
        errorFunction()
        throw new Error(e)
      })
      setTotalPages(r.data.data.pages)
      setIds(r.data.data.list.map(({ id }: { id: string }) => id))
    })()
  }, [chainId, currentPage, searchParams, blockNumber, errorFunction])

  return {
    data: ids,
    page: {
      totalPages,
      currentPage,
      setCurrentPage
    }
  }
}
