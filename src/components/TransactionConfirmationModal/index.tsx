import { ChainId, Currency } from '@uniswap/sdk'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import Modal from '../Modal'
import { Text } from 'rebass'
import { CloseIcon } from '../../theme/components'
import { RowBetween, RowFixed } from '../Row'
import { CheckCircle } from 'react-feather'
import { ButtonGray, ButtonOutlinedPrimary } from '../Button'
import { AutoColumn } from '../Column'
import MetaMaskLogo from '../../assets/images/metamask.png'
import { useActiveWeb3React } from '../../hooks'
import useTheme from 'hooks/useTheme'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import { CrossCircle } from 'components/Icons/'

const Wrapper = styled.div`
  width: 100%;
  max-width: 480px;
  border-radius: 42px;
  background: ${({ theme }) => theme.gradient1};
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

const BottomSection = styled(Section)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  padding: 0 3rem 2rem;
`

const Close = styled(CloseIcon)`
  color: ${({ theme }) => theme.text2};
`

const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`

function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
  const theme = useTheme()
  return (
    <>
      <LoadingView onDismiss={onDismiss}>
        <AutoColumn gap="12px" justify={'center'}>
          <Text fontWeight={400} fontSize={18}>
            Waiting For Confirmation
          </Text>
          <AutoColumn gap="12px" justify={'center'}>
            <Text fontWeight={400} fontSize={14} textAlign="center" color={theme.text2}>
              {pendingText}
            </Text>
          </AutoColumn>
        </AutoColumn>
      </LoadingView>
    </>
  )
}

function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
}) {
  const theme = useContext(ThemeContext)

  const { library } = useActiveWeb3React()

  const { addToken, success } = useAddTokenToMetamask(currencyToAdd)

  return (
    <>
      <SubmittedView onDismiss={onDismiss} hash={hash}>
        <Text fontWeight={400} fontSize={18}>
          Transaction Submitted
        </Text>

        {currencyToAdd && library?.provider?.isMetaMask && (
          <ButtonGray
            mt="12px"
            padding="8px 15px"
            width="fit-content"
            onClick={addToken}
            style={{ margin: 0, background: theme.translucent }}
          >
            {!success ? (
              <RowFixed>
                <Text fontSize={13} lineHeight="17.36px" color={theme.text1}>
                  Add {currencyToAdd.symbol} to Metamask
                </Text>
                <StyledLogo src={MetaMaskLogo} />
              </RowFixed>
            ) : (
              <RowFixed>
                Added {currencyToAdd.symbol}{' '}
                <CheckCircle size={'16px'} stroke={theme.green1} style={{ marginLeft: '6px' }} />
              </RowFixed>
            )}
          </ButtonGray>
        )}
      </SubmittedView>
    </>
  )
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent
}: {
  title: string
  onDismiss: () => void
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}) {
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <div></div>
          <Text fontWeight={500} fontSize={18}>
            {title}
          </Text>
          <Close onClick={onDismiss} />
        </RowBetween>
        {topContent()}
      </Section>
      <BottomSection gap="8px">{bottomContent()}</BottomSection>
    </Wrapper>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const theme = useContext(ThemeContext)
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Close onClick={onDismiss} />
        </RowBetween>
        <AutoColumn style={{ padding: '2rem 0' }} gap="24px" justify="center">
          <CrossCircle color={theme.red1} size="25px" />
          <Text fontWeight={500} fontSize={16} color={theme.text1} style={{ textAlign: 'center', width: '85%' }}>
            {message}
          </Text>
        </AutoColumn>
      </Section>
      <BottomSection gap="12px">
        <ButtonOutlinedPrimary onClick={onDismiss}>Dismiss</ButtonOutlinedPrimary>
      </BottomSection>
    </Wrapper>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
  currencyToAdd?: Currency | undefined
  submittedContent?: () => React.ReactNode
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
  submittedContent
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <>
          (
          {submittedContent ? (
            submittedContent()
          ) : (
            <TransactionSubmittedContent
              chainId={chainId}
              hash={hash}
              onDismiss={onDismiss}
              currencyToAdd={currencyToAdd}
            />
          )}
          ){' '}
        </>
      ) : (
        content()
      )}
    </Modal>
  )
}
