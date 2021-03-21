import React from 'react'
import styled, { css } from 'styled-components'
import { ReactComponent as Arrow } from '../../assets/svg/arrow_down.svg'

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
width: ${({ size }) => size + 'px' ?? '20px'}
fill: ${({ theme, color }) => color ?? theme.text2}
`

export function ArrowDown({ size, onClick, color }: { size?: string; onClick?: () => void; color?: string }) {
  return (
    <Wrapper onClick={onClick} clickable={!!onClick}>
      <StyledArrow size={size} color={color} />
    </Wrapper>
  )
}
