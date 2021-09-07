import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed } from 'components/Row'
import React from 'react'
import styled from 'styled-components'
import { TYPE } from 'theme'

const Wrapper = styled.div`
  width: 1000px;
  height: 392px;
  margin: 140px auto 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%), #000000;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 32px;
  padding: 24px 40px 36px;
`
const StyledTotal = styled.div`
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
`
const StyledItem = styled(AutoColumn)`
  width: 292px;
  height: 112px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
`

export default function Stats() {
  return (
    <Wrapper>
      <AutoColumn gap="36px">
        <TYPE.mediumHeader fontFamily="Roboto" color="white" fontSize="28px">
          Antimatter Stats
        </TYPE.mediumHeader>
        <AutoColumn gap="20px">
          <StyledTotal>
            <TYPE.gray fontSize="16px" style={{ opacity: '0.4' }} fontFamily="Roboto" color="#fff" fontWeight="400">
              Total Value Locked
            </TYPE.gray>
            <TYPE.largeHeader fontSize="48px" fontFamily="Roboto" letterSpacing="0.02em" lineHeight="71px">
              $ -
            </TYPE.largeHeader>
          </StyledTotal>
          <RowBetween>
            <StyledItem gap="9px">
              <TYPE.gray fontSize="16px" style={{ opacity: '0.4' }} fontFamily="Roboto" color="#fff" fontWeight="400">
                Total Value Locked
              </TYPE.gray>
              <RowFixed style={{ alignItems: 'baseline' }}>
                <TYPE.mediumHeader fontFamily="Roboto" color="white" fontSize="40px" lineHeight="59px">
                  -
                </TYPE.mediumHeader>
                <TYPE.white fontSize="20px" lineHeight="30px" style={{ marginLeft: 5 }}>
                  Nodes
                </TYPE.white>
              </RowFixed>
            </StyledItem>
            <StyledItem gap="9px">
              <TYPE.gray fontSize="16px" style={{ opacity: '0.4' }} fontFamily="Roboto" color="#fff" fontWeight="400">
                Connected via the bridged
              </TYPE.gray>
              <RowFixed style={{ alignItems: 'baseline' }}>
                <TYPE.mediumHeader fontFamily="Roboto" color="white" fontSize="40px" lineHeight="59px">
                  -
                </TYPE.mediumHeader>
                <TYPE.white fontSize="20px" lineHeight="30px" style={{ marginLeft: 5 }}>
                  Chains
                </TYPE.white>
              </RowFixed>
            </StyledItem>
            <StyledItem gap="9px">
              <TYPE.gray fontSize="16px" style={{ opacity: '0.4' }} fontFamily="Roboto" color="#fff" fontWeight="400">
                Supported
              </TYPE.gray>
              <RowFixed style={{ alignItems: 'baseline' }}>
                <TYPE.mediumHeader fontFamily="Roboto" color="white" fontSize="40px" lineHeight="59px">
                  -
                </TYPE.mediumHeader>
                <TYPE.white fontSize="20px" lineHeight="30px" style={{ marginLeft: 5 }}>
                  Tokens
                </TYPE.white>
              </RowFixed>
            </StyledItem>
          </RowBetween>
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  )
}
