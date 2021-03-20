import React, { useState } from 'react'
import { PaddedColumn, Separator } from './styleds'
import { RowBetween } from 'components/Row'
import { ArrowLeft } from 'react-feather'
import { Text } from 'rebass'
import { CloseIcon } from 'theme'
import styled from 'styled-components'
import { Token } from '@uniswap/sdk'
import { ManageLists } from './ManageLists'
import ManageTokens from './ManageTokens'
import { TokenList } from '@uniswap/token-lists'
import { CurrencyModalView } from './CurrencySearchModal'
import useTheme from 'hooks/useTheme'

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  padding-bottom: 80px;
  background: ${({ theme }) => theme.gradient1};
  border-radius: 42px;
`

const ToggleWrapper = styled(RowBetween)`
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.text1}
  border-radius: 14px;
`

const ToggleOption = styled.div<{ active?: boolean }>`
  width: 48%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-weight: 600;
  background-color: ${({ theme, active }) => (active ? theme.primary1 : 'transparent')};
  color: ${({ theme, active }) => (active ? theme.bg1 : theme.text2)};
  user-select: none;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

export default function Manage({
  onDismiss,
  setModalView,
  setImportList,
  setImportToken,
  setListUrl
}: {
  onDismiss: () => void
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}) {
  // toggle between tokens and lists
  const [showLists, setShowLists] = useState(true)
  const theme = useTheme()

  return (
    <Wrapper>
      <PaddedColumn>
        <RowBetween>
          <ArrowLeft style={{ cursor: 'pointer' }} onClick={() => setModalView(CurrencyModalView.search)} />
          <Text fontSize={18}>Select a token</Text>
          <CloseIcon onClick={onDismiss} style={{ color: theme.text3 }} />
        </RowBetween>
      </PaddedColumn>
      <Separator />
      <PaddedColumn style={{ paddingBottom: 0 }}>
        <ToggleWrapper>
          <ToggleOption onClick={() => setShowLists(!showLists)} active={showLists}>
            Lists
          </ToggleOption>
          <ToggleOption onClick={() => setShowLists(!showLists)} active={!showLists}>
            Tokens
          </ToggleOption>
        </ToggleWrapper>
      </PaddedColumn>
      {showLists ? (
        <ManageLists setModalView={setModalView} setImportList={setImportList} setListUrl={setListUrl} />
      ) : (
        <ManageTokens setModalView={setModalView} setImportToken={setImportToken} />
      )}
    </Wrapper>
  )
}
