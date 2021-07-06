import React from 'react'
import { X } from 'react-feather'
import styled from 'styled-components'
import { StyledDialogOverlay } from 'components/Modal'
import useTheme from 'hooks/useTheme'
import { RowBetween } from 'components/Row'
import { ButtonEmpty, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { useTransition } from 'react-spring'

const Wrapper = styled.div`
  width: 100%;
  max-width: 920px;
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

export default function GovernanceProposalCreation({
  onDismiss,
  isOpen,
  onCreate
}: {
  onDismiss: () => void
  isOpen: boolean
  onCreate: () => void
}) {
  const theme = useTheme()
  const fadeTransition = useTransition(isOpen, null, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  })
  return (
    <>
      {fadeTransition.map(
        ({ item, key, props }) =>
          item && (
            <StyledDialogOverlay
              key={key}
              style={props}
              onDismiss={onDismiss}
              backgroundColor={theme.bg1}
              unstable_lockFocusAcrossFrames={false}
            >
              <Wrapper>
                <AutoColumn gap="36px">
                  <RowBetween>
                    <TYPE.largeHeader>Create a New Proposal</TYPE.largeHeader>
                    <ButtonEmpty width="auto" padding="0" onClick={onDismiss}>
                      <X color={theme.text3} size={24} />
                    </ButtonEmpty>
                  </RowBetween>
                  <TYPE.smallHeader fontSize={22}>Proposal Description</TYPE.smallHeader>
                  <TYPE.smallHeader fontSize={22}>Proposal Settings</TYPE.smallHeader>
                  <TYPE.smallHeader fontSize={22}>Proposal Timing</TYPE.smallHeader>
                  <TYPE.darkGray>
                    Please set a time frame for the proposal. Select the number of days below
                  </TYPE.darkGray>
                  <ButtonPrimary onClick={onCreate}>Determine</ButtonPrimary>
                </AutoColumn>
              </Wrapper>
            </StyledDialogOverlay>
          )
      )}
    </>
  )
}
