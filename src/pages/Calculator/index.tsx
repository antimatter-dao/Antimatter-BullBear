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
import useTheme from 'hooks/useTheme'
import Card from 'components/Card'

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

enum ERROR {
  EMPTY_PRICE = 'Price cannot be empty or 0',
  EMPTY_PRICE_CAP = 'Price ceiling cannot be empty or 0',
  EMPTY_PRICE_FLOOR = 'Price floor cannot be empty or 0',
  EMPTY_TOTAL_CALL = 'Call issuance cannot be empty',
  EMPTY_TOTAL_PUT = 'Put issuance cannot be empty',
  LARGER_FLOOR_THAN_CAP = 'Price floor cannot be larger than price ceiling',
  PRICE_EXCEEDS_PRICE_RANGE = 'Price must not be smaller than price floor or larger than price ceiling'
}

const limitDigits = (string: string, currencyDecimal = 6) => {
  const dotIndex = string.indexOf('.')
  return string.slice(0, dotIndex + currencyDecimal)
}

export default function Calculator() {
  const [error, setError] = useState('')
  const [price, setPrice] = useState('')
  const [priceFloor, setPriceFloor] = useState('')
  const [priceCap, setPriceCap] = useState('')
  const [totalCall, setTotalCall] = useState('')
  const [totalPut, setTotalPut] = useState('')
  const [priceCall, setPriceCall] = useState('')
  const [pricePut, setPricePut] = useState('')
  const { callback: calculateCallback } = useCalculatorCallback()
  const theme = useTheme()

  useEffect(() => {
    if (!calculateCallback) return

    if (!price && !priceFloor && !priceCap && !totalCall && !totalPut) {
      setError('')
      return
    }
    let error = ''
    if (+price < +priceFloor || +price > +priceCap) error = ERROR.PRICE_EXCEEDS_PRICE_RANGE
    if (+priceFloor > +priceCap) error = ERROR.LARGER_FLOOR_THAN_CAP
    if (!totalPut) error = ERROR.EMPTY_TOTAL_PUT
    if (!totalCall) error = ERROR.EMPTY_TOTAL_CALL
    if (!priceFloor || +priceFloor === 0) error = ERROR.EMPTY_PRICE_FLOOR
    if (!priceCap || +priceCap === 0) error = ERROR.EMPTY_PRICE_CAP
    if (!price || +price === 0) error = ERROR.EMPTY_PRICE
    setError(error)

    if (error) return
    debounce(() => {
      const res = calculateCallback(price, priceFloor, priceCap, totalCall, totalPut)
      res.then(res => {
        if (res === null) return
        res.priceCall && setPriceCall(tryFormatAmount(res.priceCall, ETHER)?.toFixed(6) ?? '')
        res.pricePut && setPricePut(tryFormatAmount(res.pricePut, ETHER)?.toFixed(6) ?? '')
      })
    }, 500)()
  }, [calculateCallback, price, priceCap, priceFloor, totalCall, totalPut])

  return (
    <AppBody maxWidth="560px" style={{ marginTop: 24 }}>
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
            onUserInput={price => setPrice(limitDigits(price))}
            value={price}
            showMaxButton={false}
            id="price"
            unit="USDT"
            hideBalance
          />
          <InputWrapper>
            <NumberInputPanel
              label="Price Ceiling"
              onUserInput={priceCap => setPriceCap(limitDigits(priceCap))}
              value={priceCap}
              showMaxButton={false}
              id="priceCeiling"
              unit="USDT"
              hideBalance
            />
            <NumberInputPanel
              label="Price Floor"
              onUserInput={priceFloor => setPriceFloor(limitDigits(priceFloor))}
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
          <TYPE.body color={theme.red1} fontSize={14}>
            {error}
          </TYPE.body>
        </AutoColumn>
        <Divider />
        <AutoColumn gap="16px">
          <TYPE.smallHeader>Output</TYPE.smallHeader>
          <InputWrapper>
            <AutoColumn gap="4px">
              <TYPE.main color={theme.text3} fontSize={14}>
                Price of Call token
              </TYPE.main>
              <Card
                style={{
                  backgroundColor: theme.bg2,
                  width: '100%',
                  padding: '1rem',
                  height: '3rem',
                  borderRadius: '14px'
                }}
              >
                <RowBetween style={{ height: '100%' }}>
                  {priceCall ? priceCall : <span style={{ color: theme.text3 }}>0.000000</span>} <span>USDT</span>
                </RowBetween>
              </Card>
            </AutoColumn>
            <AutoColumn gap="4px">
              <TYPE.main color={theme.text3} fontSize={14}>
                Price of Put token
              </TYPE.main>
              <Card
                style={{
                  backgroundColor: theme.bg2,
                  width: '100%',
                  padding: '1rem',
                  height: '3rem',
                  borderRadius: '14px'
                }}
              >
                <RowBetween style={{ height: '100%' }}>
                  {pricePut ? pricePut : <span style={{ color: theme.text3 }}>0.000000</span>} <span>USDT</span>
                </RowBetween>
              </Card>
            </AutoColumn>
          </InputWrapper>
        </AutoColumn>
      </AutoColumn>
    </AppBody>
  )
}
