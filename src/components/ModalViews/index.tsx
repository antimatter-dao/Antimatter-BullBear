import React from 'react'
import { useActiveWeb3React } from '../../hooks'

import { AutoColumn, ColumnCenter } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon, CustomLightSpinner } from '../../theme'
import { ReactComponent as CheckCircle } from '../../assets/svg/transaction_submitted.svg'

import Circle from '../../assets/svg/gray_loader.svg'
import { getEtherscanLink } from '../../utils'
import { ExternalLink } from '../../theme/components'

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
  hash
}: {
  children: any
  onDismiss: () => void
  hash: string | undefined
}) {
  const { chainId } = useActiveWeb3React()

  return (
    <ConfirmOrLoadingWrapper>
      <RowBetween>
        <div />
        <CloseIcon onClick={onDismiss} />
      </RowBetween>
      <ConfirmedIcon>
        <CheckCircle style={{ width: '32px', height: '32px' }} />
      </ConfirmedIcon>
      <AutoColumn gap="32px" justify={'center'}>
        {children}
        {chainId && hash && (
          <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')} style={{ marginLeft: '4px' }}>
            <TYPE.subHeader>View transaction on Etherscan</TYPE.subHeader>
          </ExternalLink>
        )}
      </AutoColumn>
    </ConfirmOrLoadingWrapper>
  )
}
