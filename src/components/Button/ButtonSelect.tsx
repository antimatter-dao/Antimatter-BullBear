import React, { useMemo, useRef, useState, useCallback } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { ButtonProps } from 'rebass/styled-components'
import { ButtonOutlined, Base } from '.'
import { RowBetween, AutoRow } from '../Row'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { TYPE } from '../../theme'
import useTheme from '../../hooks/useTheme'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { Dots } from '../swap/styleds'

export const StyledDropDown = styled(DropDown)`
  margin: 0 0.25rem 0 0;
  width: 13px;

  path {
    stroke: ${({ theme }) => theme.text1};
    stroke-width: 1.5px;
  }
`

export const ButtonSelectStyle = styled(ButtonOutlined)<{ selected?: boolean; width?: string }>`
  width: ${({ width }) => (width ? width : '100%')};
  height: 3rem;
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.text3)};
  border-radius: 14px;
  border: unset;
  padding: 0 10px 0 15px;
  border: 1px solid transparent;

  :focus,
  :active {
    border: 1px solid ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
  :hover {
    border: 1px solid ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.bg5))};
  }
  &:disabled {
    :hover {
      border-color: transparent;
    }
    opacity: 100%;
    cursor: auto;
    color: ${({ theme }) => theme.text3};
  }
`
const OptionWrapper = styled.div<{ isOpen: boolean; width?: string }>`
  position: absolute;
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  flex-direction: column;
  width: ${({ width }) => width ?? '100%'};
  border-radius: 14px;
  overflow: hidden;
  z-index: 2;
  margin-top: 4px;
  background-color: ${({ theme }) => theme.bg2};
  & button:last-child {
    border: none;
  }
`
const SelectOption = styled(Base)<{ selected: boolean }>`
  border: none;
  border-radius: unset;
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
  color: ${({ theme }) => theme.text1};
  padding: 14px;
  background-color: ${({ selected, theme }) => (selected ? theme.bg3 : 'transparent')};
  :hover,
  :focus,
  :active {
    background-color: ${({ theme }) => theme.bg3};
  }
  justify-content: flex-start;
`

export default function ButtonSelect({
  children,
  label,
  options,
  onSelection,
  selectedId,
  onClick,
  width = '100%',
  disabled,
  placeholder = 'Select Option Type',
  marginRight = '20px'
}: ButtonProps & {
  disabled?: boolean
  label?: string
  onSelection?: (id: string) => void
  options?: { id: string; option: string | JSX.Element }[]
  selectedId?: string
  onClick?: () => void
  placeholder?: string
  width?: string
  marginRight?: string
}) {
  const node = useRef<HTMLDivElement>()
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  useOnClickOutside(node, () => setIsOpen(false))
  const buttonContent = useMemo(() => {
    if (options) {
      if (options.length > 0) {
        setIsLoading(false)
        const selected = options.find(({ id }) => id === selectedId)
        return selected ? selected.option : placeholder
      }
      return placeholder
    }
    return children
  }, [options, children, setIsLoading, selectedId, placeholder])
  const handleClick = useCallback(() => {
    setIsOpen(!isOpen)
    onClick && onClick()
  }, [isOpen, onClick])
  return (
    <div style={{ position: 'relative', marginRight: marginRight, width: width, flex: 1 }}>
      {label && (
        <AutoRow style={{ marginBottom: '4px' }}>
          <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
            {label}
          </TYPE.body>
        </AutoRow>
      )}
      <ButtonSelectStyle onClick={handleClick} selected={!!selectedId} disabled={disabled}>
        <RowBetween>
          <div style={{ display: 'flex', alignItems: 'center' }}>{buttonContent}</div>
          {!disabled && <StyledDropDown />}
        </RowBetween>
      </ButtonSelectStyle>
      {isLoading && options && onSelection && (
        <OptionWrapper isOpen={isOpen} ref={node as any}>
          <SelectOption selected={false}>
            <Dots>Loading</Dots>
          </SelectOption>
        </OptionWrapper>
      )}
      {!isLoading && options && onSelection && (
        <OptionWrapper isOpen={isOpen} ref={node as any}>
          {options.map(({ id, option }) => {
            return (
              <SelectOption
                key={id}
                selected={selectedId === id}
                onClick={() => {
                  onSelection(id)
                  setIsOpen(false)
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 500 }}>{option}</div>
              </SelectOption>
            )
          })}
        </OptionWrapper>
      )}
    </div>
  )
}
