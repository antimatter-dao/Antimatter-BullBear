import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useHistory, RouteComponentProps } from 'react-router'
import styled from 'styled-components'
import { Token } from '@uniswap/sdk'
import ButtonSelect from 'components/Button/ButtonSelect'
import AppBody from 'pages/AppBody'
import { ButtonOutlinedPrimary, ButtonPrimary } from 'components/Button'
import { TYPE } from 'theme'
import { AutoRow, RowBetween } from 'components/Row'
import { OptionIcon } from 'components/Icons'
import { ReactComponent as ETH } from '../../assets/svg/eth_logo.svg'
import { ReactComponent as SearchIcon } from '../../assets/svg/search.svg'
import { AutoColumn } from 'components/Column'
import { shortenAddress } from 'utils'
import { OptionTypeData, useAllOptionTypes } from 'state/market/hooks'
import { parseBalance } from 'utils/marketStrategyUtils'
import { USDT, ZERO_ADDRESS } from '../../constants'
import { ButtonSelectRange } from 'components/Button/ButtonSelectRange'
import OptionTradeAction from './OptionTradeAction'

export interface Option {
  title: string
  address: string
  icon: JSX.Element
  type: Type
  asset: string | undefined
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
  return allOptionType.reduce((acc: Option[], item: OptionTypeData): Option[] => {
    const {
      callAddress,
      putAddress,
      currencyDecimals,
      priceFloor,
      priceCap,
      callTotal,
      putTotal,
      underlyingSymbol
    } = item
    const floor = parsePrice(priceFloor, currencyDecimals)
    const cap = parsePrice(priceCap, currencyDecimals)
    const range = `$${floor} ~ $${cap}`
    return [
      ...acc,
      {
        title: underlyingSymbol + ' Call Option',
        address: callAddress,
        icon: <ETH />,
        type: Type.CALL,
        asset: underlyingSymbol,
        details: {
          'Option Price Range': range,
          'Underlying Asset': underlyingSymbol + ', USDT',
          'Total Current Issuance': callTotal.toString(),
          'Market Price': '$2100'
        },
        range: { floor, cap }
      },
      {
        title: underlyingSymbol + ' Put Option',
        address: putAddress,
        icon: <ETH />,
        type: Type.PUT,
        asset: underlyingSymbol,
        details: {
          'Option Price Range': range,
          'Underlying Asset': underlyingSymbol + ', USDT',
          'Total Current Issuance': putTotal.toString(),
          'Market Price': '$2100'
        },
        range: { floor, cap }
      }
    ]
  }, [] as Option[])
}

export default function OptionTrade({
  match: {
    params: { addressA }
  }
}: RouteComponentProps<{ addressA?: string }>) {
  const [optionList, setOptionList] = useState<Option[] | undefined>(undefined)
  const [filteredList, setFilteredList] = useState<Option[] | undefined>(undefined)
  const [assetTypeQuery, setAssetTypeQuery] = useState('')
  const [optionTypeQuery, setOptionTypeQuery] = useState('')
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
    if (!(assetTypeQuery === '' || assetTypeQuery === ALL.id)) {
      list = optionList?.filter(option => option.asset === assetTypeQuery)
    }
    if (!(optionTypeQuery === '' || optionTypeQuery === ALL.id)) {
      list = optionList?.filter(option => option.type === optionTypeQuery)
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

  const handleSelectAssetType = useCallback((id: string) => setAssetTypeQuery(id), [])
  const handleSelectOptionType = useCallback((id: string) => setOptionTypeQuery(id), [])
  const handleRange = useCallback(range => setRangeQuery(range), [])
  return (
    <>
      {addressA ? (
        <OptionTradeAction addressA={addressA} option={option} />
      ) : (
        <Wrapper id="optionTrade">
          <Search>
            <ButtonSelect
              placeholder="Select asset type"
              width="320px"
              options={[
                { id: ALL.id, option: ALL.title },
                { id: 'ETH', option: 'ETH' }
              ]}
              selectedId={assetTypeQuery}
              onSelection={handleSelectAssetType}
            />
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
            <ButtonOutlinedPrimary width="184px">
              <SearchIcon style={{ marginRight: 10 }} />
              Search
            </ButtonOutlinedPrimary>
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
        </Wrapper>
      )}
    </>
  )
}

function OptionCard({
  option: { title, icon, type, address, details },
  onClick
}: {
  option: Option
  onClick: () => void
}) {
  return (
    <AppBody>
      <AutoColumn gap="20px">
        <AutoRow>
          <Circle>
            <OptionIcon tokenIcon={icon} type={type} size="28px" />
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
              <TYPE.subHeader>{details[key as keyof typeof details]}</TYPE.subHeader>
            </RowBetween>
          ))}
        </AutoColumn>
        <ButtonPrimary onClick={onClick}>Trade</ButtonPrimary>
      </AutoColumn>
    </AppBody>
  )
}
