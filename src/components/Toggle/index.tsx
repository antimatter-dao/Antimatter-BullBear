import React from 'react'
import styled from 'styled-components'

const ToggleElement = styled.span<{ isActive?: boolean; isOnSwitch?: boolean }>`
  width: 50%;
  height: 3rem;
  line-height: 48px;
  border-radius: 14px;
  background: ${({ theme, isActive }) => (isActive ? theme.primary1 : 'none')};
  color: ${({ theme, isActive }) => (isActive ? theme.black : theme.white)};
  font-size: 1rem;
  font-weight: 400;

  padding: 0 0.6rem;
  font-weight: ${({ isOnSwitch }) => (isOnSwitch ? '500' : '400')};
  :hover {
    user-select: ${({ isOnSwitch }) => (isOnSwitch ? 'none' : 'initial')};
    background: ${({ theme, isActive }) => (isActive ? theme.primary4 : 'none')};
    color: ${({ theme, isActive, isOnSwitch }) => (isActive ? (isOnSwitch ? theme.white : theme.text2) : theme.text3)};
  }
`

const StyledToggle = styled.button<{ isActive?: boolean; activeElement?: boolean }>`
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.text1}
  background: ${({ theme }) => theme.bg1};
  display: flex;
  width: 100%;
  max-width: 178px
  cursor: pointer;
  outline: none;
  padding: 0;
`

export interface ToggleProps {
  id?: string
  isActive: boolean
  toggle: () => void
}

export default function Toggle({ id, isActive, toggle }: ToggleProps) {
  return (
    <StyledToggle id={id} isActive={isActive} onClick={toggle}>
      <ToggleElement isActive={isActive} isOnSwitch={true}>
        On
      </ToggleElement>
      <ToggleElement isActive={!isActive} isOnSwitch={false}>
        Off
      </ToggleElement>
    </StyledToggle>
  )
}
