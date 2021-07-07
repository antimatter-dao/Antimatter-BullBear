import React, { useState, useCallback } from 'react'
import { ChevronLeft, X } from 'react-feather'
import { useTransition } from 'react-spring'
import styled from 'styled-components'
import { RowBetween } from 'components/Row'
import useTheme from 'hooks/useTheme'
import { ButtonEmpty, ButtonOutlinedPrimary, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { HideSmall, ShowSmall, TYPE } from 'theme'
import { Live, ProgressBar } from './'
import { GradientCard, OutlineCard } from 'components/Card'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { SubmittedView } from 'components/ModalViews'
import Modal, { StyledDialogOverlay } from 'components/Modal'
import { GovernanceData } from '../../hooks/useGovernanceDetail'

enum VoteOption {
  FOR = 'for',
  AGAINST = 'against',
  NEUTRAL = 'neutral'
}

const Wrapper = styled.div`
  width: 100%;
  max-width: 1160px;
  border:1px solid ${({ theme }) => theme.bg3}
  margin-bottom: auto;
  max-width: 1280px;
  border-radius: 32px;
  padding: 29px 52px;
  display: flex;
  flex-direction: column;
  jusitfy-content: cetner;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 0 24px
  `}
`

const VoteOptionCard = styled.div<{ selected?: boolean }>`
  border-radius: 14px;
  border: 1px solid ${({ theme, selected }) => (selected ? theme.primary1 : 'transparent')};
  background-color: ${({ theme }) => theme.translucent};
  width: 140px;
  height: 52px;
  display: flex;
  font-size: 14px;
  color: ${({ theme, selected }) => (selected ? theme.text1 : theme.text3)};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  & > div {
    margin-top: 1px;
  }
  :hover {
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.primary1};
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
`}
`

const VoteOptionWrapper = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  & > * {
    margin-top: 12px;
  };
  & > *:first-child {
    margin-top: 0;
  }
`}
`

const ModalButtonWrapper = styled(RowBetween)`
  margin-top: 14px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  & > *:last-child {
    margin-top: 12px;
  };
  & > *:first-child {
    margin: 0;
  }
`}
`

export default function GovernanceDetail({
  isOpen,
  data,
  onDismiss
}: {
  isOpen: boolean
  data: GovernanceData | undefined
  onDismiss: () => void
}) {
  const [selected, setSelected] = useState<VoteOption>(VoteOption.FOR)
  const [showConfirm, setShowConfirm] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>('')
  const [NeutralSubmitted, setNeutralSubmitted] = useState(false)
  const theme = useTheme()

  const fadeTransition = useTransition(isOpen, null, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  })
  const handleSelect = useCallback(
    (option: VoteOption) => () => {
      setSelected(option)
    },
    []
  )
  const handleSubmit = useCallback(() => {
    if (selected === VoteOption.NEUTRAL) {
      setNeutralSubmitted(true)
      return
    }
    setShowConfirm(true)
  }, [selected])

  const handleNeutralDismiss = useCallback(() => {
    setNeutralSubmitted(false)
  }, [])

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setTxHash('')
    onDismiss()
  }, [onDismiss])

  const handleConfirmConfirmation = useCallback(() => {
    setAttemptingTxn(true)
    setTimeout(() => {
      setTxHash('111111')
      setAttemptingTxn(false)
    }, 1000)
  }, [])

  if (!data) {
    return null
  }
  const { title, contents, creator, voteFor, voteAgainst, totalVotes, timeLeft } = data
  const voteForPercentage = `${((parseInt(voteFor) * 100) / (parseInt(voteFor) + parseInt(voteAgainst))).toFixed(2)}%`
  const voteAgainstPercentage = `${(
    (parseInt(voteAgainst) * 100) /
    (parseInt(voteFor) + parseInt(voteAgainst))
  ).toFixed(2)}%`

  return (
    <>
      {fadeTransition.map(
        ({ item, key, props }) =>
          item && (
            <StyledDialogOverlay
              key={key}
              style={props}
              color={theme.bg1}
              unstable_lockFocusAcrossFrames={false}
              overflow="auto"
              alignitems="flex-start"
            >
              <Modal isOpen={NeutralSubmitted} onDismiss={handleNeutralDismiss}>
                <SubmittedModalContent onDismiss={handleNeutralDismiss} hash={txHash} />
              </Modal>
              <TransactionConfirmationModal
                isOpen={showConfirm}
                onDismiss={handleDismissConfirmation}
                attemptingTxn={attemptingTxn}
                hash={txHash}
                content={() => (
                  <ConfirmationModalContent
                    voteOption={selected}
                    onDismiss={handleDismissConfirmation}
                    onConfirm={handleConfirmConfirmation}
                  />
                )}
                pendingText={'Waiting For Confirmation...'}
                submittedContent={() => <SubmittedModalContent onDismiss={handleDismissConfirmation} hash={txHash} />}
              />
              <Wrapper>
                <RowBetween>
                  <HideSmall>
                    <ButtonEmpty width="106px" color={theme.text1} onClick={onDismiss}>
                      <ChevronLeft style={{ marginRight: 16 }} />
                      Back
                    </ButtonEmpty>
                  </HideSmall>
                  <Live>Live</Live>
                  <ShowSmall>
                    <ButtonEmpty width="auto" padding="0" onClick={onDismiss}>
                      <X color={theme.text3} size={24} />
                    </ButtonEmpty>
                  </ShowSmall>
                  <HideSmall>
                    <div style={{ width: 106 }} />
                  </HideSmall>
                </RowBetween>
                <AutoColumn style={{ maxWidth: 760 }} justify="center" gap="40px">
                  <AutoColumn gap="28px">
                    <div>
                      <TYPE.largeHeader fontSize={36} textAlign="center" fontWeight={300}>
                        {title}
                      </TYPE.largeHeader>
                      <TYPE.smallGray textAlign="center" marginTop="4px">
                        {creator}
                      </TYPE.smallGray>
                    </div>
                    <TYPE.body lineHeight="25px" textAlign="center">
                      {contents}
                    </TYPE.body>
                  </AutoColumn>
                  <AutoColumn style={{ width: '100%' }} gap="16px">
                    <RowBetween>
                      <AutoColumn gap="4px">
                        <TYPE.smallGray fontSize={14}>Votes For:</TYPE.smallGray>
                        <TYPE.mediumHeader>
                          {voteFor} &nbsp;MATTER
                          <span style={{ color: theme.text3, fontWeight: 100, marginLeft: 10 }}>
                            {voteForPercentage}
                          </span>
                        </TYPE.mediumHeader>
                      </AutoColumn>
                      <HideSmall>
                        <OutlineCard style={{ width: 'auto', padding: '8px 38px' }}>
                          <TYPE.largeHeader color={theme.text1} fontWeight={100} textAlign="center">
                            {totalVotes}&nbsp;Votes
                          </TYPE.largeHeader>
                        </OutlineCard>
                      </HideSmall>
                      <AutoColumn gap="4px">
                        <TYPE.smallGray fontSize={14}>Votes Against:</TYPE.smallGray>
                        <TYPE.mediumHeader>
                          {voteAgainst} &nbsp;MATTER
                          <span style={{ color: theme.text3, fontWeight: 100, marginLeft: 10 }}>
                            {voteAgainstPercentage}
                          </span>
                        </TYPE.mediumHeader>
                      </AutoColumn>
                    </RowBetween>
                    <ProgressBar isLarge leftPercentage={voteForPercentage} />
                    <ShowSmall>
                      <OutlineCard style={{ width: '100%', padding: '8px 38px' }}>
                        <TYPE.largeHeader color={theme.text1} fontWeight={100} textAlign="center">
                          {totalVotes}&nbsp;Votes
                        </TYPE.largeHeader>
                      </OutlineCard>
                    </ShowSmall>
                  </AutoColumn>
                  <GradientCard>
                    <AutoColumn gap="24px" style={{ maxWidth: 468, margin: '4px auto' }} justify="center">
                      <TYPE.mediumHeader textAlign="center">Make Your Decision</TYPE.mediumHeader>
                      <TYPE.small textAlign="center">Time left : {timeLeft}</TYPE.small>
                      <VoteOptionWrapper>
                        <VoteOptionCard selected={selected === VoteOption.FOR} onClick={handleSelect(VoteOption.FOR)}>
                          Vote For
                          <TYPE.small>10 MATTER</TYPE.small>
                        </VoteOptionCard>
                        <VoteOptionCard
                          selected={selected === VoteOption.AGAINST}
                          onClick={handleSelect(VoteOption.AGAINST)}
                        >
                          Vote Against
                          <TYPE.small>10 MATTER</TYPE.small>
                        </VoteOptionCard>
                        <VoteOptionCard
                          selected={selected === VoteOption.NEUTRAL}
                          onClick={handleSelect(VoteOption.NEUTRAL)}
                        >
                          Vote Netural
                          <TYPE.small>0 MATTER</TYPE.small>
                        </VoteOptionCard>
                      </VoteOptionWrapper>
                      <TYPE.smallGray textAlign="center">
                        I vote in favor of Dutch Auction format for future Governance Vault sales.
                      </TYPE.smallGray>
                      <ButtonPrimary width="200px" onClick={handleSubmit}>
                        Submit
                      </ButtonPrimary>
                    </AutoColumn>
                  </GradientCard>
                </AutoColumn>
              </Wrapper>
            </StyledDialogOverlay>
          )
      )}
    </>
  )
}

function ConfirmationModalContent({
  voteOption,
  onDismiss,
  onConfirm
}: {
  voteOption: VoteOption
  onDismiss: () => void
  onConfirm: () => void
}) {
  const theme = useTheme()
  return (
    <AutoColumn justify="center" style={{ padding: 24, width: '100%' }} gap="20px">
      <RowBetween>
        <div style={{ width: 24 }} />
        <TYPE.body fontSize={18}>{voteOption === VoteOption.FOR ? 'Vote For' : 'Vote Against'}</TYPE.body>
        <ButtonEmpty width="auto" padding="0" onClick={onDismiss}>
          <X color={theme.text3} size={24} />
        </ButtonEmpty>
      </RowBetween>

      <TYPE.largeHeader fontSize={28} fontWeight={300}>
        10 MATTER
      </TYPE.largeHeader>
      <TYPE.body fontSize={14}>
        Are you sure you want to vote {voteOption === VoteOption.FOR ? 'For' : 'Against'}?
      </TYPE.body>
      <ModalButtonWrapper>
        <ButtonOutlinedPrimary marginRight="15px" onClick={onDismiss}>
          Cancel
        </ButtonOutlinedPrimary>
        <ButtonPrimary onClick={onConfirm}>Confirm</ButtonPrimary>
      </ModalButtonWrapper>
    </AutoColumn>
  )
}

function SubmittedModalContent({
  onDismiss,
  hash,
  isError
}: {
  onDismiss: () => void
  hash: string | undefined
  isError?: boolean
}) {
  return (
    <>
      <SubmittedView onDismiss={onDismiss} hash={hash} hideLink isError={isError}>
        <TYPE.body fontWeight={400} fontSize={18} textAlign="center">
          {isError ? (
            <>
              Oops! Your balance is not <br /> enought to vote against
            </>
          ) : (
            <>
              Your vote against
              <br /> Is accepted successfully
            </>
          )}
        </TYPE.body>
      </SubmittedView>
    </>
  )
}
