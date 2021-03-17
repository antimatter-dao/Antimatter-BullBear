import React from 'react'
import styled from 'styled-components'
import { TYPE } from '../../theme'

const Wrapper = styled.button<{ isActive?: boolean; activeElement?: boolean }>`
  border-radius: 20px;
  background: transparent
  border: 1px solid ${({ theme, isActive }) => (isActive ? theme.primary1 : theme.text2)};
  display: flex;
  width: 80px;
  cursor: pointer;
  outline: none;
  padding: 0.4rem 0.5rem;
  align-items: center;
  justify-content: space-between
`

const ToggleElement = styled.span<{ isActive?: boolean; bgColor?: string }>`
  border-radius: 50%;
  height: 20px;
  width: 20px;
  background-color: ${({ isActive, bgColor, theme }) => (isActive ? theme.primary1 : theme.bg4)};
  :hover {
    opacity: 0.8;
  }
`

const StatusText = styled(TYPE.main)<{ isActive?: boolean }>`
  margin: 0 10px;
  width: 24px;
  color: ${({ theme, isActive }) => (isActive ? theme.primary1 : theme.text3)};
`

export interface ToggleProps {
  id?: string
  isActive: boolean
  bgColor: string
  toggle: () => void
}

export default function ListToggle({ id, isActive, bgColor, toggle }: ToggleProps) {
  return (
    <Wrapper id={id} isActive={isActive} onClick={toggle}>
      {isActive && (
        <StatusText fontWeight="600" margin="0 6px" isActive={true}>
          ON
        </StatusText>
      )}
      <ToggleElement isActive={isActive} bgColor={bgColor} />
      {!isActive && (
        <StatusText fontWeight="600" margin="0 6px" isActive={false}>
          OFF
        </StatusText>
      )}
    </Wrapper>
  )
}
