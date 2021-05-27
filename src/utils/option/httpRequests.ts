import { ChainId, Token } from '@uniswap/sdk'
import { UTCTimestamp } from 'lightweight-charts'
import { OptionInterface } from 'pages/OptionTrade'
import { OptionTypeData } from 'state/market/hooks'
import { formatCallOption, formatPutOption, formatAndSplitOption, formatOptionType, formatDexTradeData } from './utils'

export interface Underlying {
  underlying: string
  underlyingDecimals: string
  underlyingSymbol: string
}

export interface SearchQuery {
  id?: number | string
  priceCap?: number | string
  priceFloor?: number | string
  underlying?: string
}

export interface DexTradeData {
  time: UTCTimestamp
  high: number
  low: number
  open: number
  close: number
}

export interface HttpHandlingFunctions {
  errorFunction: () => void
  pendingFunction: () => void
  pendingCompleteFunction: () => void
}

const domain = 'https://testapi.antimatter.finance'
const headers = { 'content-type': 'application/json', accept: 'application/json' }

export function getDexTradeList(
  setList: (list: DexTradeData[] | undefined) => void,
  tokenAddress: string,
  errorFunction: () => void
) {
  const request = new Request(`${domain}/app/getDexTradesList?tokenAddress=${tokenAddress}`, {
    method: 'GET',
    headers
  })

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        errorFunction()
        throw new Error('server Error')
      }
    })
    .then(response => {
      if (response.data) {
        setList(formatDexTradeData(response.data))
      }
    })
    .catch(error => {
      errorFunction()
      console.error(error)
    })
}

export function getUnderlyingList(
  setList: (list: Token[] | undefined) => void,
  chainId: ChainId | undefined,
  errorFunction: () => void
) {
  const request = new Request(domain + '/app/getUnderlyingList', {
    method: 'GET',
    headers
  })

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        errorFunction()
        throw new Error('server Error')
      }
    })
    .then(response => {
      if (response.data.underlyingList && chainId) {
        const set = new Set()
        const list = response.data.underlyingList.reduce(
          (acc: Token[], { underlying, underlyingDecimals, underlyingSymbol }: Underlying) => {
            if (set.has(underlying)) return acc
            set.add(underlying)
            acc.push(
              new Token(chainId, underlying, underlyingDecimals ? parseInt(underlyingDecimals) : 18, underlyingSymbol)
            )
            return acc
          },
          []
        )
        response.data && setList(list)
      }
    })
    .catch(error => {
      errorFunction()
      console.error(error)
    })
}

export function getPutOptionList(
  { errorFunction, pendingFunction, pendingCompleteFunction }: HttpHandlingFunctions,
  setList: (list: OptionInterface[]) => void,
  chainId: ChainId | undefined,
  query = ''
) {
  if (!chainId) return
  const request = new Request(`${domain}/app/getPutCreateOptionList?chainId=${chainId}${query ? '&' + query : ''}`, {
    method: 'POST',
    body: '',
    headers
  })
  pendingFunction()
  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        errorFunction()
        pendingCompleteFunction()
        throw new Error('server error')
      }
    })
    .then(response => {
      const list = formatPutOption(response.data)
      setList(list)
      pendingCompleteFunction()
    })
    .catch(error => {
      errorFunction()
      pendingCompleteFunction()
      console.error(error)
    })
}

export function getCallOptionList(
  { errorFunction, pendingFunction, pendingCompleteFunction }: HttpHandlingFunctions,
  setList: (list: OptionInterface[]) => void,
  chainId: ChainId | undefined,
  query = ''
) {
  if (!chainId) return
  const request = new Request(`${domain}/app/getCallCreateOptionList?chainId=${chainId}${query ? '&' + query : ''}`, {
    method: 'POST',
    body: '',
    headers
  })
  pendingFunction()
  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        pendingCompleteFunction()
        errorFunction()
        throw new Error('server error')
      }
    })
    .then(response => {
      console.debug(response)
      const list = formatCallOption(response.data)
      console.debug('getCallOptionList', list)
      setList(list)
      pendingCompleteFunction()
    })
    .catch(error => {
      pendingCompleteFunction()
      errorFunction()
      console.error(error)
    })
}

export function getDexTradesList(
  { pendingFunction, pendingCompleteFunction }: HttpHandlingFunctions,
  setList: (list: OptionInterface[]) => void,
  tokenAddress: ChainId | undefined
) {
  if (!tokenAddress) return
  const request = new Request(`${domain}/app/getDexTradesList?tokenAddress=${tokenAddress}`, {
    method: 'GET',
    body: '',
    headers
  })
  pendingFunction()
  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        pendingCompleteFunction()
        throw new Error('server error')
      }
    })
    .then(response => {
      console.debug(response)
      const list = formatCallOption(response.data)
      console.debug('getCallOptionList', list)
      setList(list)
      pendingCompleteFunction()
    })
    .catch(error => {
      pendingCompleteFunction()
      console.error(error)
    })
}

export function getSingleOtionList(
  { errorFunction, pendingFunction, pendingCompleteFunction }: HttpHandlingFunctions,
  setList: (list: OptionInterface[]) => void,
  chainId: ChainId | undefined,
  query = ''
) {
  if (!chainId) return
  const request = new Request(`${domain}/app/getCreateOptionList?chainId=${chainId}${query ? '&' + query : ''}`, {
    method: 'POST',
    body: '',
    headers
  })
  pendingFunction()

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        pendingCompleteFunction()
        errorFunction()
        throw new Error('server error')
      }
    })
    .then(response => {
      const list = formatAndSplitOption(response.data.list)
      setList(list)
      pendingCompleteFunction()
    })
    .catch(error => {
      pendingCompleteFunction()
      errorFunction()
      console.error(error)
    })
}

export function getOptionTypeList(
  { errorFunction, pendingFunction, pendingCompleteFunction }: HttpHandlingFunctions,
  setList: (list: OptionInterface[]) => void,
  chainId: ChainId | undefined,
  query = ''
) {
  if (!chainId) return
  const request = new Request(`${domain}/app/getCreateOptionList?chainId=${chainId}${query ? '&' + query : ''}`, {
    method: 'POST',
    body: '',
    headers
  })

  pendingFunction()

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        pendingCompleteFunction()
        errorFunction()
        throw new Error('server error')
      }
    })
    .then(response => {
      const list = formatOptionType(response.data.list)
      setList(list)
      pendingCompleteFunction()
    })
    .catch(error => {
      pendingCompleteFunction()
      errorFunction()
      console.error(error)
    })
}

export function getSingleOptionType(
  { errorFunction, pendingFunction, pendingCompleteFunction }: HttpHandlingFunctions,
  setData: (list: OptionTypeData) => void,
  chainId: ChainId | undefined,
  id: string | undefined
) {
  if (!chainId) return
  const request = new Request(`${domain}/app/getCreateOptionList?chainId=${chainId ?? ''}&id=${id ?? ''}`, {
    method: 'POST',
    body: '',
    headers
  })
  pendingFunction()

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        pendingCompleteFunction()
        errorFunction()
        throw new Error('server error')
      }
    })
    .then(response => {
      response.data.list?.[0] && setData(response.data.list[0])
      pendingCompleteFunction()
    })
    .catch(error => {
      pendingCompleteFunction()
      errorFunction()
      console.error(error)
    })
}
