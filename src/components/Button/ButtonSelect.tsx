import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { ButtonProps, Text } from 'rebass/styled-components'
import { ButtonOutlined, Base } from '.'
import { RowBetween, AutoRow } from '../Row'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { TYPE } from '../../theme'
import useTheme from '../../hooks/useTheme'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

const StyledDropDown = styled(DropDown)`
  margin: 0 0.25rem 0 0;
  width: 13px;

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
  border: unset;
  padding: 0 0.3rem;
  margin-right: 20px;
  padding: 0 10px;
  border: 1px solid transparent;

  :focus,
  :active {
    border: 1px solid ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
  :hover {
    border: 1px solid ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.bg5))};
  }
`
const OptionWrapper = styled.div<{ isOpen: boolean }>`
  position: absolute;
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  flex-direction: column;
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  z-index: 2;
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
`

export default function ButtonSelect({
  children,

  label,
  options,
  onSelection,
  selectedId
}: ButtonProps & {
  label?: string
  onSelection?: (id: string) => void
  options?: { id: string; option: string }[]
  selectedId?: string
}) {
  const node = useRef<HTMLDivElement>()
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  useOnClickOutside(node, () => setIsOpen(false))
  return (
    <div>
      {label && (
        <AutoRow style={{ marginBottom: '4px' }}>
          <TYPE.body color={theme.text3} fontWeight={500} fontSize={14}>
            {label}
          </TYPE.body>
        </AutoRow>
      )}
      <ButtonSelectStyle
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        selected={!!selectedId}
      >
        <RowBetween>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {options ? options.find(({ id }) => id === selectedId)?.option : children}
          </div>
          <StyledDropDown />
        </RowBetween>
      </ButtonSelectStyle>
      {options && onSelection && (
        <OptionWrapper isOpen={isOpen} ref={node as any}>
          {options.map(({ id, option }) => (
            <SelectOption
              key={id}
              selected={selectedId === id}
              onClick={() => {
                onSelection(id)
                setIsOpen(false)
              }}
            >
              <Text fontSize={16} fontWeight={500}>
                {option}
              </Text>
            </SelectOption>
          ))}
        </OptionWrapper>
      )}
    </div>
  )
}
