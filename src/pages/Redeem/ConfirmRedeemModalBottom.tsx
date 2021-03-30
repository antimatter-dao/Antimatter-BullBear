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

export default function ConfirmAddModalBottom({
  currencies,
  onRedeem,
  callVol,
  putVol
}: {
  currencies: { [field in Field]?: Currency }
  onRedeem: () => void
  callVol?: string
  putVol?: string
}) {
  const theme = useTheme()

  return (
    <>
      <OutlineCard style={{ backgroundColor: 'rgba(0,0,0,.2)', padding: '0' }}>
        <RowBetween>
          <AutoColumn style={{ width: '45%', padding: '14px' }}>
            <RowFixed>
              <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
                {'Call'}
              </TYPE.body>
            </RowFixed>
            <RowBetween style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: ' 14px', padding: '14px' }}>
              {currencies[Field.CURRENCY_A] && (
                <CurrencyLogo currency={currencies[Field.CURRENCY_A]!} style={{ marginRight: '8px' }} />
              )}
              <TYPE.body>{callVol}</TYPE.body>
            </RowBetween>
          </AutoColumn>

          <Plus size="28" color={theme.text2} />

          <AutoColumn style={{ width: '45%', padding: '14px' }}>
            <RowFixed>
              <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
                {'Put'}
              </TYPE.body>
            </RowFixed>
            <RowBetween style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: ' 14px', padding: '14px' }}>
              {currencies[Field.CURRENCY_B] && (
                <CurrencyLogo currency={currencies[Field.CURRENCY_A]!} style={{ marginRight: '8px' }} />
              )}
              <TYPE.body>{putVol}</TYPE.body>
            </RowBetween>
          </AutoColumn>
        </RowBetween>
      </OutlineCard>
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onRedeem}>
        <Text fontWeight={500} fontSize={20}>
          Confirm
        </Text>
      </ButtonPrimary>
    </>
  )
}
