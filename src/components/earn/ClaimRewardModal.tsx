import React, { useState } from 'react'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { ButtonError, ArrowLeftButton } from '../Button'
import { StakingInfo } from '../../state/stake/hooks'
import { useStakingContract } from '../../hooks/useContract'
import { SubmittedView, LoadingView } from '../ModalViews'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useActiveWeb3React } from '../../hooks'
import AppBody from 'pages/AppBody'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`
interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo | undefined
}

export default function ClaimRewardModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account } = useActiveWeb3React()
  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStakingContract(stakingInfo?.stakingRewardAddress)

  async function onClaimReward() {
    if (stakingContract && stakingInfo?.stakedAmount) {
      setAttempting(true)
      await stakingContract
        .getReward({ gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated MATTER rewards`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!stakingInfo?.stakedAmount) {
    error = error ?? 'Enter an amount'
  }

  return (
    <>
      {isOpen && (
        <AppBody>
          {!attempting && !hash && (
            <ContentWrapper gap="15px">
              <RowBetween style={{ margin: '0 -1rem' }}>
                <ArrowLeftButton onClick={wrappedOnDismiss} />
                <TYPE.mediumHeader>Claim</TYPE.mediumHeader>
                <div />
              </RowBetween>
              {stakingInfo?.earnedAmount && (
                <AutoColumn justify="center" gap="md">
                  <TYPE.body fontWeight={600} fontSize={36}>
                    {stakingInfo?.active ? stakingInfo?.earnedAmount?.toSignificant(6) ?? '-' : '0'}
                  </TYPE.body>
                  <TYPE.body> +MATTER($1)</TYPE.body>
                </AutoColumn>
              )}
              <TYPE.subHeader style={{ textAlign: 'center' }}>
                When you claim without withdrawing your liquidity remains in the mining pool.
              </TYPE.subHeader>
              <ButtonError disabled={!!error} error={!!error && !!stakingInfo?.stakedAmount} onClick={onClaimReward}>
                {error ?? 'Claim'}
              </ButtonError>
            </ContentWrapper>
          )}
          {attempting && !hash && (
            <LoadingView onDismiss={wrappedOnDismiss}>
              <AutoColumn gap="12px" justify={'center'}>
                <TYPE.body fontSize={20}>Claiming {stakingInfo?.earnedAmount?.toSignificant(6)} +MATTER($1)</TYPE.body>
              </AutoColumn>
            </LoadingView>
          )}
          {hash && (
            <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
              <AutoColumn gap="12px" justify={'center'}>
                <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
                <TYPE.body fontSize={20}>Claim {stakingInfo?.earnedAmount?.toSignificant(6)} +MATTER($1)</TYPE.body>
              </AutoColumn>
            </SubmittedView>
          )}
        </AppBody>
      )}
    </>
  )
}
