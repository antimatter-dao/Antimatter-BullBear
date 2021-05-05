import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import ButtonSelect from 'components/Button/ButtonSelect'
import AppBody from 'pages/AppBody'
import { ButtonOutlinedPrimary, ButtonPrimary } from 'components/Button'
import { TYPE } from 'theme'
import { AutoRow, RowBetween } from 'components/Row'
import { OptionIcon } from 'components/Icons'
import { ReactComponent as ETH } from '../../assets/svg/eth_logo.svg'
import { AutoColumn } from 'components/Column'
import { shortenAddress } from 'utils'

interface Option {
  title: string
  address: string
  icon: JSX.Element
  optionType: OptionType
  details: {
    'Option Price Range': string
    'Underlying Asset': string
    'Total Current Issuance': string
    'Market Price': string
  }
}

export enum OptionType {
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

export default function OptionTrade() {
  const [optionList, setOptionList] = useState<Option[] | undefined>(undefined)

  useEffect(() => {
    setOptionList([
      {
        title: 'ETH Call Option',
        address: '0xc0287539b223fe8d0a0e5c4f27ead9083c756cc2',
        icon: <ETH />,
        optionType: OptionType.CALL,
        details: {
          'Option Price Range': '$1000 ~ $3000',
          'Underlying Asset': 'ETH, USDT',
          'Total Current Issuance': '1234 Shares',
          'Market Price': ' $2100'
        }
      },
      {
        title: 'ETH Put Option',
        address: '0xc0287539b223fe8d0a0e5c4f27ead9083c756cc2',
        icon: <ETH />,
        optionType: OptionType.PUT,
        details: {
          'Option Price Range': '$1000 ~ $3000',
          'Underlying Asset': 'ETH, USDT',
          'Total Current Issuance': '1234 Shares',
          'Market Price': ' $2100'
        }
      }
    ])
  }, [setOptionList])
  return (
    <Wrapper id="optionTrade">
      <Search>
        <ButtonSelect placeholder="Select asset type" width="320px" />
        <ButtonSelect placeholder="Select option type" width="320px" />
        <ButtonSelect placeholder="Select price range" width="320px" />
        <ButtonOutlinedPrimary>Search</ButtonOutlinedPrimary>
      </Search>
      {optionList && (
        <ContentWrapper>
          {optionList.map(option => (
            <OptionCard option={option} key={option.title} />
          ))}
        </ContentWrapper>
      )}
    </Wrapper>
  )
}

function OptionCard({ option: { title, icon, optionType, address, details } }: { option: Option }) {
  return (
    <AppBody>
      <AutoColumn gap="20px">
        <AutoRow>
          <Circle>
            <OptionIcon tokenIcon={icon} optionType={optionType} size="28px" />
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
