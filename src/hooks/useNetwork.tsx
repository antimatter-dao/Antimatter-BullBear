import React, { useCallback, useState, useMemo } from 'react'
import styled from 'styled-components'
import Modal from 'components/Modal'
import { TransactionErrorContent } from 'components/TransactionConfirmationModal'
import { AnimatedImg, AnimatedWrapper } from 'theme'
import Loader from 'assets/svg/antimatter_background_logo.svg'
export interface HttpHandlingFunctions {
  errorFunction: () => void
  pendingFunction: () => void
  pendingCompleteFunction: () => void
}

const Overlay = styled.div<{ height?: string; paddingTop?: string }>`
  position: absolute;
  padding-top: ${({ paddingTop }) => paddingTop ?? '100px'};
  width: 100%;
  height: ${({ height }) => height ?? '300px'};
  background-color:${({ theme }) => theme.bg1}
  top: 0;
  left: 0;
  z-index: 2;
`
const WRAPPER_ID = 'option-card-wrapper'

const getHeight = () => {
  const element = document.getElementById(WRAPPER_ID)
  return element ? element.offsetHeight + 'px' : '500px'
}
export function useNetwork(): {
  httpHandlingFunctions: HttpHandlingFunctions
  NetworkErrorModal: React.FC
  NetworkPendingSpinner: React.FC<{ paddingTop?: string }>
  wrapperId: string
} {
  const [isOpen, setIsOpen] = useState(false)
  const [isSpinnerOpen, setIsSpinnerOpen] = useState(false)
  const handleOpen = useCallback(() => setIsOpen(false), [])
  const handleDismiss = useCallback(() => setIsOpen(false), [])
  const handleSpinnerOpen = useCallback(() => setIsSpinnerOpen(true), [])
  const handleSpinnerDismiss = useCallback(() => setIsSpinnerOpen(false), [])
  const NetworkErrorModal = useCallback(
    () => (
      <Modal isOpen={isOpen} onDismiss={handleDismiss}>
        <TransactionErrorContent message="Network Error" onDismiss={handleDismiss} />
      </Modal>
    ),
    [handleDismiss, isOpen]
  )
  const NetworkPendingSpinner = useCallback(
    ({ paddingTop }: { paddingTop?: string }) => (
      <>
        {isSpinnerOpen && (
          <Overlay height={getHeight()} paddingTop={paddingTop}>
            <AnimatedWrapper>
              <AnimatedImg>
                <img src={Loader} alt="loading-icon" />
              </AnimatedImg>
            </AnimatedWrapper>
          </Overlay>
        )}
      </>
    ),
    [isSpinnerOpen]
  )
  const handlingFunctions = useMemo(
    () => ({
      errorFunction: handleOpen,
      pendingFunction: handleSpinnerOpen,
      pendingCompleteFunction: handleSpinnerDismiss
    }),
    [handleOpen, handleSpinnerDismiss, handleSpinnerOpen]
  )

  const result = useMemo(
    () => ({
      wrapperId: WRAPPER_ID,
      httpHandlingFunctions: handlingFunctions,
      NetworkErrorModal,
      NetworkPendingSpinner
    }),
    [handlingFunctions, NetworkErrorModal, NetworkPendingSpinner]
  )

  return result
}
