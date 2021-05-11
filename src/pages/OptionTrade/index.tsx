import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useHistory, RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { Currency, Token, WETH, ETHER, ChainId } from '@uniswap/sdk'
import ButtonSelect from 'components/Button/ButtonSelect'
import AppBody from 'pages/AppBody'
import { ButtonOutlinedPrimary, ButtonPrimary } from 'components/Button'
import { CustomLightSpinner, ExternalLink, TYPE } from 'theme'
import { RowBetween, RowFixed } from 'components/Row'
import { OptionIcon } from 'components/Icons'
//import { ReactComponent as ETH } from '../../assets/svg/eth_logo.svg'
import { ReactComponent as SearchIcon } from '../../assets/svg/search.svg'
import { AutoColumn } from 'components/Column'
import { getEtherscanLink, shortenAddress } from 'utils'
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
import { useActiveWeb3React } from 'hooks'
import { XCircle } from 'react-feather'
export interface OptionInterface {
  title: string
  address?: string
  addresses?: {
    callAddress: string | undefined
    putAddress: string | undefined
  }
  optionType?: string
  underlyingAddress: string
  type?: Type
  underlyingSymbol: string | undefined
  details: {
    'Option Price Range': string | undefined
    'Underlying Asset': string | undefined
    'Total Current Issuance'?: string | undefined
    'Market Price'?: string | undefined
    'Your Call Position'?: string | undefined
    'Your Put Position'?: string | undefined
  }
  range: {
    floor: string | undefined
    cap: string | undefined
  }
}

export interface Range {
  floor: undefined | number | string
  cap: undefined | number | string
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

export const ContentWrapper = styled.div`
  display: grid;
  grid-gap: 24px;
  grid-template-columns: repeat(auto-fill, 280px);
  padding: 52px 120px;
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 30px`}
`

const StyledSearch = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.text5};
  padding: 23px;
  padding-left: 50px
  display: flex;
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

const TitleWrapper = styled(RowFixed)`
  flex-wrap: nowrap;
`
export const StyledExternalLink = styled(ExternalLink)`
  text-decoration: none;
  font-size: 12px;
  color: ${({ theme }) => theme.text3};
  :hover {
    color: ${({ theme }) => theme.text4};
  }
`

export const parsePrice = (price: string, decimals: string) =>
  parseBalance({
    val: price,
    token: new Token(1, ZERO_ADDRESS, Number(decimals ?? '18'))
  })

function getOptionList(allOptionType: OptionTypeData[]) {
  return allOptionType.reduce((acc: OptionInterface[], item: OptionTypeData): OptionInterface[] => {
    const {
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
        title: (underlyingSymbol ?? '') + ' Put Option',
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

export function filterOption({
  chainId,
  optionList,
  assetTypeQuery,
  optionTypeQuery,
  rangeQuery
}: {
  chainId: ChainId | undefined
  optionList: OptionInterface[] | undefined
  assetTypeQuery: Currency | undefined
  optionTypeQuery: string
  rangeQuery: Range
}) {
  if (!optionList) return undefined
  let list = optionList
  if (assetTypeQuery !== undefined) {
    const id = currencyId(assetTypeQuery)
    list = list?.filter(option => {
      const underlyingAddress =
        chainId && WETH[chainId] && option.underlyingAddress === currencyId(WETH[chainId])
          ? currencyId(ETHER)
          : option.underlyingAddress
      return underlyingAddress === id || option.address === id
    })
  }
  if (optionTypeQuery !== '') {
    if (optionTypeQuery !== ALL.id) {
      list = list?.filter(option => option.type === optionTypeQuery)
    }
  }
  if (!(rangeQuery.floor === undefined || rangeQuery.cap === undefined)) {
    list = list?.filter(({ range: { floor, cap } }) => {
      if (!floor || !cap) return true

      if (rangeQuery.floor && +rangeQuery.floor > +floor) return false

      if (rangeQuery.cap && +rangeQuery.cap < +cap) return false

      return true
    })
  }
  return list
}

export default function OptionTrade({
  match: {
    params: { addressA }
  }
}: RouteComponentProps<{ addressA?: string }>) {
  const { chainId } = useActiveWeb3React()
  const [optionList, setOptionList] = useState<OptionInterface[] | undefined>(undefined)
  const [filteredList, setFilteredList] = useState<OptionInterface[] | undefined>(undefined)
  const [assetTypeQuery, setAssetTypeQuery] = useState<Currency | undefined>(undefined)
  const [optionTypeQuery, setOptionTypeQuery] = useState('')
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
    const list = filterOption({ optionList, assetTypeQuery, optionTypeQuery, rangeQuery, chainId })
    setFilteredList(list)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {addressA ? (
        <OptionTradeAction addressA={addressA} option={option} />
      ) : (
        <Wrapper id="optionTrade">
          <Search
            onAssetType={handleSelectAssetType}
            assetTypeQuery={assetTypeQuery}
            optionTypeQuery={optionTypeQuery}
            onOptionType={handleSelectOptionType}
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
                    <ButtonPrimary onClick={() => history.push(`/option_trading/${option.address}/${USDT.address}`)}>
                      Trade
                    </ButtonPrimary>
                  }
                />
              ))}
            </ContentWrapper>
          )}
          <AlternativeDisplay AllOptionType={AllOptionType} filteredList={filteredList} />
        </Wrapper>
      )}
    </>
  )
}

export function OptionCard({
  option: { title, type, address, details, underlyingAddress },
  buttons
}: {
  option: OptionInterface
  buttons: JSX.Element
}) {
  const { chainId } = useActiveWeb3React()
  const underlyingCurrency = useCurrency(underlyingAddress)
  const currency = useCurrency(address)
  const price = useUSDTPrice(currency ?? undefined)
  return (
    <AppBody>
      <AutoColumn gap="20px">
        <TitleWrapper>
          <Circle>
            {type ? (
              <OptionIcon
                tokenIcon={<CurrencyLogo currency={underlyingCurrency ?? undefined} size="28px" />}
                type={type}
                size="26px"
              />
            ) : (
              <CurrencyLogo currency={underlyingCurrency ?? undefined} size="28px" />
            )}
          </Circle>
          <AutoColumn gap="5px">
            <TYPE.mediumHeader fontSize={20} style={{ whiteSpace: 'nowrap' }}>
              {title}
            </TYPE.mediumHeader>
            {address && (
              <StyledExternalLink href={chainId ? getEtherscanLink(chainId, address, 'token') : ''}>
                {shortenAddress(address, 7)}
              </StyledExternalLink>
            )}
          </AutoColumn>
        </TitleWrapper>
        <Divider />
        <AutoColumn gap="12px">
          {Object.keys(details).map(key => (
            <RowBetween key={key}>
              <TYPE.smallGray>{key}:</TYPE.smallGray>
              <TYPE.subHeader>
                {key === 'Market Price' ? (price ? `$${price.toFixed()}` : '-') : details[key as keyof typeof details]}
              </TYPE.subHeader>
            </RowBetween>
          ))}
        </AutoColumn>
        <RowBetween>{buttons}</RowBetween>
      </AutoColumn>
    </AppBody>
  )
}

export function Search({
  onAssetType,
  onOptionType,
  onRange,
  assetTypeQuery,
  optionTypeQuery,
  rangeQuery,
  clearSearch
}: {
  onAssetType: (currency: Currency) => void
  onOptionType?: (type: string) => void
  onRange: (range: Range) => void
  assetTypeQuery: Currency | undefined
  optionTypeQuery?: string
  rangeQuery: Range
  clearSearch: () => void
}) {
  const [currencySearchOpen, setCurrencySearchOpen] = useState(false)
  const handleDismissSearch = useCallback(() => setCurrencySearchOpen(false), [])
  const handleOpenAssetSearch = useCallback(() => setCurrencySearchOpen(true), [])

  return (
    <>
      <CurrencySearchModal isOpen={currencySearchOpen} onDismiss={handleDismissSearch} onCurrencySelect={onAssetType} />
      <StyledSearch>
        <ButtonSelect width="320px" onClick={handleOpenAssetSearch}>
          {assetTypeQuery && <CurrencyLogo currency={assetTypeQuery} size={'24px'} style={{ marginRight: 15 }} />}
          {currencyNameHelper(assetTypeQuery, 'Select asset type')}
        </ButtonSelect>
        {onOptionType && (
          <ButtonSelect
            placeholder="Select option type"
            width="320px"
            selectedId={optionTypeQuery}
            onSelection={onOptionType}
            options={[
              { id: ALL.id, option: ALL.title },
              { id: Type.CALL, option: 'Call Option' },
              { id: Type.PUT, option: 'Put Option' }
            ]}
          />
        )}
        <ButtonSelectRange
          placeholder="Select price range"
          width="320px"
          rangeCap={rangeQuery.cap?.toString()}
          rangeFloor={rangeQuery.floor?.toString()}
          onSetRange={onRange}
        />
        <RowFixed>
          <ButtonOutlinedPrimary width="184px">
            <SearchIcon style={{ marginRight: 10 }} />
            Search
          </ButtonOutlinedPrimary>
          <div style={{ width: 10 }} />
          <ButtonPrimary width="184px" onClick={clearSearch}>
            Show All
          </ButtonPrimary>
        </RowFixed>
      </StyledSearch>
    </>
  )
}

export function AlternativeDisplay({
  AllOptionType,
  filteredList
}: {
  AllOptionType: OptionTypeData[]
  filteredList: OptionInterface[] | undefined
}) {
  return (
    <AutoColumn justify="center" style={{ marginTop: 100 }}>
      {AllOptionType.length > 0 && filteredList && filteredList.length === 0 && (
        <AutoColumn justify="center" gap="20px">
          <XCircle size={40} strokeWidth={1} />
          <TYPE.body>No results found</TYPE.body>
          <TYPE.body>Please change your search query and try again</TYPE.body>
        </AutoColumn>
      )}
      {filteredList === undefined && <CustomLightSpinner src={Loader} size="100px" style={{ margin: '0 auto' }} />}
    </AutoColumn>
  )
}
