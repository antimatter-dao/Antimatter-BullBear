import React, { useState } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { ButtonError, ArrowLeftButton } from '../Button'
import { StakingInfo } from '../../state/stake/hooks'
import { useStakingContract } from '../../hooks/useContract'
import { SubmittedView, LoadingView } from '../ModalViews'
import { useTransactionAdder } from '../../state/transactions/hooks'
import FormattedCurrencyAmount from '../FormattedCurrencyAmount'
import { useActiveWeb3React } from '../../hooks'
import AppBody from 'pages/AppBody'
import DataCard from 'components/Card/DataCard'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`
interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo | undefined
}

export default function UnstakingModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account } = useActiveWeb3React()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStakingContract(stakingInfo?.stakingRewardAddress)

  async function onWithdraw() {
    if (stakingContract && stakingInfo?.stakedAmount) {
      setAttempting(true)
      await stakingContract
        .exit({ gasLimit: 600000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Unstake deposited liquidity`
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
            <ContentWrapper gap="lg">
              <RowBetween style={{ margin: '0 -1rem' }}>
                <ArrowLeftButton onClick={onDismiss} />
                <TYPE.mediumHeader>Unstake LPT</TYPE.mediumHeader>
                <div />
              </RowBetween>
              <DataCard
                data={[
                  {
                    title: 'Unclaimed  +MATTER($1)',
                    content: (
                      <>
                        {stakingInfo && <FormattedCurrencyAmount currencyAmount={stakingInfo.earnedAmount} />}
                        MATTER
                      </>
                    )
                  },
                  {
                    title: 'LPT Staked',
                    content: (
                      <>
                        {stakingInfo && <FormattedCurrencyAmount currencyAmount={stakingInfo.stakedAmount} />}
                        LPT
                      </>
                    )
                  }
                ]}
              />
              <ButtonError
                disabled={!!error}
                error={!!error && !!stakingInfo?.stakedAmount}
                onClick={onWithdraw}
                style={{ height: 48 }}
              >
                {error ?? 'Unstake LPT'}
              </ButtonError>
            </ContentWrapper>
          )}

          <Modal isOpen={attempting && !hash} onDismiss={wrappedOndismiss}>
            <LoadingView onDismiss={wrappedOndismiss}>
              <AutoColumn gap="12px" justify={'center'}>
                <TYPE.body fontSize={18}>Unstaking {stakingInfo?.stakedAmount?.toSignificant(4)} LPT</TYPE.body>
                <TYPE.body fontSize={14}>Claiming {stakingInfo?.earnedAmount?.toSignificant(4)} +MATTER($1)</TYPE.body>
              </AutoColumn>
            </LoadingView>
          </Modal>

          <Modal isOpen={attempting && !!hash} onDismiss={wrappedOndismiss}>
            <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
              <AutoColumn gap="12px" justify={'center'}>
                <TYPE.body fontSize={18}>{`Your LPT was Unstaked`}</TYPE.body>
                <TYPE.body fontSize={14}>Claimed {stakingInfo?.earnedAmount?.toSignificant(4)} +MATTER($1)</TYPE.body>
              </AutoColumn>
            </SubmittedView>
          </Modal>
        </AppBody>
      )}
    </>
  )
}
