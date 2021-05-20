import { OptionTypeData } from 'state/market/hooks'
import { OptionInterface, Type } from 'pages/OptionTrade'
import { parseBalance } from 'utils/marketStrategyUtils'
import { Token } from '@uniswap/sdk'
import { ZERO_ADDRESS } from 'constants/index'

export const parsePrice = (price: string, decimals: string) =>
  parseBalance({
    val: price,
    token: new Token(1, ZERO_ADDRESS, Number(decimals ?? '18'))
  })

export function formatCallOption(allOptionType: OptionTypeData[]) {
  return allOptionType.reduce((acc: OptionInterface[], item: OptionTypeData): OptionInterface[] => {
    const {
      id,
      callAddress,
      currencyDecimals,
      priceFloor,
      priceCap,
      callTotal,
      underlying,
      underlyingSymbol,
      currencySymbol
    } = item
    const floor = parsePrice(priceFloor, currencyDecimals)
    const cap = parsePrice(priceCap, currencyDecimals)
    const range = `$${floor} ~ $${cap}`
    const symbol = underlyingSymbol === 'WETH' ? 'ETH' : underlyingSymbol
    return [
      ...acc,
      {
        optionId: id,
        title: (symbol ?? '') + ' Call Option',
        address: callAddress,
        underlyingAddress: underlying,
        type: Type.CALL,
        underlyingSymbol: symbol,
        details: {
          'Option Price Range': range,
          'Underlying Asset': symbol ? `${symbol}, ${currencySymbol}` : '-',
          'Total Current Issuance': callTotal + ' Shares',
          'Market Price': '-'
        },
        range: { floor, cap }
      }
    ]
  }, [] as OptionInterface[])
}

export function formatPutOption(allOptionType: OptionTypeData[]) {
  return allOptionType.reduce((acc: OptionInterface[], item: OptionTypeData): OptionInterface[] => {
    const {
      id,
      putAddress,
      currencyDecimals,
      priceFloor,
      priceCap,
      putTotal,
      underlying,
      underlyingSymbol,
      currencySymbol,
      currency
    } = item
    const floor = parsePrice(priceFloor, currencyDecimals)
    const cap = parsePrice(priceCap, currencyDecimals)
    const range = `$${floor} ~ $${cap}`
    const symbol = underlyingSymbol === 'WETH' ? 'ETH' : underlyingSymbol
    return [
      ...acc,
      {
        optionId: id,
        title: (symbol ?? '') + ' Put Option',
        address: putAddress,
        underlyingAddress: underlying,
        currencyAddress: currency,
        type: Type.PUT,
        underlyingSymbol: symbol,
        details: {
          'Option Price Range': range,
          'Underlying Asset': symbol ? `${symbol}, ${currencySymbol}` : '-',
          'Total Current Issuance': putTotal + ' Shares',
          'Market Price': '-'
        },
        range: { floor, cap }
      }
    ]
  }, [] as OptionInterface[])
}

export function formatAndSplitOption(allOptionType: OptionTypeData[]) {
  return allOptionType.reduce((acc: OptionInterface[], item: OptionTypeData): OptionInterface[] => {
    const {
      id,
      callAddress,
      putAddress,
      underlyingDecimals,
      currencyDecimals,
      priceFloor,
      priceCap,
      callTotal,
      putTotal,
      underlying,
      underlyingSymbol
    } = item
    const floor = parsePrice(priceFloor, currencyDecimals)
    const cap = parsePrice(priceCap, currencyDecimals)
    const range = `$${floor} ~ $${cap}`
    const symbol = underlyingSymbol === 'WETH' ? 'ETH' : underlyingSymbol
    return [
      ...acc,
      {
        optionId: id,
        title: (symbol ?? '') + ' Call Option',
        address: callAddress,
        underlyingAddress: underlying,
        type: Type.CALL,
        underlyingSymbol: symbol,
        details: {
          'Option Price Range': range,
          'Underlying Asset': symbol ? symbol + ', USDT' : '-',
          'Total Current Issuance':
            parseBalance({
              val: callTotal,
              token: new Token(1, ZERO_ADDRESS, Number(underlyingDecimals ?? '18'))
            }) + ' Shares',
          'Market Price': '$2100'
        },
        range: { floor, cap }
      },
      {
        optionId: id,
        title: (symbol ?? '') + ' Put Option',
        address: putAddress,
        underlyingAddress: underlying,
        type: Type.PUT,
        underlyingSymbol: symbol,
        details: {
          'Option Price Range': range,
          'Underlying Asset': symbol ? symbol + ', USDT' : '-',
          'Total Current Issuance':
            parseBalance({
              val: putTotal,
              token: new Token(1, ZERO_ADDRESS, Number(underlyingDecimals ?? '18'))
            }) + ' Shares',
          'Market Price': '$2100'
        },
        range: { floor, cap }
      }
    ]
  }, [] as OptionInterface[])
}

export function formatOptionType(allOptionType: OptionTypeData[]) {
  return allOptionType.reduce((acc: OptionInterface[], item: OptionTypeData): OptionInterface[] => {
    const {
      currencyDecimals = '6',
      priceFloor,
      priceCap,
      underlying,
      underlyingSymbol,
      callAddress,
      putAddress,
      callBalance,
      underlyingDecimals,
      putBalance,
      currency,
      id
    } = item
    const floor = parsePrice(priceFloor, currencyDecimals)
    const cap = parsePrice(priceCap, currencyDecimals)
    const range = `$${floor} ~ $${cap}`
    const symbol = underlyingSymbol === 'WETH' ? 'ETH' : underlyingSymbol
    return [
      ...acc,
      {
        optionId: id,
        title: `${symbol ?? ''}(${floor}$${cap})`,
        underlyingAddress: underlying,
        currencyAddress: currency,
        underlyingSymbol: symbol,
        underlyingDecimals,
        optionType: id,
        addresses: {
          callAddress,
          putAddress
        },
        details: {
          'Option Price Range': range,
          'Underlying Asset': symbol ? symbol : '-',
          'Your Call Position': parsePrice(callBalance, underlyingDecimals),
          'Your Put Position': parsePrice(putBalance, underlyingDecimals)
        },
        range: { floor, cap }
      }
    ]
  }, [] as OptionInterface[])
}
