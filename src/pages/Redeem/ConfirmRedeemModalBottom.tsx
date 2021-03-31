import React from 'react'
import { Plus } from 'react-feather'
import { Currency } from '@uniswap/sdk'
import { Text } from 'rebass'
import { ButtonPrimary } from '../../components/Button'
import { RowBetween, RowFixed } from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import { Field } from '../../state/mint/actions'
import { TYPE } from '../../theme'
import { AutoColumn } from '../../components/Column'
import useTheme from '../../hooks/useTheme'
import { OutlineCard } from 'components/Card'
import { TOKEN_TYPES } from 'components/MarketStrategy/TypeRadioButton'

const currencyNameHelper = (currency?: Currency, defaultString?: string) =>
  (currency && currency.symbol && currency.symbol.length > 20
    ? currency.symbol.slice(0, 4) + '...' + currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
    : currency?.symbol) ||
  defaultString ||
  ''

export default function ConfirmAddModalBottom({
  currencies,
  onRedeem,
  callVol,
  putVol,
  burnVol,
  tokenType
}: {
  currencies: { [field in Field]?: Currency }
  onRedeem: () => void
  callVol?: string
  putVol?: string
  burnVol?: string
  tokenType?: string
}) {
  const theme = useTheme()
  const currencyA = currencies[Field.CURRENCY_A],
    currencyB = currencies[Field.CURRENCY_B]
  const onlyGain = tokenType === TOKEN_TYPES.callPut

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
                <TYPE.body>{callVol}</TYPE.body>
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
                <TYPE.body>{putVol}</TYPE.body>
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
                  <TYPE.body>{}</TYPE.body>
                </RowBetween>
              </RowFixed>
            </AutoColumn>
          </RowBetween>
          <AutoColumn></AutoColumn>
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
