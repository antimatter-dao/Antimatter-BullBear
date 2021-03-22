import React from 'react'
import styled, { css } from 'styled-components'
import { ReactComponent as Arrow } from '../../assets/svg/arrow_down.svg'
import { ReactComponent as Cross } from '../../assets/svg/arrow_down.svg'

export const Wrapper = styled.div<{ clickable: boolean }>`
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
`

const StyledArrow = styled(Arrow)<{ size?: string; color?: string }>`
  fill: ${({ theme, color }) => color ?? theme.text2};
`

const StyledCross = styled(Cross)<{ size?: string; color?: string }>`
  fill: ${({ theme, color }) => color ?? theme.text2};
`

export function ArrowDown({ size, onClick, color }: { size?: string; onClick?: () => void; color?: string }) {
  return (
    <Wrapper onClick={onClick} clickable={!!onClick} style={{ height: size ? size : '20px' }}>
      <StyledArrow size={size} color={color} />
    </Wrapper>
  )
}
export function Plus({ size, onClick, color }: { size?: string; onClick?: () => void; color?: string }) {
  return (
    <Wrapper onClick={onClick} clickable={!!onClick} style={{ height: size ? size : '20px' }}>
      <StyledCross size={size} color={color} />
    </Wrapper>
  )
}
