import React from 'react'
import styled, { css } from 'styled-components'
import { ReactComponent as Arrow } from '../../assets/svg/arrow_down.svg'
import { ReactComponent as Cross } from '../../assets/svg/cross.svg'
import { ReactComponent as CheckCircleIcon } from '../../assets/svg/check_circle.svg'
import { ReactComponent as CrossCircleIcon } from '../../assets/svg/cross_circle.svg'
import { ReactComponent as CallType } from '../../assets/svg/call_type.svg'
import { ReactComponent as PutType } from '../../assets/svg/put_type.svg'
import { Type } from 'pages/OptionTrade'

export const Wrapper = styled.div<{ clickable: boolean; color?: string; size?: string }>`
  ${({ clickable }) =>
    clickable
      ? css`
          :hover {
            cursor: pointer;
            opacity: 0.8;
          }
        `
      : null}
  > * {
    fill: ${({ theme, color }) => color ?? theme.text2};
  }
  > svg {
    height: ${({ size }) => size ?? '20px'};
  }
`

const OptionIconWrapper = styled.div<{ size?: string }>`
  position: relative;
  height: ${({ size }) => size ?? '24px'};
  width: ${({ size }) => size ?? '24px'};
  > svg {
    height: ${({ size }) => size ?? '24px'};
    width: ${({ size }) => size ?? '24px'};
  }
  .optionType {
    height: 33%;
    width: 33%
    min-height: 12px;
    min-width: 12px;
    position: absolute;
    bottom: 0;
    right: 0;
  }
`

function IconWrapper({
  size,
  onClick,
  children,
  color
}: {
  children: React.ReactNode
  size?: string
  onClick?: () => void
  color?: string
}) {
  return (
    <Wrapper onClick={onClick} clickable={!!onClick} color={color} size={size}>
      {children}
    </Wrapper>
  )
}

export function ArrowDown({ size, onClick, color }: { size?: string; onClick?: () => void; color?: string }) {
  return (
    <IconWrapper size={size} onClick={onClick} color={color}>
      <Arrow />
    </IconWrapper>
  )
}
export function Plus({ size, onClick, color }: { size?: string; onClick?: () => void; color?: string }) {
  return (
    <IconWrapper size={size} onClick={onClick} color={color}>
      <Cross />
    </IconWrapper>
  )
}

export function CheckCircle({ size, onClick, color }: { size?: string; onClick?: () => void; color?: string }) {
  return (
    <IconWrapper size={size} onClick={onClick} color={color}>
      <CheckCircleIcon />
    </IconWrapper>
  )
}

export function CrossCircle({ size, onClick, color }: { size?: string; onClick?: () => void; color?: string }) {
  return (
    <IconWrapper size={size} onClick={onClick} color={color}>
      <CrossCircleIcon />
    </IconWrapper>
  )
}

export function OptionIcon({ size, tokenIcon, type }: { size?: string; tokenIcon: JSX.Element; type?: Type }) {
  return (
    <>
      {type ? (
        <OptionIconWrapper size={size}>
          {tokenIcon}
          {type === 'call' ? <CallType className="optionType" /> : <PutType className="optionType" />}
        </OptionIconWrapper>
      ) : (
        <IconWrapper size={size}>{tokenIcon}</IconWrapper>
      )}
    </>
  )
}
