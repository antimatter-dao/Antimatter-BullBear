import React from 'react'
import styled from 'styled-components'
import { TYPE } from '../theme'
import { ColumnCenter } from '../components/Column'

export const BodyWrapper = styled.div<{ maxWidth?: string; gradient1?: boolean; isCard?: boolean }>`
  max-width: ${({ maxWidth }) => maxWidth ?? '480px'};
  width: 100%;
  background: ${({ theme, gradient1 }) => (gradient1 ? theme.gradient1 : theme.gradient2)};
  border: 1px solid ${({ theme }) => theme.text5};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 32px;
  padding: 1.5rem;
  ${({ theme, isCard }) => theme.mediaWidth.upToSmall`
    min-height:100%;
    padding: 16px 24px;
    flex-grow: 1;
    ${isCard ? '' : 'border-bottom-left-radius: unset;border-bottom-right-radius: unset;'}

  `}
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({
  children,
  style,
  maxWidth,
  gradient1,
  isCard
}: {
  children: React.ReactNode
  style?: any
  maxWidth?: string
  gradient1?: boolean
  isCard?: boolean
}) {
  return (
    <BodyWrapper style={style} maxWidth={maxWidth} gradient1={gradient1} isCard={isCard}>
      {children}
    </BodyWrapper>
  )
}

const StyledSwapHeader = styled.div`
  margin-bottom: -4px;
  font-size: 22px;
  width: 100%;
  max-width: 480px;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
`

export function BodyHeader({ title }: { title: string }) {
  return (
    <StyledSwapHeader>
      <ColumnCenter>
        <TYPE.mediumHeader>{title}</TYPE.mediumHeader>
      </ColumnCenter>
    </StyledSwapHeader>
  )
}
