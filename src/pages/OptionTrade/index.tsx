import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Token } from '@uniswap/sdk'
import ButtonSelect from 'components/Button/ButtonSelect'
import AppBody from 'pages/AppBody'
import { ButtonOutlinedPrimary, ButtonPrimary } from 'components/Button'
import { TYPE } from 'theme'
import { AutoRow, RowBetween } from 'components/Row'
import { OptionIcon } from 'components/Icons'
import { ReactComponent as ETH } from '../../assets/svg/eth_logo.svg'
import { AutoColumn } from 'components/Column'
import { shortenAddress } from 'utils'
import { OptionTypeData, useAllOptionTypes } from 'state/market/hooks'
import { parseBalance } from 'utils/marketStrategyUtils'
import { ZERO_ADDRESS } from '../../constants'

interface Option {
  title: string
  address: string
  icon: JSX.Element
  type: Type
  details: {
    'Option Price Range': string | undefined
    'Underlying Asset': string | undefined
    'Total Current Issuance': string | undefined
    'Market Price': string | undefined
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

const parseRange = (priceFloor: string, priceCap: string, decimals: string) => {
  return `$${parseBalance({
    val: priceFloor,
    token: new Token(1, ZERO_ADDRESS, Number(decimals ?? '18'))
  })} ~ $${parseBalance({
    val: priceCap,
    token: new Token(1, ZERO_ADDRESS, Number(decimals ?? '18'))
  })}`
}

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
    const range = parseRange(priceFloor, priceCap, currencyDecimals)
    return [
      ...acc,
      {
        title: underlyingSymbol + ' Call Option',
        address: callAddress,
        icon: <ETH />,
        type: Type.CALL,
        details: {
          'Option Price Range': range,
          'Underlying Asset': underlyingSymbol + ', USDT',
          'Total Current Issuance': callTotal.toString(),
          'Market Price': '$2100'
        }
      },
      {
        title: underlyingSymbol + ' Put Option',
        address: putAddress,
        icon: <ETH />,
        type: Type.PUT,
        details: {
          'Option Price Range': range,
          'Underlying Asset': underlyingSymbol + ', USDT',
          'Total Current Issuance': putTotal.toString(),
          'Market Price': '$2100'
        }
      }
    ]
  }, [] as Option[])
}

export default function OptionTrade() {
  const [optionList, setOptionList] = useState<Option[] | undefined>(undefined)
  const [filteredList, setFilteredList] = useState<Option[] | undefined>(undefined)
  const AllOptionType = useAllOptionTypes()
  useEffect(() => {
    if (!AllOptionType || AllOptionType?.length === 0) return
    const list = getOptionList(AllOptionType)
    setOptionList(list)
  }, [setOptionList, AllOptionType])

  useEffect(() => {
    setFilteredList(optionList)
  }, [optionList, setFilteredList])
  return (
    <Wrapper id="optionTrade">
      <Search>
        <ButtonSelect placeholder="Select asset type" width="320px" />
        <ButtonSelect placeholder="Select option type" width="320px" />
        <ButtonSelect placeholder="Select price range" width="320px" />
        <ButtonOutlinedPrimary>Search</ButtonOutlinedPrimary>
      </Search>
      {filteredList && (
        <ContentWrapper>
          {filteredList.map(option => (
            <OptionCard option={option} key={option.title} />
          ))}
        </ContentWrapper>
      )}
    </Wrapper>
  )
}

function OptionCard({ option: { title, icon, type, address, details } }: { option: Option }) {
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
        <ButtonPrimary>Trade</ButtonPrimary>
      </AutoColumn>
    </AppBody>
  )
}
