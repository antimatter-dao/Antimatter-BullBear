import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { AutoRow } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'

import { useActiveWeb3React } from '../../hooks'
import useTheme from '../../hooks/useTheme'

const InputRow = styled.div<{ disabled?: boolean }>`
  align-items: center;
  padding: 0 0.5rem 0 1rem;
  width: 100%;
  background-color: ${({ theme, disabled }) => (disabled ? darken(0.2, theme.black) : theme.bg2)};
  border-radius: 14px;
  height: 3rem;
  ${({ theme }) => theme.flexRowNoWrap}
`

const CustomNumericalInput = styled(NumericalInput)<{ disabled?: boolean }>`
  font-size: 16px;
  background-color: transparent;
  color: ${({ theme, disabled }) => (disabled ? darken(0.6, theme.white) : theme.white)};
`

const LabelRow = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
  margin-bottom: 4px;
  ${({ theme }) => theme.flexRowNoWrap}
`

const InputPanel = styled.div<{ negativeMarginTop?: string }>`
  position: relative;
  border-radius: 14px;
  z-index: 1;
  ${({ theme }) => theme.flexColumnNoWrap}
  ${({ negativeMarginTop }) => `${negativeMarginTop ? 'margin-top: ' + negativeMarginTop : ''}`}
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

const Container = styled.div``

interface NumberInputPanelProps {
  disabled?: boolean
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  hideBalance?: boolean
  hideLabel?: boolean
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
  negativeMarginTop?: string
  intOnly?: boolean
}

export default function NumberInputPanel({
  disabled = false,
  value,
  onMax,
  label = 'Input',
  hideBalance = false,
  hideLabel = false,
  showMaxButton,
  id,
  customBalanceText,
  negativeMarginTop,
  onUserInput,
  intOnly
}: NumberInputPanelProps) {
  const { account } = useActiveWeb3React()
  const theme = useTheme()

  return (
    <InputPanel id={id} negativeMarginTop={negativeMarginTop}>
      <Container>
        <LabelRow>
          <AutoRow justify="space-between">
            {!hideLabel && (
              <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
                {label}
              </TYPE.body>
            )}
            {account && (
              <TYPE.body
                onClick={onMax}
                color={theme.text3}
                fontWeight={500}
                fontSize={14}
                style={{ display: 'inline', cursor: 'pointer' }}
              >
                {!hideBalance ? (customBalanceText ?? 'Your balance: ') + '' : ''}
              </TYPE.body>
            )}
          </AutoRow>
        </LabelRow>
        <InputRow disabled={disabled}>
          <CustomNumericalInput
            placeholder={intOnly ? '0' : undefined}
            disabled={disabled}
            className="token-amount-input"
            value={value}
            onUserInput={val => {
              onUserInput(val)
            }}
          />
          {account && showMaxButton && <StyledBalanceMax onClick={onMax}>Max</StyledBalanceMax>}
        </InputRow>
      </Container>
    </InputPanel>
  )
}
