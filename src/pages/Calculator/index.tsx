import React from 'react'
import styled from 'styled-components'

import AppBody, { BodyHeader } from 'pages/AppBody'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { RowBetween } from 'components/Row'
import NumberInputPanel from 'components/NumberInputPanel'

const InputWrapper = styled(RowBetween)`
  & > div {
    width: 46%;
  }
`

export const Divider = styled.div`
  width: calc(100% + 48px);
  height: 0;
  margin-left: -24px;
  border-bottom: 1px solid ${({ theme }) => theme.bg4};
`

export default function Calculator() {
  return (
    <AppBody maxWidth="560px">
      <AutoColumn gap="20px">
        <AutoColumn gap="8px">
          <BodyHeader title="Option Calculator" />
          <TYPE.body fontSize={14}>
            The calculator is configured with Antimatter option equation and allows you to estimate call and put token
            prices in various options. You can use it as the referral for the potential arbitrage opportunity.
          </TYPE.body>
        </AutoColumn>
        <Divider />
        <AutoColumn gap="14px">
          <TYPE.smallHeader>Input</TYPE.smallHeader>
          <InputWrapper>
            <NumberInputPanel
              label="Price Ceiling"
              onUserInput={() => {}}
              value={''}
              showMaxButton={false}
              id="priceCeiling"
              unit="USDT"
              hideBalance
              disabled
            />
            <NumberInputPanel
              label="Price Floor"
              onUserInput={() => {}}
              value={''}
              showMaxButton={false}
              id="pricefloor"
              unit="USDT"
              hideBalance
              disabled
            />
          </InputWrapper>
          <InputWrapper>
            <NumberInputPanel
              label="Call Issuance"
              onUserInput={() => {}}
              value={''}
              showMaxButton={false}
              id="callIssuance"
              unit="Shares"
              hideBalance
              disabled
            />
            <NumberInputPanel
              label="Price Issuance"
              onUserInput={() => {}}
              value={''}
              showMaxButton={false}
              id="priceIssuance"
              unit="Shares"
              hideBalance
              disabled
            />
          </InputWrapper>
        </AutoColumn>
        <Divider />
        <AutoColumn gap="16px">
          <TYPE.smallHeader>Output</TYPE.smallHeader>
          <InputWrapper>
            <NumberInputPanel
              label="Price of Call token"
              onUserInput={() => {}}
              value={''}
              showMaxButton={false}
              id="callPrice"
              unit="USDT"
              hideBalance
              disabled
            />
            <NumberInputPanel
              label="Price of Put token"
              onUserInput={() => {}}
              value={''}
              showMaxButton={false}
              id="putPrice"
              unit="USDT"
              hideBalance
              disabled
            />
          </InputWrapper>
        </AutoColumn>
      </AutoColumn>
    </AppBody>
  )
}
