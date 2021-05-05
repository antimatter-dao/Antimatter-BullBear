import React, { useMemo, useRef, useState, useCallback } from 'react'
import { ButtonProps } from 'rebass/styled-components'
import styled from 'styled-components'
import { ButtonOutlined } from '.'
import { AutoRow, RowBetween } from '../Row'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import NumberInputPanel from 'components/NumberInputPanel'
import { ButtonSelectStyle, StyledDropDown } from './ButtonSelect'

const RangeInputWrapper = styled.div<{ isOpen: boolean; width?: string }>`
  display: ${({ isOpen }) => (isOpen ? ' grid' : 'none')};
  grid-template-columns: 2fr 1fr 2fr 48px;
  position: absolute;
  padding: 20px;
  width: ${({ width }) => width ?? '100%'};
  border: 1px solid ${({ theme }) => theme.text5};
  border-radius: 14px;
  overflow: hidden;
  z-index: 2;
  background-color: ${({ theme }) => theme.bg2};
`

export function ButtonSelectRange({
  width,
  placeholder = 'Select Price Range',
  rangeFloor,
  rangeCap,
  onSetRange
}: ButtonProps & {
  placeholder?: string
  width?: string
  rangeFloor?: string
  rangeCap?: string
  onSetRange: (range: { floor: string; cap: string }) => void
}) {
  const node = useRef<HTMLDivElement>()
  const [isOpen, setIsOpen] = useState(false)
  const [floor, setFloor] = useState('')
  const [cap, setCap] = useState('')

  const handleClose = useCallback(() => setIsOpen(false), [])

  useOnClickOutside(node, handleClose)

  const buttonContent = useMemo(() => {
    if (!rangeFloor && !rangeCap) {
      return placeholder
    }
    return `$${rangeFloor} ~ $${rangeCap}`
  }, [placeholder, rangeFloor, rangeCap])

  const handleClick = () => {
    onSetRange({ floor, cap })
    handleClose()
  }
  const handleFloorInput = useCallback(val => setFloor(val), [])
  const handleCapInput = useCallback(val => setCap(val), [])
  return (
    <div style={{ position: 'relative', marginRight: ' 20px' }}>
      <ButtonSelectStyle
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        width={width}
      >
        <RowBetween>
          <div style={{ display: 'flex', alignItems: 'center' }}>{buttonContent}</div>
          <StyledDropDown />
        </RowBetween>
      </ButtonSelectStyle>

      <RangeInputWrapper isOpen={isOpen} ref={node as any} width="372px">
        <NumberInputPanel label="From" value={floor} onUserInput={handleFloorInput} showMaxButton={false} id="floor" />
        <p>-</p>
        <NumberInputPanel label="To" value={cap} onUserInput={handleCapInput} showMaxButton={false} id="cap" />
        <AutoRow>
          <ButtonOutlined onClick={handleClick} width="48px" style={{ height: '48px', borderRadius: 14 }}>
            X
          </ButtonOutlined>
        </AutoRow>
      </RangeInputWrapper>
    </div>
  )
}
