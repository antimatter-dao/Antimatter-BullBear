import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { Token } from '@uniswap/sdk'
import AppBody from 'pages/AppBody'
import { ButtonPrimary } from 'components/Button'
import { AnimatedImg, AnimatedWrapper, ExternalLink, TYPE } from 'theme'
import { RowBetween, RowFixed } from 'components/Row'
//import { OptionIcon } from 'components/Icons'
import { AutoColumn } from 'components/Column'
//import { USDT, ZERO_ADDRESS } from '../../constants'
import OptionTradeAction from './OptionTradeAction'
//import { useCurrency } from 'hooks/Tokens'
import CurrencyLogo from 'components/CurrencyLogo'
import Loader from 'assets/svg/antimatter_background_logo.svg'
//import { useUSDTPrice } from 'utils/useUSDCPrice'
import { XCircle } from 'react-feather'
import { useNetwork } from 'hooks/useNetwork'
import { useOptionList } from 'hooks/useOptionList'
import { useOption, useOptionTypeCount } from '../../state/market/hooks'
import { tryFormatAmount } from '../../state/swap/hooks'
import { useTotalSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from 'hooks'
import Search, { SearchQuery } from 'components/Search'
import { Axios } from 'utils/option/axios'
import { formatUnderlying } from 'utils/option/utils'
import Pagination from 'components/Pagination'
import { Skeleton } from '@material-ui/lab'

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
    'Your Bull Position'?: string | undefined
    'Your Bear Position'?: string | undefined
  }
  range: {
    floor: string | undefined
    cap: string | undefined
  }
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
  .MuiSkeleton-root{
    background-color: rgba(255, 255, 255, 0.15);
  };
  /* ${({ theme }) => theme.mediaWidth.upToLarge`padding: 30px`} */
  ${({ theme }) => theme.mediaWidth.upToSmall`padding: 20px 10px`},
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
  const { chainId } = useActiveWeb3React()
  const optionCount = useOptionTypeCount()
  const [tokenList, setTokenList] = useState<Token[] | undefined>(undefined)
  const [filteredIndexes, setFilteredIndexes] = useState<string[] | undefined>(undefined)
  const history = useHistory()
  const [searchParams, setSearchParams] = useState<SearchQuery>({})
  const { page, data: currentIds, firstLoading } = useOptionList(searchParams)

  useEffect(() => {
    setFilteredIndexes(currentIds)
  }, [currentIds])

  const setPage = useCallback((event: object, page: number) => {
    setFilteredIndexes(['', '', '', '', '', '', '', ''])
  }, [])

  const {
    httpHandlingFunctions: { errorFunction },
    NetworkErrorModal
  } = useNetwork()

  const optionTypeIndexes = useMemo(() => {
    const list = Array.from({ length: optionCount }, (v, i) => i.toString())
    return list
  }, [optionCount])

  const handleClearSearch = useCallback(() => {
    setSearchParams({})
  }, [])

  const handleSearch = useCallback((body: SearchQuery) => {
    setSearchParams(body)
  }, [])

  useEffect(() => {
    if (!chainId) return
    Axios.get('getUnderlyingList', { chainId })
      .then(r => {
        setTokenList(formatUnderlying(r.data.data, chainId))
      })
      .catch(e => {
        console.error(e)
        errorFunction()
      })
  }, [chainId, errorFunction])

  return (
    <>
      <NetworkErrorModal />
      {optionId ? (
        <OptionTradeAction optionId={optionId} />
      ) : (
        <Wrapper id="optionTrade">
          <Search
            // optionTypeQuery={optionTypeQuery}
            // onOptionType={handleSelectOptionType}
            onClear={handleClearSearch}
            onSearch={handleSearch}
            tokenList={tokenList}
          />
          {filteredIndexes && (
            <ContentWrapper>
              {filteredIndexes.map((optionId, idx) =>
                optionId ? (
                  <OptionCard
                    optionId={optionId}
                    key={optionId}
                    buttons={
                      <ButtonPrimary onClick={() => history.push(`/option_trading/${optionId}`)}>
                        Trade/More Info
                      </ButtonPrimary>
                    }
                  />
                ) : (
                  <OptionCardSkeleton key={optionId + idx} />
                )
              )}
            </ContentWrapper>
          )}
          {page.totalPages !== 0 && (
            <Pagination
              page={page.currentPage}
              count={page.totalPages}
              setPage={page.setCurrentPage}
              onChange={setPage}
            />
          )}
          <AlternativeDisplay
            loading={firstLoading}
            optionIndexes={optionTypeIndexes}
            filteredIndexes={filteredIndexes}
          />
        </Wrapper>
      )}
    </>
  )
}

export function OptionCard({ optionId, buttons }: { optionId: string; buttons: JSX.Element }) {
  const option = useOption(optionId)
  const callTotalSupply = useTotalSupply(option?.call?.token)
  const putTotalSupply = useTotalSupply(option?.put?.token)

  const range = {
    cap: tryFormatAmount(option?.priceCap, option?.currency ?? undefined),
    floor: tryFormatAmount(option?.priceFloor, option?.currency ?? undefined)
  }
  const details = {
    'Option Range': option ? `$${range.floor?.toExact().toString()}~$${range.cap?.toExact().toString()}` : '',
    'Underlying Assets': option ? `${option.underlying?.symbol}, ${option.currency?.symbol}` : '-',
    'Current Bull Issuance': option ? callTotalSupply?.toFixed(2).toString() : '-',
    'Current Bear Issuance': option ? putTotalSupply?.toFixed(2).toString() : '-'
  }

  return (
    <>
      {option ? (
        <AppBody style={{ position: 'relative', padding: '24px 20px' }} isCard>
          <AutoColumn gap="20px">
            <TitleWrapper>
              <Circle>
                <CurrencyLogo currency={option?.underlying ?? undefined} size="100%" />
              </Circle>
              <AutoColumn gap="5px" style={{ width: '100%', position: 'relative', minHeight: 51 }}>
                <TYPE.mediumHeader
                  fontSize={20}
                  style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                >
                  {`${option?.underlying?.symbol ?? '-'} Option`}
                </TYPE.mediumHeader>

                <RowFixed>
                  <OptionId>ID:&nbsp;{option?.underlying ? optionId : '-'}</OptionId>
                </RowFixed>
              </AutoColumn>
            </TitleWrapper>
            <Divider />
            <AutoColumn gap="12px">
              {Object.keys(details).map(key => (
                <RowBetween key={key}>
                  <TYPE.smallGray>{key}:</TYPE.smallGray>
                  <TYPE.main
                    style={{
                      textAlign: 'right',
                      overflow: 'hidden',
                      whiteSpace: 'pre-wrap',
                      textOverflow: 'ellipsis',
                      minHeight: 19
                    }}
                  >
                    {details[key as keyof typeof details]}
                  </TYPE.main>
                </RowBetween>
              ))}
            </AutoColumn>
            <RowBetween>{buttons}</RowBetween>
          </AutoColumn>
        </AppBody>
      ) : (
        <OptionCardSkeleton />
      )}
    </>
  )
}

function OptionCardSkeleton() {
  return (
    <AppBody isCard>
      <AutoColumn gap="20px">
        <TitleWrapper>
          <Skeleton variant="circle" height={44} width={44} animation="wave" />

          <AutoColumn gap="5px" style={{ position: 'relative', minHeight: 51, marginLeft: 16 }}>
            <Skeleton variant="rect" width={130} height={26} animation="wave" />
            <RowFixed>
              <Skeleton variant="text" width={50} height={24} animation="wave" />
            </RowFixed>
          </AutoColumn>
        </TitleWrapper>
        <Divider />
        <AutoColumn gap="12px">
          <Skeleton variant="text" width="100%" height={19} animation="wave" />
          <Skeleton variant="text" width="100%" height={19} animation="wave" />
          <Skeleton variant="text" width="50%" height={19} animation="wave" />
          <Skeleton variant="text" width="30%" height={19} animation="wave" />
        </AutoColumn>
        <Skeleton variant="rect" width="100%" height={49} animation="wave" style={{ borderRadius: 49 }} />
      </AutoColumn>
    </AppBody>
  )
}

export function AlternativeDisplay({
  optionIndexes,
  filteredIndexes,
  loading
}: {
  optionIndexes: string[] | undefined
  filteredIndexes: string[] | undefined
  loading: boolean
}) {
  return (
    <AutoColumn justify="center" style={{ marginTop: 100 }}>
      {loading ? (
        <AnimatedWrapper>
          <AnimatedImg>
            <img src={Loader} alt="loading-icon" />
          </AnimatedImg>
        </AnimatedWrapper>
      ) : (
        optionIndexes &&
        optionIndexes.length > 0 &&
        filteredIndexes &&
        filteredIndexes.length === 0 && (
          <AutoColumn justify="center" gap="20px">
            <XCircle size={40} strokeWidth={1} />
            <TYPE.body>No results found</TYPE.body>
            <TYPE.body>Please change your search query and try again</TYPE.body>
          </AutoColumn>
        )
      )}
    </AutoColumn>
  )
}
