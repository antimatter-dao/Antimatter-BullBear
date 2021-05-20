import React from 'react'
import styled from 'styled-components'
import { ButtonOutlined } from 'components/Button'

const Wrapper = styled(ButtonOutlined)<{ isActive?: boolean; activeElement?: boolean }>`
  background: transparent
  border-color:${({ theme, isActive }) => isActive && theme.primary1};
  display: flex;
  width: 80px;
  cursor: pointer;
  padding: 0.4rem 0.5rem;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  :hover{
    box-shadow: unset
    border-color: ${({ theme }) => theme.primary1};
    opacity: .8
  }
`

const ToggleElement = styled.span<{ isActive?: boolean; bgColor?: string }>`
  border-radius: 50%;
  height: 15px;
  width: 15px;
  background-color: ${({ isActive, bgColor, theme }) => (isActive ? theme.primary1 : theme.bg5)};
  :hover {
    opacity: 0.8;
  }
`

const StatusText = styled.div<{ isActive?: boolean }>`
  margin: 0 10px;
  width: 24px;
  font-weight: 500;
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
      {isActive && <StatusText isActive={true}>ON</StatusText>}
      <ToggleElement isActive={isActive} bgColor={bgColor} />
      {!isActive && <StatusText isActive={false}>OFF</StatusText>}
    </Wrapper>
  )
}
