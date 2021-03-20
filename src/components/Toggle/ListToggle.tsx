import React from 'react'
import styled from 'styled-components'
import { ButtonOutlined } from 'components/Button'
import { TYPE } from '../../theme'

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
`

const ToggleElement = styled.span<{ isActive?: boolean; bgColor?: string }>`
  border-radius: 50%;
  height: 20px;
  width: 20px;
  background-color: ${({ isActive, bgColor, theme }) => (isActive ? theme.primary1 : theme.bg5)};
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
        <StatusText margin="0 6px" isActive={true}>
          ON
        </StatusText>
      )}
      <ToggleElement isActive={isActive} bgColor={bgColor} />
      {!isActive && (
        <StatusText margin="0 6px" isActive={false}>
          OFF
        </StatusText>
      )}
    </Wrapper>
  )
}
