import React, { useContext, useRef, useState } from 'react'
import { X } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useToggleSettingsMenu } from '../../state/application/hooks'
import {
  useExpertModeManager,
  useUserTransactionTTL,
  useUserSlippageTolerance,
  useUserSingleHopOnly
} from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { ButtonError } from '../Button'
import Column, { AutoColumn } from '../Column'
import Modal from '../Modal'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import Toggle from '../Toggle'
import TransactionSettings from '../TransactionSettings'
import { ReactComponent as Settings } from '../../assets/svg/setting.svg'

const StyledMenuIcon = styled(Settings)`
  height: 20px;
  width: 20px;

  > * {
    stroke: ${({ theme }) => theme.text2};
  }

  :hover {
    opacity: 0.7;
  }
`

const StyledCloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;

  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
  }

  svg {
    margin-top: 2px;
  }
`
const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -6px;
  right: 0px;
  font-size: 14px;
`

const StyledMenu = styled.div`
  margin-left: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  text-align: left;
`

const MenuFlyout = styled.span`
  min-width: 500px;
  background: ${({ theme }) => theme.bg1} ${({ theme }) => theme.gradient1};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 42px;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: -1px;
  right: -10px;
  z-index: 100;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    min-width: 18.125rem;
  `};
`

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  border-radius: 20px;
`

const CustomizedAutoRow = styled(AutoRow)`
  & > div {
    width: 50%;
  }
`

export default function SettingsTab() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.SETTINGS)
  const toggle = useToggleSettingsMenu()

  const theme = useContext(ThemeContext)
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()

  const [ttl, setTtl] = useUserTransactionTTL()

  const [expertMode, toggleExpertMode] = useExpertModeManager()

  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false)

  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100} maxWidth={500}>
        <ModalContentWrapper>
          <AutoColumn gap="sm">
            <RowBetween style={{ padding: '0 24px' }}>
              <div />
              <Text fontWeight={500} fontSize={18}>
                Are you sure?
              </Text>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
            </RowBetween>
            <AutoColumn gap="sm" style={{ padding: '0 1rem' }}>
              <Text fontWeight={500} fontSize={14}>
                Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                in bad rates and lost funds.
              </Text>
              <Text fontWeight={600} fontSize={14}>
                ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
              </Text>
              <ButtonError
                style={{ marginTop: '1rem' }}
                error={false}
                padding={'14px'}
                onClick={() => {
                  if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
                    toggleExpertMode()
                    setShowConfirmation(false)
                  }
                }}
              >
                <Text fontSize={16} fontWeight={500} id="confirm-expert-mode" color={theme.bg1}>
                  Turn On Expert Mode
                </Text>
              </ButtonError>
            </AutoColumn>
          </AutoColumn>
        </ModalContentWrapper>
      </Modal>
      <StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
        <StyledMenuIcon />
        {expertMode ? (
          <EmojiWrapper>
            <span role="img" aria-label="wizard-icon">
              🧙
            </span>
          </EmojiWrapper>
        ) : null}
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <AutoColumn gap="lg" style={{ padding: '3rem' }} justify="center">
            <Text fontWeight={600} fontSize={14}>
              Transaction Settings
            </Text>
            <TransactionSettings
              rawSlippage={userSlippageTolerance}
              setRawSlippage={setUserslippageTolerance}
              deadline={ttl}
              setDeadline={setTtl}
            />
            <Text fontWeight={600} fontSize={14}>
              Interface Settings
            </Text>
            <CustomizedAutoRow>
              <Column>
                <RowFixed>
                  <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                    Toggle Expert Mode
                  </TYPE.black>
                  <QuestionHelper text="Bypasses confirmation modals and allows high slippage trades. Use at your own risk." />
                </RowFixed>
                <Toggle
                  id="toggle-expert-mode-button"
                  isActive={expertMode}
                  toggle={
                    expertMode
                      ? () => {
                          toggleExpertMode()
                          setShowConfirmation(false)
                        }
                      : () => {
                          toggle()
                          setShowConfirmation(true)
                        }
                  }
                />
              </Column>
              <Column>
                <RowFixed>
                  <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                    Disable Multihops
                  </TYPE.black>
                  <QuestionHelper text="Restricts swaps to direct pairs only." />
                </RowFixed>
                <Toggle
                  id="toggle-disable-multihop-button"
                  isActive={singleHopOnly}
                  toggle={() => (singleHopOnly ? setSingleHopOnly(false) : setSingleHopOnly(true))}
                />
              </Column>
            </CustomizedAutoRow>
          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
