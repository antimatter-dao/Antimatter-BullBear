import { ChainId, Token } from '@uniswap/sdk'
import { UTCTimestamp } from 'lightweight-charts'
import { OptionInterface } from 'pages/OptionTrade'
import { formatOptionType } from './utils'
import { HttpHandlingFunctions } from 'hooks/useNetwork'

export interface Underlying {
  underlying: string
  underlyingDecimals: string
  underlyingSymbol: string
}

export interface DexTradeData {
  time: UTCTimestamp
  high: number
  low: number
  open: number
  close: number
}

const domain = 'https://testapi.antimatter.finance'
const headers = { 'content-type': 'application/json', accept: 'application/json' }

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
