import React from 'react'
import styled from 'styled-components'
import { StyledInput } from 'components/NumericalInput'
import { AutoRow } from 'components/Row'
import { TYPE } from 'theme'
import useTheme from 'hooks/useTheme'

const CustomInput = styled(StyledInput)<{ disabled?: boolean }>`
  width: 100%;
  font-size: 16px;
  color: ${({ theme, disabled }) => (disabled ? theme.bg5 : theme.white)};
  align-items: center;
  padding: 0 0.5rem 0 1rem;
  width: 100%;
  background-color: ${({ theme, disabled }) => (disabled ? 'rgba(255, 255, 255, 0.08)' : theme.bg2)};
  border-radius: 14px;
  height: 3rem;
`

export const CustomTextArea = styled.textarea<{ error?: boolean; fontSize?: string; align?: string }>`
  color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  width: 100%
  position: relative;
  font-size: 16px;
  outline: none;
  border: none;
  padding: .5rem 1rem;
  border-radius: 14px;
  background-color: ${({ theme, disabled }) => (disabled ? 'rgba(255, 255, 255, 0.08)' : theme.bg2)};
  text-align: ${({ align }) => align && align};
  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }
  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
  resize: none;
`

const Container = styled.div``

const LabelRow = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.text3};
  }
  margin-bottom: 4px;
  ${({ theme }) => theme.flexRowNoWrap}
`

export const TextInput = React.memo(function InnerInput({
  placeholder,
  label,
  textarea,
  disabled,
  name,
  ...rest
}: {
  label?: string
  error?: boolean
  fontSize?: string
  align?: 'right' | 'left'
  textarea?: boolean
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  const theme = useTheme()

  return (
    <Container>
      <LabelRow>
        <AutoRow justify="space-between">
          {label && (
            <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
              {label}
            </TYPE.body>
          )}
        </AutoRow>
      </LabelRow>
      {textarea ? (
        <CustomTextArea
          placeholder={placeholder || 'text input'}
          spellCheck="true"
          maxLength={200}
          rows={4}
          cols={50}
          disabled={disabled}
          name={name}
        />
      ) : (
        <CustomInput
          {...rest}
          name={name}
          type="text"
          placeholder={placeholder || 'text input'}
          spellCheck="true"
          disabled={disabled}
        />
      )}
    </Container>
  )
})

export default TextInput
