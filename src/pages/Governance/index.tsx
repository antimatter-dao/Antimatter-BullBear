import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { RowBetween, RowFixed } from 'components/Row'
import { AutoColumn } from 'components/Column'
import { HideSmall, TYPE } from 'theme'
import { ButtonOutlinedPrimary } from 'components/Button'
import AppBody from 'pages/AppBody'
import GovernanceDetail from './GovernanceDetail'
import GovernanceProposalCreation from './GovernanceProposalCreation'
import { GovernanceData, useGovernanceList } from '../../hooks/useGovernanceDetail'
import { CurrencyAmount } from '@uniswap/sdk'

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
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 0 24px 0 82px
  `}
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

const MobileCreate = styled.div`
  display: none;
  position: fixed;
  left: 0;
  bottom: ${({ theme }) => theme.headerHeight};
  height: 72px;
  width: 100%;
  background-color: ${({ theme }) => theme.bg2};
  align-items: center;
  padding: 0 24px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
display: flex
`};
`

export default function Governance() {
  const governanceList = useGovernanceList()
  console.log('governanceList', governanceList)
  const [isCardOpen, setIsCardOpen] = useState(false)
  const [isCreationOpen, setIsCreationOpen] = useState(false)
  const [cardDetail, setCardDetail] = useState<undefined | GovernanceData>(undefined)
  const handleCardClick = useCallback(
    (data: GovernanceData) => () => {
      setIsCardOpen(true)
      setCardDetail(data)
    },
    []
  )
  const handleCloseCard = useCallback(() => {
    setIsCardOpen(false)
    setCardDetail(undefined)
  }, [])
  const handleOpenCreation = useCallback(() => {
    setIsCreationOpen(true)
  }, [])
  const handleCloseCreation = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsCreationOpen(false)
  }, [])

  return (
    <>
      <GovernanceProposalCreation isOpen={isCreationOpen} onDismiss={handleCloseCreation} />
      <GovernanceDetail isOpen={isCardOpen} onDismiss={handleCloseCard} data={cardDetail} />
      <Wrapper id="governance">
        <RowBetween style={{ padding: '45px 25px' }}>
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
          </RowFixed>
          <HideSmall>
            <ButtonOutlinedPrimary onClick={handleOpenCreation} width="180px">
              + Create Proposal
            </ButtonOutlinedPrimary>
          </HideSmall>
        </RowBetween>
        <ContentWrapper>
          {governanceList &&
            governanceList.map(data => <GovernanceCard data={data} key={data.id} onClick={handleCardClick(data)} />)}
        </ContentWrapper>
      </Wrapper>
      <MobileCreate>
        <ButtonOutlinedPrimary onClick={handleOpenCreation}>+ Create Proposal</ButtonOutlinedPrimary>
      </MobileCreate>
    </>
  )
}

function GovernanceCard({
  data: { title, id, creator, timeLeft, voteFor, voteAgainst, contents },
  onClick
}: {
  data: GovernanceData
  onClick: () => void
}) {
  return (
    <AppBody maxWidth="340px" gradient1={true} isCard style={{ cursor: 'pointer' }}>
      <AutoColumn gap="16px" onClick={onClick}>
        <RowBetween>
          {true ? <Live>Live</Live> : <div />}
          <TYPE.smallGray>#{id}</TYPE.smallGray>
        </RowBetween>
        <AutoColumn gap="4px">
          <TYPE.mediumHeader>{title}</TYPE.mediumHeader>
          <TYPE.smallGray>{creator}</TYPE.smallGray>
        </AutoColumn>
        <Divider />
        <Synopsis>{contents?.summary}</Synopsis>
        <AutoColumn gap="8px" style={{ margin: '10px 0' }}>
          <RowBetween>
            <TYPE.smallGray>Votes For:</TYPE.smallGray>
            <TYPE.smallGray>Votes Against:</TYPE.smallGray>
          </RowBetween>
          <RowBetween>
            <TYPE.smallHeader fontSize={14}>
              {voteFor ? CurrencyAmount.ether(voteFor).toSignificant(2, { groupSeparator: ',' }) : '--'}&nbsp;MATTER
            </TYPE.smallHeader>
            <TYPE.smallHeader fontSize={14}>
              {voteFor ? CurrencyAmount.ether(voteAgainst).toSignificant(2, { groupSeparator: ',' }) : '--'}&nbsp;MATTER
            </TYPE.smallHeader>
          </RowBetween>
          <ProgressBar leftPercentage={`${(parseInt(voteFor) * 100) / (parseInt(voteFor) + parseInt(voteAgainst))}%`} />
        </AutoColumn>
        <DividerThin />
        <TYPE.small fontWeight={500} style={{ textAlign: 'center', margin: '-4px 0 -10px' }}>
          Time left : {timeLeft}
        </TYPE.small>
      </AutoColumn>
    </AppBody>
  )
}
