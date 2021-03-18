import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { ButtonProps } from 'rebass/styled-components'
import { ButtonOutlined } from '.'
import { RowBetween, AutoRow } from '../Row'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { TYPE } from '../../theme'
import useTheme from '../../hooks/useTheme'

const StyledDropDown = styled(DropDown)`
  margin: 0 0.25rem 0 0;
  height: 35%;

  path {
    stroke: ${({ theme }) => theme.text1};
    stroke-width: 1.5px;
  }
`

const ButtonSelectStyle = styled(ButtonOutlined)<{ selected?: boolean; width?: string }>`
  width: ${({ width }) => (width ? width : '100%')};
  height: 3rem;
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.text3)};
  border-radius: 14px;
  border: none;
  padding: 0 0.3rem;
  margin-right: 20px;
  border: 1px solid transparent;
  :focus,
  :hover {
    border: 1px solid ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
`

export default function ButtonSelect({ children, label, ...rest }: ButtonProps & { label?: string }) {
  const theme = useTheme()
  return (
    <div>
      {label && (
        <AutoRow style={{ marginBottom: '4px' }}>
          <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
            {label}
          </TYPE.body>
        </AutoRow>
      )}
      <ButtonSelectStyle {...rest}>
        <RowBetween>
          <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
          <StyledDropDown />
        </RowBetween>
      </ButtonSelectStyle>
    </div>
  )
}
