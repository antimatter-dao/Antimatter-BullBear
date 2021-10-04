import { useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from '.'
import { Axios } from '../utils/option/axios'

export function useMyCreation() {
  const { chainId, account } = useActiveWeb3React()
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
        setData(res.data.data)
      } catch (error) {
        setData([])
        console.error('request error getMyCreation', error)
      }
    })()
  }, [account, chainId])

  return data
}

export enum MyPositionType {
  Call = 'Call',
  Put = 'Put'
}
export interface MyPositionProp {
  id: string
  type: MyPositionType
  tradesAmount: string
  hash: string
  contract: string
  creater: string
  chainId: string
  optionIndex: string
}

export function useMyPosition(): {
  loading: boolean
  page: {
    totalPages: number
    currentPage: number
    setCurrentPage: (page: number) => void
  }
  data: MyPositionProp[]
} {
  const { chainId, account } = useActiveWeb3React()
  const [data, setData] = useState<MyPositionProp[]>([])
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

// export function useMyCreation(): {
//   loading: boolean
//   page: {
//     totalPages: number
//     currentPage: number
//     setCurrentPage: (page: number) => void
//   }
//   data: MyPositionProp[]
// } {
//   const { chainId, account } = useActiveWeb3React()
//   const [data, setData] = useState<MyPositionProp[]>([])
//   const [loading, setLoading] = useState(false)
//   const [currentPage, setCurrentPage] = useState<number>(1)
//   const [totalPages, setTotalPages] = useState<number>(0)

//   useEffect(() => {
//     ;(async () => {
//       if (!chainId || !account) {
//         setData([])
//         return
//       }
//       try {
//         setLoading(true)
//         const res = await Axios.get('getMyCreation', { chainId, creator: account, pageNum: currentPage })
//         setLoading(false)
//         if (res.data.code !== 200) {
//           setData([])
//           return
//         }
//         setData(
//           res.data.data.records.map((item: any) => {
//             item.type = item.type === '1' ? MyPositionType.Call : MyPositionType.Put
//             return item
//           })
//         )
//         setTotalPages(Number(res.data.data.pages))
//       } catch (error) {
//         setLoading(false)
//         console.error('request error getMyCreation', error)
//         setData([])
//         return
//       }
//     })()
//   }, [chainId, account, currentPage])
//   const res = useMemo(() => ({ page: { totalPages, currentPage, setCurrentPage }, loading, data }), [
//     currentPage,
//     data,
//     loading,
//     totalPages
//   ])
//   return res
// }
