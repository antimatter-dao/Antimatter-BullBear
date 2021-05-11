import React, { useState, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import { Currency } from '@uniswap/sdk'
import { ButtonPrimary } from 'components/Button'
import { OptionTypeData, useAllOptionTypes } from 'state/market/hooks'
import {
  OptionCard,
  Search,
  OptionInterface,
  Range,
  filterOption,
  AlternativeDisplay,
  ContentWrapper,
  parsePrice
} from '../OptionTrade'
import { useActiveWeb3React } from 'hooks'

export enum Type {
  CALL = 'call',
  PUT = 'put'
}

const Wrapper = styled.div`
  width: 100%;
  margin-bottom: auto;
`

export function getOptionList(allOptionType: OptionTypeData[]) {
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
      id
    } = item
    const floor = parsePrice(priceFloor, currencyDecimals)
    const cap = parsePrice(priceCap, currencyDecimals)
    const range = `$${floor} ~ $${cap}`
    const symbol = underlyingSymbol === 'WETH' ? 'ETH' : underlyingSymbol
    return [
      ...acc,
      {
        title: `${symbol ?? ''}(${floor}$${cap})`,
        underlyingAddress: underlying,
        underlyingSymbol: symbol,
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

export default function OptionExercise() {
  const { chainId } = useActiveWeb3React()
  const [optionList, setOptionList] = useState<OptionInterface[] | undefined>(undefined)
  const [filteredList, setFilteredList] = useState<OptionInterface[] | undefined>(undefined)
  const [assetTypeQuery, setAssetTypeQuery] = useState<Currency | undefined>(undefined)
  const [rangeQuery, setRangeQuery] = useState<Range>({
    floor: undefined,
    cap: undefined
  })
  const history = useHistory()

  const AllOptionType = useAllOptionTypes()

  useEffect(() => {
    if (!AllOptionType || AllOptionType?.length === 0) return
    const list = getOptionList(AllOptionType)
    setOptionList(list)
  }, [setOptionList, AllOptionType])

  useEffect(() => {
    const list = filterOption({ optionList, assetTypeQuery, optionTypeQuery: '', rangeQuery, chainId })
    setFilteredList(list)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetTypeQuery, optionList, rangeQuery.cap, rangeQuery.floor, setFilteredList])

  const handleSelectAssetType = useCallback((currency: Currency) => setAssetTypeQuery(currency), [])
  const handleRange = useCallback(range => setRangeQuery(range), [])
  const handleClearSearch = useCallback(() => {
    setAssetTypeQuery(undefined)
    setRangeQuery({
      floor: undefined,
      cap: undefined
    })
  }, [])
  return (
    <Wrapper id="optionExercise">
      <Search
        onAssetType={handleSelectAssetType}
        assetTypeQuery={assetTypeQuery}
        onRange={handleRange}
        clearSearch={handleClearSearch}
        rangeQuery={rangeQuery}
      />
      {filteredList && (
        <ContentWrapper>
          {filteredList.map(option => (
            <OptionCard
              option={option}
              key={option.title}
              buttons={
                <>
                  <ButtonPrimary onClick={() => history.push(`/generate/${option.optionType}`)}>Generate</ButtonPrimary>
                  <div style={{ width: 10 }} />
                  <ButtonPrimary onClick={() => history.push(`/redeem/${option.optionType}`)}>Redeem</ButtonPrimary>
                </>
              }
            />
          ))}
        </ContentWrapper>
      )}
      <AlternativeDisplay AllOptionType={AllOptionType} filteredList={filteredList} />
    </Wrapper>
  )
}
