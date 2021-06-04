import React, { useCallback, useState } from 'react'
import { X } from 'react-feather'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { tabs } from './index'
import { Base } from '../Button'
import { AutoColumn } from 'components/Column'
import { ReactComponent as Menu } from '../../assets/svg/menu.svg'
import arrowUpUrl from 'assets/svg/arrow_up.svg'
import { ExternalLink } from 'theme'

const ToggleMenuButton = styled(Base)`
  background: none;
  width: auto;
  :active,
  :focus {
    border: none;
  }
`
const TogggleMenuWrapper = styled.div`
  z-index: 100;
  position: absolute;
  left: 0;
  width: 100vw;
  border-radius: 32px;
  background: ${({ theme }) => theme.gradient2};
  top: ${({ theme }) => theme.mobileHeaderHeight};
  height: calc(100vh - ${({ theme }) => theme.mobileHeaderHeight + ' - ' + theme.headerHeight});
  border: 1px solid ${({ theme }) => theme.bg3};
  border-bottom: none;
  overflow-y: auto;
`

const TabMobile = styled(NavLink)<{ isSubTab?: boolean }>`
  font-size: 24px;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};
  width: 100%;
  padding: 16px 30px;
  cursor: pointer;
  text-decoration: none;
  ${({ isSubTab, theme }) =>
    isSubTab
      ? `
  font-size: 16px;
  padding: 8px 32px;
  color: ${theme.text3};
  `
      : ''}
`
const SubTabMobile = styled(ExternalLink)`
  font-size: 16px;
  line-height: 24px;
  padding: 8px 32px;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  :focus,
  :active,
  :hover {
    color: ${({ theme }) => theme.text1};
  }
`

const ToggleTabMobile = styled.div<{ isopen: 'true' | 'false' }>`
  font-size: 24px;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};
  width: 100%;
  padding: 16px 30px;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  :after {
    content: '';
    width: 14px;
    height: 8px;
    background: url(${arrowUpUrl});
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%) ${({ isopen }) => (isopen === 'true' ? '' : 'rotate(180deg)')};
  }
`

function ToggleTab({ children, title }: { children: JSX.Element | string; title: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const handleClick = useCallback(() => {
    setIsOpen(!isOpen)
  }, [setIsOpen, isOpen])
  return (
    <>
      <ToggleTabMobile title={title} onClick={handleClick} isopen={isOpen ? 'true' : 'false'}>
        {title}
      </ToggleTabMobile>
      {isOpen && <>{children}</>}
    </>
  )
}

export default function ToggleMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ToggleMenuButton onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu style={{ height: 30, width: 24 }} />}
      </ToggleMenuButton>
      {isOpen && (
        <TogggleMenuWrapper>
          <AutoColumn>
            {tabs.map(({ title, route, subTab }) =>
              subTab ? (
                <ToggleTab key={title} title={title}>
                  <>
                    {subTab &&
                      subTab.map(({ title, route, link, titleContent }) => {
                        return link ? (
                          <SubTabMobile key={title} href={link}>
                            {title}
                          </SubTabMobile>
                        ) : (
                          <TabMobile key={title} to={`/${route}`} onClick={() => setIsOpen(!isOpen)} isSubTab={true}>
                            {titleContent ?? title}
                          </TabMobile>
                        )
                      })}
                  </>
                </ToggleTab>
              ) : (
                <TabMobile key={title} to={`/${route}`} onClick={() => setIsOpen(!isOpen)}>
                  {title}
                </TabMobile>
              )
            )}
          </AutoColumn>
        </TogggleMenuWrapper>
      )}
    </>
  )
}
