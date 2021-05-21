import React, { useMemo, useRef, useState, useCallback } from 'react'
import { ButtonProps } from 'rebass/styled-components'
import styled from 'styled-components'
import { ButtonOutlined } from '.'
import { RowBetween } from '../Row'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import NumberInputPanel from 'components/NumberInputPanel'
import { ButtonSelectStyle, StyledDropDown } from './ButtonSelect'
import { Minus, X } from 'react-feather'
import useTheme from 'hooks/useTheme'
import { Range } from 'pages/OptionTrade'

const RangeInputWrapper = styled.div<{ isOpen: boolean; width?: string }>`
  display: ${({ isOpen }) => (isOpen ? ' grid' : 'none')};
  grid-template-columns: 3fr auto 3fr auto;
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
  onSetRange: (range: any) => void
}) {
  const node = useRef<HTMLDivElement>()
  const [isOpen, setIsOpen] = useState(false)
  // const [floor, setFloor] = useState('')
  // const [cap, setCap] = useState('')

  const theme = useTheme()

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  useOnClickOutside(node, handleClose)

  const buttonContent = useMemo(() => {
    if (!rangeFloor && !rangeCap) {
      return placeholder
    }
    return `$${rangeFloor ?? ''} ~ $${rangeCap ?? ''}`
  }, [placeholder, rangeFloor, rangeCap])

  // const handleClick = () => {
  //   onSetRange({ floor, cap })
  //   handleClose()
  //   setFloor('')
  //   setCap('')
  // }
  // const handleFloorInput = useCallback(val => setFloor(val), [])
  // const handleCapInput = useCallback(val => setCap(val), [])

  const handleClick = () => {
    onSetRange({ floor: undefined, cap: undefined })
  }

  const handleFloorInput = useCallback(
    val => onSetRange((prev: Range) => ({ ...prev, floor: val ? parseInt(val) + '' : undefined })),
    [onSetRange]
  )
  const handleCapInput = useCallback(
    val => onSetRange((prev: Range) => ({ ...prev, cap: val ? parseInt(val) + '' : undefined })),
    [onSetRange]
  )
  return (
    <div style={{ position: 'relative', marginRight: ' 20px', width: width, flex: 1 }}>
      <ButtonSelectStyle
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        width="100%"
        selected={!!rangeCap || !!rangeFloor}
      >
        <RowBetween>
          <div style={{ display: 'flex', alignItems: 'center' }}>{buttonContent}</div>
          <StyledDropDown />
        </RowBetween>
      </ButtonSelectStyle>

      <RangeInputWrapper isOpen={isOpen} ref={node as any} width="372px">
        <NumberInputPanel
          intOnly
          label="Price floor($)"
          value={rangeFloor ?? ''}
          onUserInput={handleFloorInput}
          showMaxButton={false}
          id="floor"
          hideBalance={true}
        />
        <Minus size={25} color={theme.text3} />
        <NumberInputPanel
          intOnly
          label="Price ceiling($)"
          value={rangeCap ?? ''}
          onUserInput={handleCapInput}
          showMaxButton={false}
          id="cap"
          hideBalance={true}
        />

        <ButtonOutlined onClick={handleClick} width="48px" style={{ height: '48px', borderRadius: 14 }}>
          <X size={60} color={theme.text3} />
        </ButtonOutlined>
      </RangeInputWrapper>
    </div>
  )
}
