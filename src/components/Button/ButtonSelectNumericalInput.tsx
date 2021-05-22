import React, { useMemo, useRef, useState, useCallback } from 'react'
import { ButtonProps } from 'rebass/styled-components'
import styled from 'styled-components'
import { ButtonOutlined } from '.'
import { RowBetween } from '../Row'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import NumberInputPanel from 'components/NumberInputPanel'
import { ButtonSelectStyle, StyledDropDown } from './ButtonSelect'
import { X } from 'react-feather'
import useTheme from 'hooks/useTheme'

const RangeInputWrapper = styled.div<{ isOpen: boolean; width?: string }>`
  display: ${({ isOpen }) => (isOpen ? ' grid' : 'none')};
  grid-template-columns: 5fr auto;
  grid-gap: 4px;
  align-items: center;
  position: absolute;
  padding: 20px;
  width: ${({ width }) => width ?? '100%'};
  border: 1px solid ${({ theme }) => theme.text5};
  border-radius: 14px;
  overflow: hidden;
  z-index: 2;
  background-color: ${({ theme }) => theme.bg1};
  margin-top: 4px;
  & > svg {
    margin-top: 15px;
  }
  & > button {
    margin-top: 15px;
    margin-left: 10px;
  }
`

export function ButtonSelectNumericalInput({
  width,
  placeholder = 'Select Price Range',
  value,
  onSetValue,
  intOnly = true
}: ButtonProps & {
  placeholder?: string
  width?: string
  value?: string
  intOnly?: boolean
  onSetValue: (val: string) => void
}) {
  const node = useRef<HTMLDivElement>()
  const [isOpen, setIsOpen] = useState(false)

  const theme = useTheme()

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  useOnClickOutside(node, handleClose)

  const buttonContent = useMemo(() => {
    if (!value) {
      return placeholder
    }
    return value
  }, [placeholder, value])

  // const handleClick = () => {
  //   onSetValue(val)
  //   handleClose()
  //   setVal('')
  // }
  const handleClick = () => {
    onSetValue('')
  }

  //const handleValInput = useCallback(val => (intOnly ? setVal(parseInt(val) + '') : setVal(val)), [intOnly])
  const handleValInput = useCallback(val => (intOnly ? onSetValue(val ? parseInt(val) + '' : '') : onSetValue(val)), [
    intOnly,
    onSetValue
  ])

  return (
    <div style={{ position: 'relative', marginRight: ' 20px', width: width, flex: 1 }}>
      <ButtonSelectStyle
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        selected={!!value}
      >
        <RowBetween>
          <div style={{ display: 'flex', alignItems: 'center' }}>{buttonContent}</div>
          <StyledDropDown />
        </RowBetween>
      </ButtonSelectStyle>

      <RangeInputWrapper isOpen={isOpen} ref={node as any} width="372px">
        <NumberInputPanel
          label="Option ID"
          value={`${value ?? ''}`}
          onUserInput={handleValInput}
          showMaxButton={false}
          id="cap"
          hideBalance={true}
          intOnly={true}
        />
        <ButtonOutlined onClick={handleClick} width="48px" style={{ height: '48px', borderRadius: 14 }}>
          <X size={60} color={theme.text3} />
        </ButtonOutlined>
      </RangeInputWrapper>
    </div>
  )
}
