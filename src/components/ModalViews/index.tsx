import React from 'react'
import { useActiveWeb3React } from '../../hooks'
import { AutoColumn, ColumnCenter } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon, CustomLightSpinner } from '../../theme'
import { ReactComponent as CheckCircle } from '../../assets/svg/transaction_submitted.svg'
import { ReactComponent as CrossCircle } from '../../assets/svg/transaction_error.svg'
import Circle from '../../assets/svg/gray_loader.svg'
import { getEtherscanLink } from '../../utils'
import { ExternalLink } from '../../theme/components'
import useTheme from 'hooks/useTheme'
import { ButtonPrimary } from 'components/Button'

const ConfirmOrLoadingWrapper = styled.div`
  width: 100%;
  padding: 24px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 0 0 28px;
`

export function LoadingView({ children, onDismiss }: { children: any; onDismiss: () => void }) {
  return (
    <ConfirmOrLoadingWrapper>
      <RowBetween>
        <div />
        <CloseIcon onClick={onDismiss} />
      </RowBetween>
      <ConfirmedIcon>
        <CustomLightSpinner src={Circle} alt="loader" size={'45px'} />
      </ConfirmedIcon>
      <AutoColumn gap="28px" justify={'center'}>
        {children}
        <TYPE.smallGray>Confirm this transaction in your wallet</TYPE.smallGray>
      </AutoColumn>
    </ConfirmOrLoadingWrapper>
  )
}

export function SubmittedView({
  children,
  onDismiss,
  hash,
  hideLink,
  isError
}: {
  children: any
  onDismiss: () => void
  hash: string | undefined
  hideLink?: boolean
  isError?: boolean
}) {
  const { chainId } = useActiveWeb3React()
  const theme = useTheme()

  return (
    <ConfirmOrLoadingWrapper>
      <RowBetween>
        <div />
        <CloseIcon onClick={onDismiss} />
      </RowBetween>
      <ConfirmedIcon>
        {isError ? <CrossCircle /> : <CheckCircle style={{ width: '32px', height: '32px' }} />}
      </ConfirmedIcon>
      <AutoColumn gap="32px" justify={'center'}>
        {children}
        {!hideLink && !isError && chainId && hash && (
          <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')} style={{ color: theme.primary1 }}>
            <TYPE.main fontWeight={400} fontSize={14} color={theme.primary1}>
              View on Etherscan
            </TYPE.main>
          </ExternalLink>
        )}
        <ButtonPrimary onClick={onDismiss} style={{ marginTop: '-10px' }}>
          <TYPE.main fontWeight={500} fontSize={16} color={theme.bg1}>
            Close
          </TYPE.main>
        </ButtonPrimary>
      </AutoColumn>
    </ConfirmOrLoadingWrapper>
  )
}
