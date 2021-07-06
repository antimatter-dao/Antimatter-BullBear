import React, { useCallback, useState } from 'react'
import { X } from 'react-feather'
import styled from 'styled-components'
import { makeStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepButton from '@material-ui/core/StepButton'
import { StyledDialogOverlay } from 'components/Modal'
import useTheme from 'hooks/useTheme'
import { RowBetween } from 'components/Row'
import { ButtonEmpty, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { TYPE } from 'theme'
import { useTransition } from 'react-spring'
import TextInput from 'components/TextInput'

const Wrapper = styled.div`
  width: 920px;
  border:1px solid ${({ theme }) => theme.bg3}
  margin-bottom: auto;
  max-width: 1280px;
  border-radius: 32px;
  padding: 29px 52px;
  display: flex;
  flex-direction: column;
  jusitfy-content: cetner;
  align-items: center;
  margin: 30px 0;
  & > form {
    width: 100%;
  };
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 24px;
    width: 100%;
  `};

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
  const [activeStep, setActiveStep] = useState(0)
  const fadeTransition = useTransition(isOpen, null, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  })
  const handleStep = (step: number) => () => {
    setActiveStep(step)
  }
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
              alignItems="flex-start"
            >
              <Wrapper>
                <form name="GovernanceCreationForm">
                  <AutoColumn gap="36px">
                    <RowBetween>
                      <TYPE.largeHeader>Create a New Proposal</TYPE.largeHeader>
                      <ButtonEmpty width="auto" padding="0" onClick={onDismiss}>
                        <X color={theme.text3} size={24} />
                      </ButtonEmpty>
                    </RowBetween>
                    <TYPE.smallHeader fontSize={22}>Proposal Description</TYPE.smallHeader>
                    <TextInput label="Title" placeholder="Enter your project name (Keep it Below 10 words)"></TextInput>
                    <TextInput
                      label="Summary"
                      placeholder="What will be done if the proposal is implement (Keep it below 200 words)"
                      textarea
                    ></TextInput>
                    <TextInput
                      label="Details"
                      placeholder="Write a Longer motivation with links and references if necessary"
                    ></TextInput>
                    <TYPE.smallHeader fontSize={22}>Proposal Settings</TYPE.smallHeader>
                    <TextInput label="For" placeholder="Formulate clear for position"></TextInput>
                    <TextInput label="Against" placeholder="Formulate clear Against position"></TextInput>
                    <TYPE.smallHeader fontSize={22}>Proposal Timing</TYPE.smallHeader>
                    <TYPE.darkGray>
                      Please set a time frame for the proposal. Select the number of days below
                    </TYPE.darkGray>
                    <GovernanceTimeline activeStep={activeStep} onStep={handleStep} />
                    <ButtonPrimary onClick={onCreate}>Determine</ButtonPrimary>
                  </AutoColumn>
                </form>
              </Wrapper>
            </StyledDialogOverlay>
          )
      )}
    </>
  )
}

function GovernanceTimeline({ activeStep, onStep }: { activeStep: number; onStep: (step: number) => () => void }) {
  const theme = useTheme()

  const useStyles = useCallback(
    () =>
      makeStyles({
        root: {
          width: '100%',
          '& .MuiPaper-root': {
            backgroundColor: 'transparent'
          },
          '& text': {
            stroke: 'transparent',
            fill: 'transparent'
          },
          '& path': {
            stroke: 'transparent',
            fill: 'transparent'
          }
        },
        step: {
          '& svg': {
            overflow: 'visible'
          },
          '& circle': {
            fill: theme.bg5
          },
          '& .MuiStepLabel-label': {
            color: theme.text2
          },
          '& .MuiStepIcon-active': {
            '&  circle': {
              fill: theme.primary1,
              stroke: theme.primary4,
              strokeWidth: 4
            },
            '& .MuiStepLabel-label': {
              color: theme.text1
            }
          },
          '& .MuiStepConnector-root': {
            left: 'calc(-50% + 10px)',
            right: 'calc(50% + 11px)'
          },
          '& .MuiStepButton-root': {
            zIndex: 2
          }
        }
      }),
    [theme]
  )
  const classes = useStyles()()

  return (
    <div className={classes.root}>
      <Stepper alternativeLabel nonLinear activeStep={activeStep}>
        {[3, 4, 5, 6, 7].map((label, index) => {
          return (
            <Step key={label} active={activeStep === index} className={classes.step}>
              <StepButton onClick={onStep(index)}>{label}days</StepButton>
            </Step>
          )
        })}
      </Stepper>
      <div></div>
    </div>
  )
}
