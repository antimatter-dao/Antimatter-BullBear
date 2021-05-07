import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useHistory, RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { Currency, Token } from '@uniswap/sdk'
import ButtonSelect from 'components/Button/ButtonSelect'
import AppBody from 'pages/AppBody'
import { ButtonOutlinedPrimary, ButtonPrimary } from 'components/Button'
import { CustomLightSpinner, TYPE } from 'theme'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { OptionIcon } from 'components/Icons'
//import { ReactComponent as ETH } from '../../assets/svg/eth_logo.svg'
import { ReactComponent as SearchIcon } from '../../assets/svg/search.svg'
import { AutoColumn } from 'components/Column'
import { shortenAddress } from 'utils'
import { OptionTypeData, useAllOptionTypes } from 'state/market/hooks'
import { currencyNameHelper, parseBalance } from 'utils/marketStrategyUtils'
import { USDT, ZERO_ADDRESS } from '../../constants'
import { ButtonSelectRange } from 'components/Button/ButtonSelectRange'
import OptionTradeAction from './OptionTradeAction'
import { useCurrency } from 'hooks/Tokens'
import CurrencyLogo from 'components/CurrencyLogo'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { currencyId } from 'utils/currencyId'
import Loader from 'assets/svg/gray_loader.svg'
import { useUSDTPrice } from 'utils/useUSDCPrice'
export interface OptionInterface {
  title: string
  address: string
  underlyingAddress: string
  type: Type
  underlyingSymbol: string | undefined
  details: {
    'Option Price Range': string | undefined
    'Underlying Asset': string | undefined
    'Total Current Issuance': string | undefined
    'Market Price': string | undefined
  }
  range: {
    floor: string | undefined
    cap: string | undefined
  }
}
const ALL = {
  id: 'all',
  title: 'All'
}

export enum Type {
  CALL = 'call',
  PUT = 'put'
}

const Wrapper = styled.div`
  width: 100%;
  margin-bottom: auto;
`

const ContentWrapper = styled.div`
  display: grid;
  grid-gap: 24px;
  grid-template-columns: repeat(auto-fill, 280px);
  padding: 52px 120px;
`

const Search = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.text5};
  padding: 23px;
  display: flex;
  justify-content: center;
`

const Circle = styled.div`
  margin-right: 16px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.bg5};
  background-color: ${({ theme }) => theme.bg4};
  height: 44px;
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Divider = styled.div`
  border: 1px solid ${({ theme }) => theme.bg4};
  width: calc(100% + 48px);
  margin: 0 -24px;
`

const parsePrice = (price: string, decimals: string) =>
  parseBalance({
    val: price,
    token: new Token(1, ZERO_ADDRESS, Number(decimals ?? '18'))
  })

function getOptionList(allOptionType: OptionTypeData[]) {
  return allOptionType.reduce((acc: OptionInterface[], item: OptionTypeData): OptionInterface[] => {
    const {
      callAddress,
      putAddress,
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
    return [
      ...acc,
      {
        title: (underlyingSymbol ?? '') + ' Call Option',
        address: callAddress,
        underlyingAddress: underlying,
        type: Type.CALL,
        underlyingSymbol,
        details: {
          'Option Price Range': range,
          'Underlying Asset': underlyingSymbol,
          'Total Current Issuance': parseBalance({
            val: callTotal,
            token: new Token(1, ZERO_ADDRESS, Number(currencyDecimals ?? '18'))
          }),
          'Market Price': '$2100'
        },
        range: { floor, cap }
      },
      {
        title: (underlyingSymbol ?? '') + ' Put Option',
        address: putAddress,
        underlyingAddress: underlying,
        type: Type.PUT,
        underlyingSymbol,
        details: {
          'Option Price Range': range,
          'Underlying Asset': underlyingSymbol,
          'Total Current Issuance': parseBalance({
            val: putTotal,
            token: new Token(1, ZERO_ADDRESS, Number(currencyDecimals ?? '18'))
          }),
          'Market Price': '$2100'
        },
        range: { floor, cap }
      }
    ]
  }, [] as OptionInterface[])
}

export default function OptionTrade({
  match: {
    params: { addressA }
  }
}: RouteComponentProps<{ addressA?: string }>) {
  const [optionList, setOptionList] = useState<OptionInterface[] | undefined>(undefined)
  const [filteredList, setFilteredList] = useState<OptionInterface[] | undefined>(undefined)
  const [assetTypeQuery, setAssetTypeQuery] = useState<Currency | undefined>(undefined)
  const [optionTypeQuery, setOptionTypeQuery] = useState('')
  const [currencySearchOpen, setCurrencySearchOpen] = useState(false)
  const [rangeQuery, setRangeQuery] = useState<{ floor: undefined | number; cap: undefined | number }>({
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
    let list = optionList
    if (assetTypeQuery !== undefined) {
      const id = currencyId(assetTypeQuery)
      list = optionList?.filter(option => option.underlyingAddress === id || option.address === id)
    }
    if (optionTypeQuery !== '') {
      if (optionTypeQuery !== ALL.id) {
        list = optionList?.filter(option => option.type === optionTypeQuery)
      }
    }
    if (!(rangeQuery.floor === undefined || rangeQuery.cap === undefined)) {
      list = optionList?.filter(({ range: { floor, cap } }) => {
        if (!floor || !cap) return true

        if (rangeQuery.floor && +rangeQuery.floor > +floor) return false

        if (rangeQuery.cap && +rangeQuery.cap < +cap) return false

        return true
      })
    }

    setFilteredList(list)
  }, [assetTypeQuery, optionList, optionTypeQuery, rangeQuery.cap, rangeQuery.floor, setFilteredList])

  const option = useMemo(() => {
    if (!optionList || optionList.length === 0) {
      return undefined
    }
    return optionList.find(({ address }) => address === addressA)
  }, [addressA, optionList])

  const handleSelectAssetType = useCallback((currency: Currency) => setAssetTypeQuery(currency), [])
  const handleSelectOptionType = useCallback((id: string) => setOptionTypeQuery(id), [])
  const handleRange = useCallback(range => setRangeQuery(range), [])
  const handleDismissSearch = useCallback(() => setCurrencySearchOpen(false), [])
  const handleOpenSearch = useCallback(() => setCurrencySearchOpen(true), [])
  const handleClearSearch = useCallback(() => {
    setAssetTypeQuery(undefined)
    setOptionTypeQuery('')
    setRangeQuery({
      floor: undefined,
      cap: undefined
    })
  }, [])
  return (
    <>
      <CurrencySearchModal
        isOpen={currencySearchOpen}
        onDismiss={handleDismissSearch}
        onCurrencySelect={handleSelectAssetType}
      />
      {addressA ? (
        <OptionTradeAction addressA={addressA} option={option} />
      ) : (
        <Wrapper id="optionTrade">
          <Search>
            <ButtonSelect width="320px" onClick={handleOpenSearch}>
              {assetTypeQuery && <CurrencyLogo currency={assetTypeQuery} size={'24px'} style={{ marginRight: 15 }} />}
              {currencyNameHelper(assetTypeQuery, 'Select asset type currency')}
            </ButtonSelect>
            <ButtonSelect
              placeholder="Select option type"
              width="320px"
              selectedId={optionTypeQuery}
              onSelection={handleSelectOptionType}
              options={[
                { id: ALL.id, option: ALL.title },
                { id: Type.CALL, option: 'Call Option' },
                { id: Type.PUT, option: 'Call Put' }
              ]}
            />
            <ButtonSelectRange
              placeholder="Select price range"
              width="320px"
              rangeCap={rangeQuery.cap?.toString()}
              rangeFloor={rangeQuery.floor?.toString()}
              onSetRange={handleRange}
            />
            <RowFixed>
              <ButtonOutlinedPrimary width="184px">
                <SearchIcon style={{ marginRight: 10 }} />
                Search
              </ButtonOutlinedPrimary>
              <div style={{ width: 10 }} />
              <ButtonPrimary width="184px" onClick={handleClearSearch}>
                Show All
              </ButtonPrimary>
            </RowFixed>
          </Search>

          {filteredList && (
            <ContentWrapper>
              {filteredList.map(option => (
                <OptionCard
                  option={option}
                  key={option.title}
                  onClick={() => history.push(`/option_trading/${option.address}/${USDT.address}`)}
                />
              ))}
            </ContentWrapper>
          )}
          <AutoColumn justify="center" style={{ marginTop: 100 }}>
            {AllOptionType.length > 0 && filteredList && filteredList.length === 0 && (
              <TYPE.largeHeader>No option available</TYPE.largeHeader>
            )}
            {filteredList === undefined && (
              <CustomLightSpinner src={Loader} size="100px" style={{ margin: '0 auto' }} />
            )}
          </AutoColumn>
        </Wrapper>
      )}
    </>
  )
}

function OptionCard({
  option: { title, type, address, details, underlyingAddress },
  onClick
}: {
  option: OptionInterface
  onClick: () => void
}) {
  const underlyingCurrency = useCurrency(underlyingAddress)
  const currency = useCurrency(address)
  const price = useUSDTPrice(currency ?? undefined)
  return (
    <AppBody>
      <AutoColumn gap="20px">
        <AutoRow>
          <Circle>
            <OptionIcon
              tokenIcon={<CurrencyLogo currency={underlyingCurrency ?? undefined} size="28px" />}
              type={type}
              size="28px"
            />
          </Circle>
          <AutoColumn>
            <TYPE.mediumHeader fontSize={23}>{title}</TYPE.mediumHeader>
            <TYPE.smallGray>{shortenAddress(address, 7)}</TYPE.smallGray>
          </AutoColumn>
        </AutoRow>
        <Divider />
        <AutoColumn gap="12px">
          {Object.keys(details).map(key => (
            <RowBetween key={key}>
              <TYPE.smallGray>{key}:</TYPE.smallGray>
              <TYPE.subHeader>
                {key === 'Market Price' ? (price ? `$${price}` : '-') : details[key as keyof typeof details]}
              </TYPE.subHeader>
            </RowBetween>
          ))}
        </AutoColumn>
        <ButtonPrimary onClick={onClick}>Trade</ButtonPrimary>
      </AutoColumn>
    </AppBody>
  )
}
