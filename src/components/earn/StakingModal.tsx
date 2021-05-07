import React, { useState, useCallback } from 'react'
import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { ArrowLeftButton, ButtonConfirmed, ButtonError } from '../Button'
// import ProgressCircles from '../ProgressSteps'
import CurrencyInputPanel from '../CurrencyInputPanel'
import { TokenAmount, Pair } from '@uniswap/sdk'
import { useActiveWeb3React } from '../../hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { usePairContract, useStakingContract } from '../../hooks/useContract'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { splitSignature } from 'ethers/lib/utils'
import { StakingInfo, useDerivedStakeInfo } from '../../state/stake/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { LoadingView, SubmittedView } from '../ModalViews'
import AppBody from 'pages/AppBody'
import DataCard from 'components/Card/DataCard'

// const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
//   display: flex;
//   justify-content: space-between;
//   padding-right: 20px;
//   padding-left: 20px;

//   opacity: ${({ dim }) => (dim ? 0.5 : 1)};
// `

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
  padding-top: 0;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo | undefined
  userLiquidityUnstaked: TokenAmount | undefined
}

export default function StakingModal({ isOpen, onDismiss, stakingInfo, userLiquidityUnstaked }: StakingModalProps) {
  const { account, chainId, library } = useActiveWeb3React()

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(
    typedValue,
    stakingInfo?.stakedAmount.token,
    userLiquidityUnstaked
  )

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])

  // pair contract for this token to be staked
  const dummyPair =
    stakingInfo?.tokens[0] && stakingInfo?.tokens[1]
      ? new Pair(new TokenAmount(stakingInfo.tokens[0], '0'), new TokenAmount(stakingInfo.tokens[1], '0'))
      : undefined
  const pairContract = usePairContract(dummyPair?.liquidityToken.address)

  // approval data for stake
  const deadline = useTransactionDeadline()
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmount, stakingInfo?.stakingRewardAddress)

  const isArgentWallet = useIsArgentWallet()
  const stakingContract = useStakingContract(stakingInfo?.stakingRewardAddress)
  async function onStake() {
    setAttempting(true)
    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        await stakingContract.stake(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 })
      } else if (signatureData) {
        stakingContract
          .stakeWithPermit(
            `0x${parsedAmount.raw.toString(16)}`,
            signatureData.deadline,
            signatureData.v,
            signatureData.r,
            signatureData.s,
            { gasLimit: 350000 }
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Deposit liquidity`
            })
            setHash(response.hash)
          })
          .catch((error: any) => {
            setAttempting(false)
            console.log(error)
          })
      } else {
        setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setSignatureData(null)
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  async function onAttemptToApprove() {
    if (!pairContract || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmount
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    if (isArgentWallet) {
      return approveCallback()
    }

    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account)

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ]
    const domain = {
      name: 'Uniswap V2',
      version: '1',
      chainId: chainId,
      verifyingContract: pairContract.address
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
    const message = {
      owner: account,
      spender: stakingInfo?.stakingRewardAddress,
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toNumber()
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit
      },
      domain,
      primaryType: 'Permit',
      message
    })

    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then(signature => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadline.toNumber()
        })
      })
      .catch(error => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (error?.code !== 4001) {
          approveCallback()
        }
      })
  }

  return (
    <>
      {isOpen && (
        <AppBody>
          {!attempting && !hash && (
            <ContentWrapper gap="lg">
              <RowBetween style={{ margin: '0 -1rem' }}>
                <ArrowLeftButton onClick={onDismiss} />
                <TYPE.mediumHeader>Stake LPT </TYPE.mediumHeader>
                <div />
              </RowBetween>
              <CurrencyInputPanel
                value={typedValue}
                onUserInput={onUserInput}
                onMax={handleMax}
                showMaxButton={!atMaxAmount}
                currency={stakingInfo?.stakedAmount.token}
                pair={dummyPair}
                label="Amount"
                disableCurrencySelect={true}
                customBalanceText={'Stake: '}
                id="stake-liquidity-token"
                hideSelect={true}
              />
              <DataCard
                data={[
                  {
                    title: `LPT Staked`,
                    content: stakingInfo?.stakedAmount.toSignificant(4) + ' LPT'
                  }
                ]}
              />
              {/* <HypotheticalRewardRate dim={!hypotheticalRewardRate.greaterThan('0')}>
                <div>
                  <TYPE.black fontWeight={600}>Weekly Rewards</TYPE.black>
                </div>

                <TYPE.black>
                  {hypotheticalRewardRate
                    .multiply((60 * 60 * 24 * 7).toString())
                    .toSignificant(4, { groupSeparator: ',' })}{' '}
                  UNI / week
                </TYPE.black>
              </HypotheticalRewardRate> */}

              <RowBetween>
                <ButtonConfirmed
                  mr="0.5rem"
                  onClick={onAttemptToApprove}
                  confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
                  disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                >
                  Approve
                </ButtonConfirmed>
                <ButtonError
                  disabled={!!error || (signatureData === null && approval !== ApprovalState.APPROVED)}
                  error={!!error && !!parsedAmount}
                  onClick={onStake}
                >
                  {error ?? 'Stake LPT'}
                </ButtonError>
              </RowBetween>
              {/* <ProgressCircles
                steps={[approval === ApprovalState.APPROVED || signatureData !== null]}
                disabled={true}
              /> */}
            </ContentWrapper>
          )}

          <Modal isOpen={attempting && !hash} onDismiss={wrappedOnDismiss}>
            <LoadingView onDismiss={wrappedOnDismiss}>
              <AutoColumn gap="12px" justify={'center'}>
                <TYPE.body fontSize={18}>Waiting For Confirmation...</TYPE.body>
                <TYPE.body fontSize={14}>Stake {parsedAmount?.toSignificant(4)} LPT</TYPE.body>
              </AutoColumn>
            </LoadingView>
          </Modal>

          <Modal isOpen={attempting && !!hash} onDismiss={wrappedOnDismiss}>
            <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
              <AutoColumn gap="24px" justify={'center'}>
                <TYPE.body fontSize={18}>Your LPT was Staked</TYPE.body>
              </AutoColumn>
            </SubmittedView>
          </Modal>
        </AppBody>
      )}
    </>
  )
}
