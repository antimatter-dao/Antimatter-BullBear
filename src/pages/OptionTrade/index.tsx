import React, { useState, useCallback, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { Currency, Token, JSBI } from '@uniswap/sdk'
import ButtonSelect from 'components/Button/ButtonSelect'
import AppBody from 'pages/AppBody'
import { ButtonOutlinedPrimary, ButtonPrimary } from 'components/Button'
import { AnimatedImg, AnimatedWrapper, ExternalLink, TYPE } from 'theme'
import { RowBetween, RowFixed } from 'components/Row'
//import { OptionIcon } from 'components/Icons'
import { ReactComponent as SearchIcon } from '../../assets/svg/search.svg'
import { AutoColumn } from 'components/Column'
import { getEtherscanLink, shortenAddress } from 'utils'
import { currencyNameHelper } from 'utils/marketStrategyUtils'
//import { USDT, ZERO_ADDRESS } from '../../constants'
import { ButtonSelectRange } from 'components/Button/ButtonSelectRange'
import { ButtonSelectNumericalInput } from 'components/Button/ButtonSelectNumericalInput'
import OptionTradeAction from './OptionTradeAction'
//import { useCurrency } from 'hooks/Tokens'
import CurrencyLogo from 'components/CurrencyLogo'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import { currencyId } from 'utils/currencyId'
import Loader from 'assets/svg/antimatter_background_logo.svg'
//import { useUSDTPrice } from 'utils/useUSDCPrice'
import { useActiveWeb3React } from 'hooks'
import { XCircle } from 'react-feather'
import useTheme from 'hooks/useTheme'
import { SearchQuery } from 'utils/option/httpRequests'
//import { useNetwork } from 'hooks/useNetwork'
import { useOption, useOptionTypeCount } from '../../state/market/hooks'
import { useCurrencyBalances } from '../../state/wallet/hooks'
import { tryFormatAmount } from '../../state/swap/hooks'

export interface OptionInterface {
  optionId: string | undefined
  title: string
  address?: string
  addresses?: {
    callAddress: string | undefined
    putAddress: string | undefined
  }
  optionType?: string
  underlyingAddress: string
  underlyingDecimals?: string
  currencyAddress?: string
  currencyDecimals?: string
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
  position: relative;
  max-width: 1280px;
  margin: auto;
  display: grid;
  grid-gap: 24px;
  grid-template-columns: repeat(auto-fill, 280px);
  padding: 52px 0;
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToLarge`padding: 30px`}
  ${({ theme }) => theme.mediaWidth.upToSmall`padding: 10px`}
`

const WrapperSearch = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.text5};
`

const StyledSearch = styled.div`
  margin: auto;
  padding: 23px;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  width: 1280px;
  & > * {
    margin-bottom: 8px;
  }
  & > div {
    flex-shrink: 1;
  }
  ${({ theme }) => theme.mediaWidth.upToLarge`
    padding: 23px 50px;
    flex-wrap: wrap
    flex-direction: column
    width: 100%;
  `}
`
const ButtonWrapper = styled(RowFixed)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column
  width: 100%;
  button{
    width: 100%;
    :first-child{
      margin-bottom: 8px
    }
  }
`}
`

const Circle = styled.div`
  flex-shrink: 0;
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
  border-bottom: 1px solid ${({ theme }) => theme.bg4};
  width: calc(100% + 40px);
  margin: 0 -20px;
`

const TitleWrapper = styled(RowFixed)`
  flex-wrap: nowrap;
  width: 100%;
`
const OptionId = styled(TYPE.smallGray)`
  border-radius: 20px;
  background-color: ${({ theme }) => theme.bg4};
  padding: 3px 6px;
  margin-right: 10px !important;
`

export const StyledExternalLink = styled(ExternalLink)`
  text-decoration: none;
  font-size: 12px;
  color: ${({ theme }) => theme.text3};
  :hover {
    color: ${({ theme }) => theme.text4};
  }
`

export default function OptionTrade({
  match: {
    params: { optionId }
  }
}: RouteComponentProps<{ optionId?: string }>) {
  //const { chainId } = useActiveWeb3React()
  const optionCount = useOptionTypeCount()
  const optionTypeIndexes = useMemo(() => {
    return Array.from({ length: optionCount }, (v, i) => i.toString())
  }, [optionCount])
  //const [tokenList, setTokenList] = useState<Token[] | undefined>(undefined)
  //const [optionList, setOptionList] = useState<OptionInterface[] | undefined>(undefined)
  //const [filteredList, setFilteredList] = useState<OptionInterface[] | undefined>(undefined)
  //const [optionTypeQuery, setOptionTypeQuery] = useState('')
  const history = useHistory()
  //const { httpHandlingFunctions, networkErrorModal, networkPendingSpinner, wrapperId } = useNetwork()

  //const handleSelectOptionType = useCallback((id: string) => setOptionTypeQuery(id), [])
  //const handleSetTokenList = useCallback((list: Token[] | undefined) => setTokenList(list), [])
  //const handleSetOptionList = useCallback((list: OptionInterface[] | undefined) => setOptionList(list), [])
  // const handleClearSearch = useCallback(() => {
  //   setOptionTypeQuery('')
  //   setFilteredList(optionList)
  // }, [optionList])
  // const handleSearch = useCallback(
  //   body => {
  //     const query = Object.keys(body).reduce((acc, key, idx) => {
  //       if (key === 'underlying' && body.underlying === ZERO_ADDRESS) {
  //         return acc
  //       }
  //       return `${acc}${idx === 0 ? '' : '&'}${key}=${body[key]}`
  //     }, '')
  //     const handleFilteredList = (list: OptionInterface[]) => setFilteredList(list)
  //
  //     if (optionTypeQuery === Type.CALL) {
  //       getCallOptionList(httpHandlingFunctions, handleFilteredList, chainId, query)
  //       return
  //     }
  //     if (optionTypeQuery === Type.PUT) {
  //       getPutOptionList(httpHandlingFunctions, handleFilteredList, chainId, query)
  //       return
  //     }
  //     getSingleOtionList(httpHandlingFunctions, handleFilteredList, chainId, query)
  //   },
  //   [chainId, httpHandlingFunctions, optionTypeQuery]
  // )

  // const option = useMemo(() => {
  //   if (!optionList || optionList.length === 0) {
  //     return undefined
  //   }
  //   return optionList.find(({ address }) => address === addressA)
  // }, [addressA, optionList])

  // useEffect(() => {
  //   getUnderlyingList(handleSetTokenList, chainId, httpHandlingFunctions.errorFunction)
  //   getSingleOtionList(httpHandlingFunctions, handleSetOptionList, chainId)
  // }, [chainId, handleSetTokenList, handleSetOptionList, httpHandlingFunctions.errorFunction, httpHandlingFunctions])

  // useEffect(() => {
  //   if (optionList) {
  //     setFilteredList(optionList)
  //   }
  // }, [optionList])

  return (
    <>
      {/*{networkErrorModal}*/}
      {optionId ? (
        <OptionTradeAction optionId={optionId} />
      ) : (
        <Wrapper id="optionTrade">
          {/*<Search*/}
          {/*  optionTypeQuery={optionTypeQuery}*/}
          {/*  onOptionType={handleSelectOptionType}*/}
          {/*  onClear={handleClearSearch}*/}
          {/*  onSearch={handleSearch}*/}
          {/*  tokenList={tokenList}*/}
          {/*/>*/}
          {optionTypeIndexes && (
            <ContentWrapper id={''}>
              {/*{networkPendingSpinner}*/}
              {optionTypeIndexes.map(optionId => (
                <OptionCard
                  optionId={optionId}
                  key={optionId}
                  buttons={
                    <ButtonPrimary onClick={() => history.push(`/option_trading/${optionId}`)}>Trade</ButtonPrimary>
                  }
                />
              ))}
            </ContentWrapper>
          )}
          {/*<AlternativeDisplay optionList={optionList} filteredList={filteredList} />*/}
        </Wrapper>
      )}
    </>
  )
}

export function OptionCard({ optionId, buttons }: { optionId: string; buttons: JSX.Element }) {
  const option = useOption(optionId)
  const { account, chainId } = useActiveWeb3React()
  const balances = useCurrencyBalances(
    account ?? undefined,
    option ? [option.call?.currency, option.put?.currency] : []
  )
  const range = {
    cap: tryFormatAmount(option?.priceCap, option?.currency ?? undefined),
    floor: tryFormatAmount(option?.priceFloor, option?.currency ?? undefined)
  }
  const details = {
    'Option Price Range': option ? `$${range.floor?.toExact().toString()}~$${range.cap?.toExact().toString()}` : '',
    'Underlying Asset': option ? `${option.underlying?.symbol}/${option.currency?.symbol}` : '-',
    'Your Call Position': balances[0]?.toExact(),
    'Your Put Position': balances[1]?.toExact()
  }
  //const underlyingCurrency = useCurrency(underlyingAddress)
  //const currency = useCurrency(address)
  //const price = useUSDTPrice(currency ?? undefined)
  return (
    <AppBody style={{ position: 'relative', padding: '24px 20px' }} isCard>
      <AutoColumn gap="20px">
        <TitleWrapper>
          <Circle>
            {/*{type ? (*/}
            {/*  <OptionIcon*/}
            {/*    tokenIcon={<CurrencyLogo currency={underlyingCurrency ?? undefined} size="28px" />}*/}
            {/*    type={type}*/}
            {/*    size="26px"*/}
            {/*  />*/}
            {/*) : (*/}
            {/*  <CurrencyLogo currency={underlyingCurrency ?? undefined} size="28px" />*/}
            {/*)}*/}
            <CurrencyLogo currency={option?.underlying ?? undefined} size="28px" />
          </Circle>
          <AutoColumn gap="5px" style={{ width: '100%', position: 'relative' }}>
            <TYPE.mediumHeader
              fontSize={20}
              style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
            >
              {`${option?.underlying?.symbol} Option`}
            </TYPE.mediumHeader>
            {option?.underlying && (
              <RowFixed>
                <OptionId>ID:&nbsp;{optionId}</OptionId>
                <StyledExternalLink
                  href={chainId ? getEtherscanLink(chainId, option.underlying?.address, 'token') : ''}
                >
                  {shortenAddress(option.underlying?.address, 5)}
                </StyledExternalLink>
              </RowFixed>
            )}
          </AutoColumn>
        </TitleWrapper>
        <Divider />
        <AutoColumn gap="12px">
          {Object.keys(details).map(key => (
            <RowBetween key={key}>
              <TYPE.smallGray>{key}:</TYPE.smallGray>
              <TYPE.main
                style={{ textAlign: 'right', overflow: 'hidden', whiteSpace: 'pre-wrap', textOverflow: 'ellipsis' }}
              >
                {details[key as keyof typeof details]}
              </TYPE.main>
            </RowBetween>
          ))}
        </AutoColumn>
        <RowBetween>{buttons}</RowBetween>
      </AutoColumn>
    </AppBody>
  )
}

export function Search({
  onOptionType,
  optionTypeQuery,
  onClear,
  onSearch,
  tokenList
}: {
  onOptionType?: (type: string) => void
  optionTypeQuery?: string
  onClear?: () => void
  onSearch: (query: SearchQuery) => void
  tokenList?: Token[]
}) {
  const [assetTypeQuery, setAssetTypeQuery] = useState<Currency | undefined>(undefined)
  const [optionIdQuery, setOptionIdQuery] = useState('')
  const [rangeQuery, setRangeQuery] = useState<Range>({
    floor: undefined,
    cap: undefined
  })
  const [currencySearchOpen, setCurrencySearchOpen] = useState(false)
  const handleDismissSearch = useCallback(() => setCurrencySearchOpen(false), [])
  const handleOpenAssetSearch = useCallback(() => setCurrencySearchOpen(true), [])
  const handleSearch = useCallback(() => {
    const body = {} as SearchQuery
    if (optionIdQuery) {
      body.id = +optionIdQuery
    }
    if (rangeQuery.floor !== undefined) {
      body.priceFloor = JSBI.multiply(
        JSBI.BigInt(rangeQuery.floor),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(6))
      ).toString()
    }
    if (rangeQuery.cap !== undefined) {
      body.priceCap = JSBI.multiply(
        JSBI.BigInt(rangeQuery.cap),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(6))
      ).toString()
    }
    if (assetTypeQuery) {
      body.underlying = currencyId(assetTypeQuery)
    }
    onSearch(body)
  }, [assetTypeQuery, onSearch, optionIdQuery, rangeQuery.cap, rangeQuery.floor])
  const handleClear = useCallback(() => {
    onClear && onClear()
    setAssetTypeQuery(undefined)
    setOptionIdQuery('')
    setRangeQuery({
      floor: undefined,
      cap: undefined
    })
  }, [onClear])

  const theme = useTheme()

  return (
    <>
      <CurrencySearchModal
        isOpen={currencySearchOpen}
        onDismiss={handleDismissSearch}
        onCurrencySelect={setAssetTypeQuery}
        tokenList={tokenList}
      />
      <WrapperSearch>
        <StyledSearch>
          <ButtonSelect onClick={handleOpenAssetSearch}>
            <TYPE.body color={assetTypeQuery ? theme.text1 : theme.text3}>
              <RowFixed>
                {assetTypeQuery && assetTypeQuery.symbol !== ALL.title && (
                  <CurrencyLogo currency={assetTypeQuery} size={'24px'} style={{ marginRight: 15 }} />
                )}
                {currencyNameHelper(assetTypeQuery, 'Select asset type')}
              </RowFixed>
            </TYPE.body>
          </ButtonSelect>
          {onOptionType && (
            <ButtonSelect
              placeholder="Select option type"
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
            rangeCap={rangeQuery.cap?.toString()}
            rangeFloor={rangeQuery.floor?.toString()}
            onSetRange={setRangeQuery}
          />
          <ButtonSelectNumericalInput
            placeholder="Select option ID"
            value={optionIdQuery}
            onSetValue={setOptionIdQuery}
          />
          <ButtonWrapper>
            <ButtonOutlinedPrimary width="186px" onClick={handleSearch}>
              <SearchIcon style={{ marginRight: 10 }} />
              Search
            </ButtonOutlinedPrimary>
            <div style={{ width: 10 }} />
            <ButtonPrimary width="186px" onClick={handleClear}>
              Show All
            </ButtonPrimary>
          </ButtonWrapper>
        </StyledSearch>
      </WrapperSearch>
    </>
  )
}

export function AlternativeDisplay({
  optionList,
  filteredList
}: {
  optionList: OptionInterface[] | undefined
  filteredList: OptionInterface[] | undefined
}) {
  return (
    <AutoColumn justify="center" style={{ marginTop: 100 }}>
      {optionList && optionList.length > 0 && filteredList && filteredList.length === 0 && (
        <AutoColumn justify="center" gap="20px">
          <XCircle size={40} strokeWidth={1} />
          <TYPE.body>No results found</TYPE.body>
          <TYPE.body>Please change your search query and try again</TYPE.body>
        </AutoColumn>
      )}
      {filteredList === undefined && (
        <AnimatedWrapper>
          <AnimatedImg>
            <img src={Loader} alt="loading-icon" />
          </AnimatedImg>
        </AnimatedWrapper>
      )}
    </AutoColumn>
  )
}
