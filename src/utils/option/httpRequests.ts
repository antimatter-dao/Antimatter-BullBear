import { ChainId, Token } from '@uniswap/sdk'
import { OptionInterface } from 'pages/OptionTrade'
import { formatCallOption, formatPutOption, formatAndSplitOption, formatOptionType } from './utils'

export interface Underlying {
  underlying: string
  underlyingDecimals: number
  underlyingSymbol: string
}

export interface SearchQuery {
  id?: number | string
  priceCap?: number | string
  priceFloor?: number | string
  underlying?: string
}

const domain = 'http://47.241.192.211:8443'
const headers = { 'content-type': 'application/json', accept: 'application/json' }

export function getUnderlyingList(setList: (list: Token[] | undefined) => void, chainId: ChainId | undefined) {
  const request = new Request(domain + '/app/getUnderlyingList', {
    method: 'GET',
    headers
  })

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
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
            acc.push(new Token(chainId, underlying, underlyingDecimals, underlyingSymbol))
            return acc
          },
          []
        )
        response.data && setList(list)
      }
    })
    .catch(error => {
      console.error(error)
    })
}

export function getPutOptionList(setList: (list: OptionInterface[]) => void, chainId: ChainId | undefined, query = '') {
  if (!chainId) return
  const request = new Request(`${domain}/app/getPutCreateOptionList?chainId=${chainId}${query ? '&' + query : ''}`, {
    method: 'POST',
    body: '',
    headers
  })

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw new Error('server error')
      }
    })
    .then(response => {
      const list = formatPutOption(response.data)
      setList(list)
    })
    .catch(error => {
      console.error(error)
    })
}

export function getCallOptionList(
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

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw new Error('server error')
      }
    })
    .then(response => {
      console.debug(response)
      const list = formatCallOption(response.data)
      setList(list)
    })
    .catch(error => {
      console.error(error)
    })
}

export function getSingleOtionList(
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

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw new Error('server error')
      }
    })
    .then(response => {
      console.debug(response)
      const list = formatAndSplitOption(response.data.records)
      setList(list)
    })
    .catch(error => {
      console.error(error)
    })
}

export function getOtionTypeList(setList: (list: OptionInterface[]) => void, chainId: ChainId | undefined, query = '') {
  if (!chainId) return
  const request = new Request(`${domain}/app/getCreateOptionList?chainId=${chainId}${query ? '&' + query : ''}`, {
    method: 'POST',
    body: '',
    headers
  })

  fetch(request)
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw new Error('server error')
      }
    })
    .then(response => {
      const list = formatOptionType(response.data.records)
      setList(list)
    })
    .catch(error => {
      console.error(error)
    })
}
