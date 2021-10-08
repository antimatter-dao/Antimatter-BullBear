import CopyHelper from 'components/AccountDetails/Copy'
import React from 'react'
import { shortenAddress } from 'utils'
import { parsePrice } from './utils'
import { ButtonOutlinedPrimary } from 'components/Button'
import { RowFixed } from 'components/Row'
import { MyPositionType } from 'hooks/useUserFetch'

export const formatMyCreation = (
  data: any[] | undefined,
  historyPush: (param: string) => void
): (string | number | Element)[][] => {
  if (!data) return [] as (string | number | Element)[][]

  return data.reduce(
    (
      acc,
      {
        underlyingSymbol,
        priceCap,
        priceFloor,
        currencyDecimals,
        totalCall,
        totalPut,
        callAddress,
        putAddress,
        optionIndex
      }
    ) => {
      acc.push(
        [
          `${underlyingSymbol}($${parsePrice(priceFloor, currencyDecimals)} ~ $${parsePrice(
            priceCap,
            currencyDecimals
          )})`,
          'Bull',
          parsePrice(totalCall, '18'),
          <RowFixed key={callAddress}>
            {shortenAddress(callAddress, 6)}
            <CopyHelper key={callAddress + 'a'} toCopy={callAddress} />
          </RowFixed>,
          <ButtonOutlinedPrimary
            key={callAddress}
            onClick={() => {
              historyPush(`/option_trading/${optionIndex}`)
            }}
            padding="12px"
          >
            Trade
          </ButtonOutlinedPrimary>
        ],
        [
          `${underlyingSymbol}($${parsePrice(priceFloor, currencyDecimals)} ~ $${parsePrice(
            priceCap,
            currencyDecimals
          )})`,
          'Bear',
          totalPut,
          <RowFixed key={putAddress}>
            {shortenAddress(putAddress, 6)}
            <CopyHelper key={putAddress + 'a'} toCopy={putAddress} />
          </RowFixed>,
          <ButtonOutlinedPrimary
            key={putAddress}
            onClick={() => {
              historyPush(`/option_trading/${optionIndex}`)
            }}
            padding="12px"
          >
            Trade
          </ButtonOutlinedPrimary>
        ]
      )
      return acc
    },
    [] as (string | number | Element)[][]
  )
}

export const formatMyPositionRow = (
  { option, type, amount, address, id }: { option: string; type: string; amount: string; address: string; id: string },
  historyPush: (param: string) => void
): (string | number | JSX.Element)[] => {
  return [
    option,
    type,
    amount,
    <RowFixed key={address}>
      {shortenAddress(address, 6)}
      <CopyHelper toCopy={address} />
    </RowFixed>,
    <ButtonOutlinedPrimary
      key={id}
      onClick={() => {
        historyPush(`/option_trading/${id}`)
      }}
      padding="12px"
    >
      Trade
    </ButtonOutlinedPrimary>
  ]
}

export const formatMyTransactionRow = (
  { type, tradesAmount, price, priceFloor, priceCap, optionIndex }: any,
  currencyDecimal: any,
  underlyingSymbol: any,
  tokenDecimal: any,
  historyPush: (param: string) => void
) => {
  return [
    `${type === MyPositionType.Call ? '+' : '-'}${underlyingSymbol}(${parsePrice(
      priceFloor,
      currencyDecimal
    )}~${parsePrice(priceCap, currencyDecimal)})`,
    type,
    parsePrice(tradesAmount, tokenDecimal),
    parsePrice(price, currencyDecimal),
    tradesAmount.toString()[0] === '-' ? 'Sell' : 'Buy'
    //   <ButtonOutlinedPrimary
    //     key={optionIndex}
    //     onClick={() => {
    //       historyPush(`/option_trading/${optionIndex}`)
    //     }}
    //     padding="12px"
    //   >
    //     Trade
    //   </ButtonOutlinedPrimary>
  ]
}
