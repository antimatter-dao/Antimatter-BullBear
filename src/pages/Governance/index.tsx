import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { RowBetween, RowFixed } from 'components/Row'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { ButtonOutlinedPrimary } from 'components/Button'
import AppBody from 'pages/AppBody'

interface GovernanceData {
  title: string
  address: string
  id: string
  synopsis: string
  timeLeft: string
  voteFor: number
  voteAgainst: number
  isLive: boolean
}

const Wrapper = styled.div`
  width: 100%;
  margin-bottom: auto;
  max-width: 1280px;
`
const VerticalDivider = styled.div`
  width: 1px;
  height: 36px;
  border-right: 1px solid ${({ theme }) => theme.bg4};
  margin: 0 24px;
`
const Divider = styled.div`
  width: 100%;
  height: 1px;
  border-bottom: 1px solid ${({ theme }) => theme.bg5};
`
const DividerThin = styled.div`
  width: calc(100% + 48px);
  margin: 0 -24px;
  height: 1px;
  border-bottom: 1px solid rgba(255,255,255,.2)};
`

export const ContentWrapper = styled.div`
  position: relative;
  max-width: 1280px;
  margin: auto;
  display: grid;
  grid-gap: 24px;
  grid-template-columns: repeat(auto-fill, 340px);
  padding: 52px 0;
  justify-content: center;
  ${({ theme }) => theme.mediaWidth.upToLarge`padding: 30px`}
  ${({ theme }) => theme.mediaWidth.upToSmall`padding: 10px`}
`
export const Live = styled.div`
  color: ${({ theme }) => theme.green1};
  display: flex;
  align-items: center;
  :before {
    content: "''";
    height: 8px;
    width: 8px;
    background-color: ${({ theme }) => theme.green1};
    border-radius: 50%;
    margin-right: 8px;
  }
`
export const ProgressBar = styled.div<{ leftPercentage: string; isLarge?: boolean }>`
  width: 100%;
  height: ${({ isLarge }) => (isLarge ? '12px' : '8px')};
  border-radius: 14px;
  background-color: rgba(255, 255, 255, 0.12);
  position: relative;
  
  :before {
    position: absolute
    top:0;
    left: 0;
    content: '';
    height: 100%;
    border-radius: 14px;
    width: ${({ leftPercentage }) => leftPercentage};
    background-color: ${({ theme }) => theme.text1};
  }
`
const Synopsis = styled.div`
  width: 100%;
  height: 54px;
  font-size: 14px;
  overflow: hidden;
`

export default function Governance() {
  const handleCreateProposal = useCallback(() => {}, [])
  const governanceData = useMemo(
    (): GovernanceData[] => [
      {
        title: 'Reduce Daily Rewards To Co...',
        address: '0xdb028zsd4g6...06x7b',
        id: '000123',
        synopsis:
          'The proposal is to use Dutch Auction format instead of the current Sealed Bid Auctions for all future Governance Vault...',
        timeLeft: '2d : 2h : 20m',
        voteFor: 10,
        voteAgainst: 8,
        isLive: true
      },
      {
        title: 'Transaction fees',
        address: '0xdb028zsd4g6...06x7b',
        id: '000124',
        synopsis:
          'The proposal is to use Dutch Auction format instead of the current Sealed Bid Auctions for all future Governance Vault...',
        timeLeft: '2d : 2h : 20m',
        voteFor: 10,
        voteAgainst: 8,
        isLive: true
      }
    ],
    []
  )
  return (
    <Wrapper id="governance">
      <RowBetween style={{ padding: '45px 0' }}>
        <RowFixed>
          <RowFixed>
            <TYPE.smallGray fontSize={14} style={{ marginRight: '12px' }}>
              Your Voting Power:
            </TYPE.smallGray>
            <TYPE.smallHeader fontSize={20} fontWeight={500}>
              0,3 Votes
            </TYPE.smallHeader>
          </RowFixed>
          <VerticalDivider />
          <RowFixed>
            <TYPE.smallGray fontSize={14} style={{ marginRight: '12px' }}>
              Your Governance Earning:
            </TYPE.smallGray>
            <TYPE.body fontSize={20} fontWeight={500}>
              100 MATTER
            </TYPE.body>
          </RowFixed>
        </RowFixed>
        <ButtonOutlinedPrimary onClick={handleCreateProposal} width="180px">
          + Create Proposal
        </ButtonOutlinedPrimary>
      </RowBetween>
      <ContentWrapper>
        {governanceData.map(data => (
          <GovernanceCard data={data} key={data.id} />
        ))}
      </ContentWrapper>
    </Wrapper>
  )
}

function GovernanceCard({
  data: { title, address, id, synopsis, timeLeft, voteFor, voteAgainst, isLive }
}: {
  data: GovernanceData
}) {
  return (
    <AppBody maxWidth="340px" gradient1={true}>
      <AutoColumn gap="16px">
        <RowBetween>
          {isLive ? <Live>Live</Live> : <div />}
          <TYPE.smallGray>#{id}</TYPE.smallGray>
        </RowBetween>
        <AutoColumn gap="4px">
          <TYPE.mediumHeader>{title}</TYPE.mediumHeader>
          <TYPE.smallGray>{address}</TYPE.smallGray>
        </AutoColumn>
        <Divider />
        <Synopsis>{synopsis}</Synopsis>
        <AutoColumn gap="8px" style={{ margin: '10px 0' }}>
          <RowBetween>
            <TYPE.smallGray>Votes For:</TYPE.smallGray>
            <TYPE.smallGray>Votes Against:</TYPE.smallGray>
          </RowBetween>
          <RowBetween>
            <TYPE.smallHeader fontSize={14}>{voteFor}&nbsp;MATTER</TYPE.smallHeader>
            <TYPE.smallHeader fontSize={14}>{voteAgainst}&nbsp;MATTER</TYPE.smallHeader>
          </RowBetween>
          <ProgressBar leftPercentage={`${(voteFor * 100) / (voteFor + voteAgainst)}%`} />
        </AutoColumn>
        <DividerThin />
        <TYPE.small fontWeight={500} style={{ textAlign: 'center', margin: '-4px 0 -10px' }}>
          Time left : {timeLeft}
        </TYPE.small>
      </AutoColumn>
    </AppBody>
  )
}
