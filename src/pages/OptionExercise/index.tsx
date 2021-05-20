import React, { useState, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import { Token } from '@uniswap/sdk'
import { ButtonPrimary } from 'components/Button'
import { OptionCard, Search, OptionInterface, AlternativeDisplay, ContentWrapper } from '../OptionTrade'
import { useActiveWeb3React } from 'hooks'
import { getUnderlyingList, getOptionTypeList } from 'utils/option/httpRequests'
import { ZERO_ADDRESS } from 'constants/index'

export enum Type {
  CALL = 'call',
  PUT = 'put'
}

const Wrapper = styled.div`
  width: 100%;
  margin-bottom: auto;
`

export default function OptionExercise() {
  const { chainId } = useActiveWeb3React()
  const [tokenList, setTokenList] = useState<Token[] | undefined>(undefined)
  const [optionList, setOptionList] = useState<OptionInterface[] | undefined>(undefined)
  const [filteredList, setFilteredList] = useState<OptionInterface[] | undefined>(undefined)
  const history = useHistory()

  const handleSearch = useCallback(
    body => {
      const query = Object.keys(body).reduce((acc, key, idx) => {
        if (key === 'underlying' && body.underlying === ZERO_ADDRESS) {
          return acc
        }
        return `${acc}${idx === 0 ? '' : '&'}${key}=${body[key]}`
      }, '')
      const handleFilteredList = (list: OptionInterface[]) => setFilteredList(list)

      getOptionTypeList(handleFilteredList, chainId, query)
    },
    [chainId]
  )

  useEffect(() => {
    getUnderlyingList((list: Token[] | undefined) => setTokenList(list), chainId)
    getOptionTypeList(list => setOptionList(list), chainId)
  }, [chainId])

  useEffect(() => {
    if (optionList) {
      setFilteredList(optionList)
    }
  }, [optionList])

  return (
    <Wrapper id="optionExercise">
      <Search onSearch={handleSearch} tokenList={tokenList} />
      {filteredList && (
        <ContentWrapper>
          {filteredList.map(option => (
            <OptionCard
              option={option}
              key={option.title}
              buttons={
                <>
                  <ButtonPrimary style={{ padding: 8 }} onClick={() => history.push(`/generate/${option.optionType}`)}>
                    Generate
                  </ButtonPrimary>
                  <div style={{ width: 10 }} />
                  <ButtonPrimary style={{ padding: 8 }} onClick={() => history.push(`/redeem/${option.optionType}`)}>
                    Redeem
                  </ButtonPrimary>
                </>
              }
            />
          ))}
        </ContentWrapper>
      )}
      <AlternativeDisplay optionList={optionList} filteredList={filteredList} />
    </Wrapper>
  )
}
