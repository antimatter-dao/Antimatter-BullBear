import React, { useMemo } from 'react'
import { Plus } from 'react-feather'
import { Currency } from '@uniswap/sdk'
import { Text } from 'rebass'
import { ButtonPrimary } from '../../components/Button'
import { RowBetween, RowFixed } from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import { TYPE } from '../../theme'
import { AutoColumn } from '../../components/Column'
import useTheme from '../../hooks/useTheme'
import { OutlineCard } from 'components/Card'
import { TOKEN_TYPES } from 'components/MarketStrategy/TypeRadioButton'

const currencyNameHelper = (currency?: Currency | null, defaultString?: string) =>
  (currency && currency.symbol && currency.symbol.length > 20
    ? currency.symbol.slice(0, 4) + '...' + currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
    : currency?.symbol) ||
  defaultString ||
  ''

export default function ConfirmAddModalBottom({
  currencyA,
  currencyB,
  onRedeem,
  dUnd,
  dCur,
  burnVol,
  tokenType
}: {
  currencyA?: Currency | null
  currencyB?: Currency | null
  onRedeem: () => void
  dUnd?: string
  dCur?: string
  burnVol?: string
  tokenType?: string
}) {
  const theme = useTheme()
  const onlyGain = dCur?.[0] === '-' && dUnd?.[0] === '-'
  const currecies = useMemo(
    () =>
      dUnd && dCur && currencyA && currencyB && dUnd?.[0] === '-'
        ? { payCurency: currencyB, payVol: dCur, gainCurrency: currencyA, gainVol: dUnd }
        : { payCurency: currencyA, payVol: dUnd, gainCurrency: currencyB, gainVol: dCur } || {},
    [currencyA?.symbol, currencyB?.symbol, dCur, dUnd]
  )

  return (
    <>
      {onlyGain && (
        <OutlineCard style={{ backgroundColor: 'rgba(0,0,0,.2)', padding: '0' }}>
          <RowBetween>
            <AutoColumn style={{ width: '48%', padding: '14px' }}>
              <RowFixed>
                <TYPE.body color={theme.text3} fontWeight={500} fontSize={14} mb="4px">
                  {'Call'}
                </TYPE.body>
              </RowFixed>
              <RowBetween
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: ' 14px',
                  padding: '14px',
                  flexWrap: 'wrap'
                }}
              >
                <RowFixed>
                  {currencyA && <CurrencyLogo currency={currencyA!} style={{ marginRight: '8px' }} />}
                  <TYPE.body>{currencyNameHelper(currencyA)}</TYPE.body>
                </RowFixed>
                <TYPE.body>{dUnd}</TYPE.body>
              </RowBetween>
            </AutoColumn>

            <Plus size="20" color={theme.text2} />

            <AutoColumn style={{ width: '48%', padding: '14px' }}>
              <RowFixed>
                <TYPE.body color={theme.text3} fontWeight={500} fontSize={14} mb="4px">
                  {'Put'}
                </TYPE.body>
              </RowFixed>
              <RowBetween
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: ' 14px',
                  padding: '14px',
                  flexWrap: 'wrap'
                }}
              >
                <RowFixed>
                  {currencyB && <CurrencyLogo currency={currencyB!} style={{ marginRight: '8px' }} />}
                  <TYPE.body>{currencyNameHelper(currencyB)}</TYPE.body>
                </RowFixed>
                <TYPE.body>{dCur}</TYPE.body>
              </RowBetween>
            </AutoColumn>
          </RowBetween>
        </OutlineCard>
      )}
      {!onlyGain && (
        <AutoColumn>
          <RowBetween>
            <AutoColumn style={{ width: '48%', padding: '14px' }}>
              <RowFixed>
                <TYPE.body color={theme.text3} fontWeight={500} fontSize={14} mb="4px">
                  You will burn
                </TYPE.body>
              </RowFixed>
              <RowBetween
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: ' 14px',
                  padding: '14px',
                  flexWrap: 'wrap'
                }}
              >
                <RowFixed>
                  <TYPE.body>
                    {tokenType === TOKEN_TYPES.call && 'CALL TOKEN'}
                    {tokenType === TOKEN_TYPES.put && 'PUT TOKEN'}
                  </TYPE.body>
                </RowFixed>
                <TYPE.body>{burnVol}</TYPE.body>
              </RowBetween>
            </AutoColumn>
            <Plus size="20" color={theme.text2} />
            <AutoColumn style={{ width: '48%', padding: '14px' }}>
              <RowFixed>
                <TYPE.body color={theme.text3} fontWeight={500} fontSize={14} mb="4px">
                  You will pay
                </TYPE.body>
              </RowFixed>
              <RowBetween
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: ' 14px',
                  padding: '14px',
                  flexWrap: 'wrap'
                }}
              >
                <RowFixed>
                  {currecies.payCurency && (
                    <CurrencyLogo currency={currecies.payCurency!} style={{ marginRight: '8px' }} />
                  )}
                  <TYPE.body>{currencyNameHelper(currecies.payCurency)}</TYPE.body>
                </RowFixed>
                <TYPE.body>{currecies.payVol}</TYPE.body>
              </RowBetween>
            </AutoColumn>
          </RowBetween>
          <AutoColumn>
            <RowFixed>
              <TYPE.body color={theme.text3} fontWeight={500} fontSize={14} mb="4px">
                You will get
              </TYPE.body>
            </RowFixed>
            <RowBetween
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: ' 14px',
                padding: '14px',
                flexWrap: 'wrap'
              }}
            >
              <RowFixed>
                {currecies.gainCurrency && (
                  <CurrencyLogo currency={currecies.gainCurrency!} style={{ marginRight: '8px' }} />
                )}
                <TYPE.body>{currencyNameHelper(currecies.gainCurrency)}</TYPE.body>
              </RowFixed>
              <TYPE.body>{currecies.gainVol?.slice(1)}</TYPE.body>
            </RowBetween>
          </AutoColumn>
        </AutoColumn>
      )}
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onRedeem}>
        <Text fontWeight={500} fontSize={16}>
          Confirm
        </Text>
      </ButtonPrimary>
    </>
  )
}
