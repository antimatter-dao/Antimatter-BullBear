import { Currency } from '@uniswap/sdk'
import { useTranslation } from 'react-i18next'
import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import CurrencyLogo from '../CurrencyLogo'
import { AutoRow } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'

import { useActiveWeb3React } from '../../hooks'

import useTheme from '../../hooks/useTheme'

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: ${({ selected }) => (selected ? '0 0.5rem 0 1rem' : '0 0.65rem 0 0.75rem')};
  width: 48%
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 14px;
  height: 3rem;
`

const CurrencySelect = styled.div<{ selected: boolean; halfWidth?: boolean }>`
  align-items: center;
  width: ${({ halfWidth }) => (halfWidth ? '48%' : '40%')}};
  height: 3rem;
  line-height: 48px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.text3)};
  border-radius: 14px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  user-select: none;
  border: none;
  padding: 0 10px;
  border: 1px solid transparent;
`

const CustomNumericalInput = styled(NumericalInput)`
  background: transparent;
  font-size: 16px;
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
  margin-bottom: 4px;
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const InputPanel = styled.div<{ hideInput?: boolean; negativeMarginTop?: string }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  z-index: 1;
  ${({ negativeMarginTop }) => `${negativeMarginTop ? 'margin-top: ' + negativeMarginTop : ''}`}
`

const Container = styled.div``

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  16px;
`

const StyledBalanceMax = styled.button`
  height: 28px;
  background-color: ${({ theme }) => theme.bg3};
  border: 1px solid transparent;
  border-radius: 49px;
  font-size: 0.875rem;
  padding: 0 1rem;
  font-weight: 500;
  cursor: pointer;
  color: ${({ theme }) => theme.text1};
  :hover {
    border: 1px solid ${({ theme }) => theme.primary1};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  label: string
  currency?: Currency
  negativeMarginTop?: string
  currencyBalance: string
}

export default function RedeemTokenPanel({
  value,
  onUserInput,
  onMax,
  label,
  currency,
  negativeMarginTop,
  currencyBalance
}: CurrencyInputPanelProps) {
  const { t } = useTranslation()

  const { account } = useActiveWeb3React()
  const theme = useTheme()

  return (
    <InputPanel negativeMarginTop={negativeMarginTop}>
      <Container>
        <LabelRow>
          <AutoRow justify="space-between">
            <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
              {label}
            </TYPE.body>
            {account && (
              <TYPE.body
                onClick={onMax}
                color={theme.text3}
                fontWeight={500}
                fontSize={14}
                style={{ display: 'inline', cursor: 'pointer' }}
              >
                {!!currency && currencyBalance ? 'Your balance: ' + currencyBalance : ' -'}
              </TYPE.body>
            )}
          </AutoRow>
        </LabelRow>

        <Aligner>
          <CurrencySelect selected={!!currency} className="open-currency-select-button">
            <Aligner>
              <Aligner>
                {currency ? <CurrencyLogo currency={currency} size={'24px'} /> : null}
                <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                  {(currency && currency.symbol && currency.symbol.length > 20
                    ? currency.symbol.slice(0, 4) +
                      '...' +
                      currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                    : currency?.symbol) || t('selectToken')}
                </StyledTokenName>
              </Aligner>
            </Aligner>
          </CurrencySelect>
          <InputRow selected={true}>
            <CustomNumericalInput
              className="token-amount-input"
              value={value}
              onUserInput={val => {
                onUserInput(val)
              }}
            />
            {account && currency && <StyledBalanceMax onClick={onMax}>Max</StyledBalanceMax>}
          </InputRow>
        </Aligner>
      </Container>
    </InputPanel>
  )
}
