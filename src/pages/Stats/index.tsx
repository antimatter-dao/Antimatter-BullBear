import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed } from 'components/Row'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { TYPE } from 'theme'
import { Axios } from 'utils/option/axios'

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
interface StatsDataProp {
  availableChains: string
  supportedAsset: string[]
  totalValueLocked: string
  totalTradingVolume: string
}

export default function Stats() {
  const [statsData, setStatsData] = useState<StatsDataProp | undefined>()
  useEffect(() => {
    Axios.get('getStatistics', {})
      .then(res => {
        if (res.data.code === 200) {
          const _data = res.data.data
          setStatsData({
            availableChains: _data.Available_Chains,
            supportedAsset: _data.Supported_Asset,
            totalValueLocked: _data.Total_Value_Locked,
            totalTradingVolume: _data.Total_Trading_Volume
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
        <AutoColumn gap="20px">
          <StyledTotal>
            <TYPE.gray fontSize="16px" style={{ opacity: '0.4' }} fontFamily="Roboto" color="#fff" fontWeight="400">
              Total Trading Volume:
            </TYPE.gray>
            <TYPE.largeHeader fontSize="48px" fontFamily="Roboto" letterSpacing="0.02em" lineHeight="71px">
              $ {statsData ? statsData.totalTradingVolume : '-'}
            </TYPE.largeHeader>
          </StyledTotal>
          <RowBetween>
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
                Supported asset:
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
          </RowBetween>
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  )
}
