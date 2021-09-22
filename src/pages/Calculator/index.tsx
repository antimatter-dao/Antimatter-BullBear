import React, { useEffect, useState } from 'react'
import { ETHER } from '@uniswap/sdk'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import AppBody, { BodyHeader } from 'pages/AppBody'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { RowBetween } from 'components/Row'
import NumberInputPanel from 'components/NumberInputPanel'
import { useCalculatorCallback } from 'hooks/useCalculatorCallback'
import { tryFormatAmount } from 'state/swap/hooks'

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
  const [price, setPrice] = useState('1')
  const [priceFloor, setPriceFloor] = useState('1')
  const [priceCap, setPriceCap] = useState('1')
  const [totalCall, setTotalCall] = useState('1')
  const [totalPut, setTotalPut] = useState('1')
  const [priceCall, setPriceCall] = useState('')
  const [pricePut, setPricePut] = useState('')
  const { callback: calculateCallback } = useCalculatorCallback()

  useEffect(() => {
    if (!calculateCallback) return
    debounce(() => {
      const res = calculateCallback(price, priceFloor, priceCap, totalCall, totalPut)
      res.then(res => {
        res.priceCall && setPriceCall(tryFormatAmount(res.priceCall, ETHER)?.toFixed(6) ?? '')
        res.pricePut && setPricePut(tryFormatAmount(res.pricePut, ETHER)?.toFixed(6) ?? '')
      })
    }, 500)()
  }, [calculateCallback, price, priceCap, priceFloor, totalCall, totalPut])

  return (
    <AppBody maxWidth="560px" style={{marginTop: 24}}>
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
          <NumberInputPanel
            label="Underlying Currency Price"
            onUserInput={price => setPrice(price)}
            value={price}
            showMaxButton={false}
            id="price"
            unit="USDT"
            hideBalance
          />
          <InputWrapper>
            <NumberInputPanel
              label="Price Ceiling"
              onUserInput={priceCap => setPriceCap(priceCap)}
              value={priceCap}
              showMaxButton={false}
              id="priceCeiling"
              unit="USDT"
              hideBalance
            />
            <NumberInputPanel
              label="Price Floor"
              onUserInput={priceFloor => setPriceFloor(priceFloor)}
              value={priceFloor}
              showMaxButton={false}
              id="pricefloor"
              unit="USDT"
              hideBalance
            />
          </InputWrapper>
          <InputWrapper>
            <NumberInputPanel
              label="Call Issuance"
              onUserInput={totalCall => setTotalCall(totalCall)}
              value={totalCall}
              showMaxButton={false}
              id="callIssuance"
              unit="Shares"
              hideBalance
            />
            <NumberInputPanel
              label="Put Issuance"
              onUserInput={totalPut => setTotalPut(totalPut)}
              value={totalPut}
              showMaxButton={false}
              id="putIssuance"
              unit="Shares"
              hideBalance
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
              value={priceCall}
              showMaxButton={false}
              id="callPrice"
              unit="USDT"
              hideBalance
              disabled
            />
            <NumberInputPanel
              label="Price of Put token"
              onUserInput={() => {}}
              value={pricePut}
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
