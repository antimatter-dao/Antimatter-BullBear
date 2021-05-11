import { Currency, Pair } from '@uniswap/sdk'
import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { AutoRow } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'

import { useActiveWeb3React } from '../../hooks'
import { useTranslation } from 'react-i18next'
import useTheme from '../../hooks/useTheme'

const InputRow = styled.div<{ selected: boolean; halfWidth?: boolean; hideSelect?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: ${({ selected }) => (selected ? '0 0.5rem 0 1rem' : '0 0.65rem 0 0.75rem')};
  width: ${({ halfWidth, hideSelect }) => (hideSelect ? '100%' : halfWidth ? '48%' : '55%')}};
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 14px;
  height: 3rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
`};
`

const CurrencySelect = styled.button<{ selected: boolean; halfWidth?: boolean }>`
  align-items: center;
  width: ${({ halfWidth }) => (halfWidth ? '48%' : '40%')}};
  height: 3rem;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.text3)};
  border-radius: 14px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 10px;
  border: 1px solid transparent;
  :focus,
  :active {
    border: 1px solid ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
  :hover {
    border: 1px solid ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.bg5))};
  }
  ${({ theme, selected }) => theme.mediaWidth.upToSmall`
  position: absolute;
  right: 0;
  width: 50%;
  z-index: 2;
  color:${selected ? theme.text1 : theme.primary1}
  border: 1px solid ${selected ? theme.text4 : theme.primary1}
  :hover,:focus,:active {
    border: 1px solid ${selected ? theme.text4 : theme.primary1}
  }
  `}
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

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  width: 13px;
  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
  ${({ theme, selected }) =>
    selected
      ? ''
      : theme.mediaWidth.upToExtraSmall`
  display: none
`};
`

const InputPanel = styled.div<{ hideInput?: boolean; negativeMarginTop?: string }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  z-index: 1;
  ${({ negativeMarginTop }) => `${negativeMarginTop ? 'margin-top: ' + negativeMarginTop : ''}`}
`

const Container = styled.div<{ hideInput: boolean }>``

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  16px;
  white-space: nowrap;
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
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  hideSelect?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
  halfWidth?: boolean
  negativeMarginTop?: string
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  hideSelect = false,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText,
  halfWidth,
  negativeMarginTop
}: CurrencyInputPanelProps) {
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <InputPanel id={id} negativeMarginTop={negativeMarginTop}>
      <Container hideInput={hideInput}>
        {!hideInput && (
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
                  {!hideBalance && !!currency && selectedCurrencyBalance
                    ? (customBalanceText ?? 'Your balance: ') + selectedCurrencyBalance?.toSignificant(6)
                    : ' -'}
                </TYPE.body>
              )}
            </AutoRow>
          </LabelRow>
        )}
        <Aligner>
          {!hideSelect && (
            <CurrencySelect
              selected={!!currency}
              className="open-currency-select-button"
              onClick={() => {
                if (!disableCurrencySelect) {
                  setModalOpen(true)
                }
              }}
              halfWidth={halfWidth}
            >
              <Aligner>
                <Aligner>
                  {pair ? (
                    <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                  ) : currency ? (
                    <CurrencyLogo currency={currency} size={'24px'} />
                  ) : null}
                  {pair ? (
                    <StyledTokenName className="pair-name-container">
                      {pair?.token0.symbol}:{pair?.token1.symbol}
                    </StyledTokenName>
                  ) : (
                    <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
                      {(currency && currency.symbol && currency.symbol.length > 20
                        ? currency.symbol.slice(0, 4) +
                          '...' +
                          currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                        : currency?.symbol) || t('selectToken')}
                    </StyledTokenName>
                  )}
                </Aligner>
                {!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
              </Aligner>
            </CurrencySelect>
          )}
          <InputRow
            style={hideInput ? { padding: '0', borderRadius: '8px' } : {}}
            halfWidth={halfWidth}
            selected={disableCurrencySelect}
            hideSelect={hideSelect}
          >
            {!hideInput && (
              <>
                <CustomNumericalInput
                  className="token-amount-input"
                  value={value}
                  onUserInput={val => {
                    onUserInput(val)
                  }}
                />
                {account && currency && showMaxButton && label !== 'To' && (
                  <StyledBalanceMax onClick={onMax}>Max</StyledBalanceMax>
                )}
              </>
            )}
          </InputRow>
        </Aligner>
      </Container>
      {!disableCurrencySelect && onCurrencySelect && (
        <CurrencySearchModal
          isOpen={modalOpen}
          onDismiss={handleDismissSearch}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={currency}
          otherSelectedCurrency={otherCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </InputPanel>
  )
}
