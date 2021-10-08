import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed } from 'components/Row'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { Axios } from 'utils/option/axios'

const Wrapper = styled.div`
  width: 1000px;
  height: 392px;
  margin: auto auto;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%), #000000;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 32px;
  padding: 24px 40px 36px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    overflow: hidden;
    height: auto;
    margin-top: 30px;
    margin-bottom: 30px;
    padding-bottom: 20px
    // padding-bottom:${({ theme }) => `calc(${theme.headerHeight} + 36px)`}
  `}
`
const StyledTotal = styled.div`
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  width: 100%;
`

const StyledItemWrapper = styled(RowBetween)`
  gap: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column ;
    gap: 20px;
`}
`
const StyledItem = styled(AutoColumn)`
  width: 292px;
  height: 112px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  width: 100%;
  height: auto;
`}
`
interface StatsDataProp {
  availableChains: string
  supportedAsset: string[]
  totalValueLocked: string
  totalTradingVolume: string
  totalFeeEarned: string
}

export default function Stats() {
  const [statsData, setStatsData] = useState<StatsDataProp | undefined>()
  useEffect(() => {
    Axios.get('getStatistics', {})
      .then(res => {
        if (res.data.code === 200) {
          console.log(9999, res.data.data)
          const _data = res.data.data
          setStatsData({
            availableChains: _data.Available_Chains,
            supportedAsset: _data.Supported_Asset,
            totalValueLocked: _data.Total_Value_Locked,
            totalTradingVolume: _data.Total_Trading_Volume,
            totalFeeEarned: _data.Total_fee_earned
          })
        } else {
          console.error('request error stats', res.data)
        }
      })
      .catch(err => {
        console.error('request error stats', err)
      })
  }, [])

  return (
    <Wrapper>
      <AutoColumn gap="36px">
        <TYPE.mediumHeader fontFamily="Roboto" color="white" fontSize="28px">
          Statistics:
        </TYPE.mediumHeader>
        <AutoColumn gap="40px">
          <StyledItemWrapper>
            <StyledTotal>
              <TYPE.gray fontSize="16px" style={{ opacity: '0.4' }} fontFamily="Roboto" color="#fff" fontWeight="400">
                Total Trading Volume:
              </TYPE.gray>
              <TYPE.largeHeader fontSize="48px" fontFamily="Roboto" letterSpacing="0.02em" lineHeight="71px">
                $ {statsData ? statsData.totalTradingVolume : '-'}
              </TYPE.largeHeader>
            </StyledTotal>
            <StyledTotal>
              <TYPE.gray fontSize="16px" style={{ opacity: '0.4' }} fontFamily="Roboto" color="#fff" fontWeight="400">
                Total Fee Earned:
              </TYPE.gray>
              <TYPE.largeHeader fontSize="48px" fontFamily="Roboto" letterSpacing="0.02em" lineHeight="71px">
                $ {statsData ? statsData.totalFeeEarned : '-'}
              </TYPE.largeHeader>
            </StyledTotal>
          </StyledItemWrapper>
          <StyledItemWrapper>
            <StyledItem gap="9px">
              <TYPE.gray fontSize="16px" style={{ opacity: '0.4' }} fontFamily="Roboto" color="#fff" fontWeight="400">
                Total Value Locked:
              </TYPE.gray>
              <RowFixed style={{ alignItems: 'baseline' }}>
                <TYPE.mediumHeader fontFamily="Roboto" color="white" fontSize="40px" lineHeight="59px">
                  $ {statsData ? statsData.totalValueLocked : '-'}
                </TYPE.mediumHeader>
              </RowFixed>
            </StyledItem>
            <StyledItem gap="9px">
              <TYPE.gray fontSize="16px" style={{ opacity: '0.4' }} fontFamily="Roboto" color="#fff" fontWeight="400">
                Supported assets:
              </TYPE.gray>
              <RowFixed style={{ alignItems: 'baseline' }}>
                <TYPE.mediumHeader fontFamily="Roboto" color="white" fontSize="40px" lineHeight="59px">
                  {statsData ? statsData.supportedAsset.length : '-'}
                </TYPE.mediumHeader>
                <TYPE.white fontSize="20px" lineHeight="30px" style={{ marginLeft: 5 }}>
                  Tokens
                </TYPE.white>
              </RowFixed>
            </StyledItem>
            <StyledItem gap="9px">
              <TYPE.gray fontSize="16px" style={{ opacity: '0.4' }} fontFamily="Roboto" color="#fff" fontWeight="400">
                Available Chains:
              </TYPE.gray>
              <RowFixed style={{ alignItems: 'baseline' }}>
                <TYPE.mediumHeader fontFamily="Roboto" color="white" fontSize="40px" lineHeight="59px">
                  {statsData ? statsData.availableChains : '-'}
                </TYPE.mediumHeader>
                <TYPE.white fontSize="20px" lineHeight="30px" style={{ marginLeft: 5 }}>
                  Chains
                </TYPE.white>
              </RowFixed>
            </StyledItem>
          </StyledItemWrapper>
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  )
}
