import React from 'react'
import styled from 'styled-components'

export const BodyWrapper = styled.div`
  max-width: 480px;
  width: 100%;
  background: ${({ theme }) => theme.bg1}
    linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%) ;
  border: 1px solid ${({ theme }) => theme.text5}
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 32px;
  padding: 1.5rem; 
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}
