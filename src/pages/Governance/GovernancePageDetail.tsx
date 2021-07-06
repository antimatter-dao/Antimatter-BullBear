import React, { useState, useCallback,useMemo } from 'react'
import { ChevronLeft, X } from 'react-feather'
import styled from 'styled-components'
import { Live } from '.'
import { RowBetween } from 'components/Row'
import useTheme from 'hooks/useTheme'
import { ButtonEmpty, ButtonOutlinedPrimary, ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { HideSmall, ShowSmall, TYPE } from 'theme'
import { ProgressBar } from './'
import { GradientCard, OutlineCard } from 'components/Card'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { SubmittedView } from 'components/ModalViews'
import Modal from 'components/Modal'
import { useGovernanceDetails, useUserStaking } from '../../hooks/useGovernanceDetail'
import { JSBI, TokenAmount } from '@uniswap/sdk'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { GOVERNANCE_ADDRESS, GOVERNANCE_TOKEN } from '../../constants'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { useWeb3React } from '@web3-react/core'
import { tryParseAmount } from '../../state/swap/hooks'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useGovernanceContract } from 'hooks/useContract'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { RouteComponentProps } from 'react-router-dom'

enum VoteOption {
  FOR = 'for',
  AGAINST = 'against',
}
enum StatusOption {
  Live = 'Live',
  Success = 'Success',
  Faild = 'Faild',
}

const Wrapper = styled.div`
  width: 100%;
  max-width: 1160px;
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

const VoteOptionCard = styled.div<{ selected?: boolean }>`
  border-radius: 14px;
  border: 1px solid ${({ theme, selected }) => (selected ? theme.primary1 : 'transparent')};
  background-color: ${({ theme }) => theme.translucent};
  width: 140px;
  height: 52px;
  display: flex;
  font-size: 14px;
  color: ${({ theme, selected }) => (selected ? theme.text1 : theme.text3)};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  & > div {
    margin-top: 1px;
  }
  :hover {
    cursor: pointer;
    border: 1px solid ${({ theme }) => theme.primary1};
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
`}
`

const VoteOptionWrapper = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  & > * {
    margin-top: 12px;
  };
  & > *:first-child {
    margin-top: 0;
  }
`}
`

const ModalButtonWrapper = styled(RowBetween)`
  margin-top: 14px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  & > *:last-child {
    margin-top: 12px;
  };
  & > *:first-child {
    margin: 0;
  }
`}
`

export default function GovernancePageDetail({
  match: {
    params: { governanceIndex }
  }
}: RouteComponentProps<{ governanceIndex?: string }>) {
  const {account} = useWeb3React()
  const [selected, setSelected] = useState<VoteOption>(VoteOption.FOR)
  const [showConfirm, setShowConfirm] = useState(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [txHash, setTxHash] = useState<string>('')
  const [NeutralSubmitted, setNeutralSubmitted] = useState(false)
  const [voteValue, setVoteValue] = useState('')
  const { data } = useGovernanceDetails(governanceIndex ?? '');
  const balance = useCurrencyBalance(account ?? undefined, GOVERNANCE_TOKEN)
  const contact = useGovernanceContract();
  const addTransaction = useTransactionAdder()
  const userStaking = useUserStaking(governanceIndex)

  const inputValue = useMemo(() => {
    return tryParseAmount(voteValue, GOVERNANCE_TOKEN)
  }, [voteValue])

  const theme = useTheme()


  function onClaim() {
    if (!contact 
        || StatusOption.Live === data.status
      ) {
      return;
    }
    const args = [governanceIndex];
    contact.unStaking(...args, {}).then((response: TransactionResponse) => {
      addTransaction(response, {
        summary: 'vote claim'
      });

      setTxHash(response.hash)
      })
  }


  function onVote() {
    if (!contact || !inputValue) {
      return;
    }
    const args = [
      governanceIndex,
      selected === VoteOption.FOR ? 1 : 2,
      inputValue?.raw.toString()
    ]

    setAttemptingTxn(true)

    contact.vote(...args, {}).then((response: TransactionResponse) => {
      setAttemptingTxn(false)
      addTransaction(response, {
        summary: 'vote'
      });

      setTxHash(response.hash)
      })
  }
  
  const handleSelect = useCallback(
    (option: VoteOption) => () => {
      setSelected(option)
    },
    []
  )
  const handleSubmit = useCallback(() => {
    setShowConfirm(true)
  }, [selected])

  const handleNeutralDismiss = useCallback(() => {
    setNeutralSubmitted(false)
  }, [])

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setTxHash('')
  }, [])

  const handleConfirmConfirmation = useCallback(() => {
    setAttemptingTxn(true)
    onVote();
  }, [inputValue])

  const enoughBalance = useMemo(() => {
    return balance && inputValue && !balance.lessThan(inputValue)
  }, [inputValue, balance])

  const [approval, approveCallback] = useApproveCallback(
    inputValue,
    GOVERNANCE_ADDRESS
  )

  const claimBtn = useMemo(() => {
    const ret = {
      text: 'Claim',
      disable: true,
      event: onClaim
    }
    if ( StatusOption.Live === data.status 
      || !JSBI.greaterThan(JSBI.BigInt(userStaking.totalStake), JSBI.BigInt(0))
      ) {
      ret.disable = true;
      return ret
    }

    ret.disable = false;
    return ret;
  }, [data])

  const btnStatus = useMemo(() => {
    const ret = {
      text: 'submit',
      event: ()=>{},
      disable: false,
    }
    if (data.status === StatusOption.Faild || data.status === StatusOption.Success) {
      ret.text = 'Voting has ended';
      ret.disable = true;
      return ret;
    }
    if (!account) {
      ret.text = 'Connect wallet';
      ret.disable = true;
      return ret;
    }
    // if (chainId !== 1) {
    //   ret.text = 'Please switch to ETH chain'
    //   ret.disable = true;
    //   return ret;
    // }

    if (!inputValue || (inputValue && !inputValue.greaterThan( JSBI.BigInt(0) )) ) {
      ret.text = 'Please input amount';
      ret.disable = true;
      return ret;
    }
    
    if (!enoughBalance) {
      ret.text = 'Insufficient Balance';
      ret.disable = true;
      return ret;
    }

    if (approval !== ApprovalState.APPROVED) {
      ret.event = approveCallback;
      ret.text = approval === ApprovalState.PENDING ? 'Approving' : 'Approve';
      ret.disable= !!(approval === ApprovalState.PENDING)
      return ret;
    }

    ret.text= 'submit';
    ret.event= handleSubmit;
    ret.disable = false;
    return ret;
  }, [inputValue, enoughBalance, account, data, approval, approveCallback])

  if (!data) {
    return null
  }

  const { creator, title, voteFor, status, contents, voteAgainst, totalVotes, timeLeft } = data
  const voteForPercentage = `${calcVoteForPercentage(VoteOption.FOR, voteFor, voteAgainst)}%`
  const voteAgainstPercentage = `${calcVoteForPercentage(VoteOption.AGAINST, voteFor, voteAgainst)}%`

  return (
    <>
      <Wrapper>
        <RowBetween>
          <HideSmall>
            <ButtonEmpty width="106px" color={theme.text1}>
              <ChevronLeft style={{ marginRight: 16 }} />
              Back
            </ButtonEmpty>
          </HideSmall>
          <Live>{status}</Live>
          <ShowSmall>
            <ButtonEmpty width="auto" padding="0">
              <X color={theme.text3} size={24} />
            </ButtonEmpty>
          </ShowSmall>
          <HideSmall>
            <div style={{ width: 106 }} />
          </HideSmall>
        </RowBetween>
        <AutoColumn style={{ minWidth: 760 }} justify="center" gap="40px">
          <AutoColumn gap="28px">
            <div>
              <TYPE.largeHeader fontSize={36} textAlign="center" fontWeight={300}>
                {title}
              </TYPE.largeHeader>
              <TYPE.smallGray textAlign="center" marginTop="4px">
                {creator}
              </TYPE.smallGray>
            </div>
            <TYPE.body lineHeight="25px" textAlign="center">
              {contents?.summary}
            </TYPE.body>
          </AutoColumn>
          <AutoColumn style={{ width: '100%' }} gap="16px">
            <RowBetween>
              <AutoColumn gap="4px">
                <TYPE.smallGray fontSize={14}>Votes For:</TYPE.smallGray>
                <TYPE.mediumHeader>
                {toNumber(voteFor)} &nbsp;MATTER
                  <span style={{ color: theme.text3, fontWeight: 100, marginLeft: 10 }}>
                    {voteForPercentage}
                  </span>
                </TYPE.mediumHeader>
              </AutoColumn>
              <HideSmall>
                <OutlineCard style={{ width: 'auto', padding: '8px 38px' }}>
                  <TYPE.largeHeader color={theme.text1} fontWeight={100} textAlign="center">
                    {toNumber(totalVotes)}&nbsp;Votes
                  </TYPE.largeHeader>
                </OutlineCard>
              </HideSmall>
              <AutoColumn gap="4px">
                <TYPE.smallGray fontSize={14}>Votes Against:</TYPE.smallGray>
                <TYPE.mediumHeader>
                  {toNumber(voteAgainst)} &nbsp;MATTER
                  <span style={{ color: theme.text3, fontWeight: 100, marginLeft: 10 }}>
                    {voteAgainstPercentage}
                  </span>
                </TYPE.mediumHeader>
              </AutoColumn>
            </RowBetween>
            <ProgressBar isLarge leftPercentage={voteForPercentage} />
            <ShowSmall>
              <OutlineCard style={{ width: '100%', padding: '8px 38px' }}>
                <TYPE.largeHeader color={theme.text1} fontWeight={100} textAlign="center">
                  {totalVotes}&nbsp;Votes
                </TYPE.largeHeader>
              </OutlineCard>
            </ShowSmall>
          </AutoColumn>
          <GradientCard>
            <AutoColumn gap="24px" style={{ maxWidth: 468, margin: '4px auto' }} justify="center">
              <TYPE.mediumHeader textAlign="center">Make Your Decision</TYPE.mediumHeader>
              <TYPE.small textAlign="center">Time left : {timeLeft}</TYPE.small>
              <VoteOptionWrapper style={{padding: '0 20px'}}>
                <span>My votes: {toNumber(userStaking.totalYes)}</span>
                <span>My votes: {toNumber(userStaking.totalNo)}</span>
              </VoteOptionWrapper>
              <VoteOptionWrapper style={{padding: '0 20px'}}>
                <VoteOptionCard selected={selected === VoteOption.FOR} onClick={handleSelect(VoteOption.FOR)}>
                  Vote For
                  <TYPE.small>{ selected === VoteOption.FOR && Number(voteValue) ? voteValue :  '-' } MATTER</TYPE.small>
                </VoteOptionCard>
                <VoteOptionCard
                  selected={selected === VoteOption.AGAINST}
                  onClick={handleSelect(VoteOption.AGAINST)}
                >
                  Vote Against
                  <TYPE.small>{ selected === VoteOption.AGAINST && Number(voteValue) ? voteValue :  '-' } MATTER</TYPE.small>
                </VoteOptionCard>
              </VoteOptionWrapper>

              <div style={{width: 'calc(100% - 40px)'}}>
                <CurrencyInputPanel
                  value={voteValue}
                  onUserInput={(value)=> {
                    setVoteValue(value)
                  }}
                  onMax={()=>{
                    setVoteValue(balance ? balance.toSignificant() : '')
                  }}
                  showMaxButton={true}
                  currency={GOVERNANCE_TOKEN}
                  // pair={dummyPair}
                  label="Amount"
                  disableCurrencySelect={true}
                  customBalanceText={'Balance: '}
                  id="stake-vote-token"
                  hideSelect={true}
                />
              </div>
              

              <TYPE.smallGray textAlign="center">
                {selected === VoteOption.FOR ? contents?.agreeFor : contents?.againstFor}
              </TYPE.smallGray>
              <ButtonPrimary width="320px" onClick={btnStatus.event}
                disabled={btnStatus.disable}
              >
                {btnStatus.text}
              </ButtonPrimary>
              <ButtonPrimary width="320px" onClick={claimBtn.event}
                disabled={claimBtn.disable}
              >
                {claimBtn.text}
              </ButtonPrimary>
            </AutoColumn>
          </GradientCard>
        </AutoColumn>
      </Wrapper>
      <Modal isOpen={NeutralSubmitted} onDismiss={handleNeutralDismiss}>
        <SubmittedModalContent onDismiss={handleNeutralDismiss} hash={txHash} />
      </Modal>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={() => (
          <ConfirmationModalContent
            voteValue={voteValue}
            voteOption={selected}
            onDismiss={handleDismissConfirmation}
            onConfirm={handleConfirmConfirmation}
          />
        )}
        pendingText={'Waiting For Confirmation...'}
        submittedContent={() => <SubmittedModalContent onDismiss={handleDismissConfirmation} hash={txHash} />}
      />
    </>
  )
}

function ConfirmationModalContent({
  voteOption,
  onDismiss,
  voteValue,
  onConfirm
}: {
  voteOption: VoteOption
  voteValue: string | number
  onDismiss: () => void
  onConfirm: () => void
}) {
  const theme = useTheme()
  return (
    <AutoColumn justify="center" style={{ padding: 24, width: '100%' }} gap="20px">
      <RowBetween>
        <div style={{ width: 24 }} />
        <TYPE.body fontSize={18}>{voteOption === VoteOption.FOR ? 'Vote For' : 'Vote Against'}</TYPE.body>
        <ButtonEmpty width="auto" padding="0" onClick={onDismiss}>
          <X color={theme.text3} size={24} />
        </ButtonEmpty>
      </RowBetween>

      <TYPE.largeHeader fontSize={28} fontWeight={300}>
        {voteValue} MATTER
      </TYPE.largeHeader>
      <TYPE.body fontSize={14}>
        Are you sure you want to vote {voteOption === VoteOption.FOR ? 'For' : 'Against'}?
      </TYPE.body>
      <ModalButtonWrapper>
        <ButtonOutlinedPrimary marginRight="15px" onClick={onDismiss}>
          Cancel
        </ButtonOutlinedPrimary>
        <ButtonPrimary onClick={onConfirm}>Confirm</ButtonPrimary>
      </ModalButtonWrapper>
    </AutoColumn>
  )
}

function calcVoteForPercentage(type: VoteOption, voteFor: string|number, voteAgainst : string|number) : string {
  const count = JSBI.add(
    JSBI.BigInt(voteFor),
    JSBI.BigInt(voteAgainst)
  );
  if (!JSBI.toNumber(count)) return '0'
  const percentage = JSBI.toNumber(
    JSBI.divide(
      JSBI.multiply(
        JSBI.BigInt(100),
        JSBI.BigInt(type === VoteOption.FOR ? voteFor : voteAgainst)
      ),
      count
    )
  ).toFixed(2);
  return percentage
}

function SubmittedModalContent({
  onDismiss,
  hash,
  isError
}: {
  onDismiss: () => void
  hash: string | undefined
  isError?: boolean
}) {
  return (
    <>
      <SubmittedView onDismiss={onDismiss} hash={hash} hideLink isError={isError}>
        <TYPE.body fontWeight={400} fontSize={18} textAlign="center">
          {isError ? (
            <>
              Oops! Your balance is not <br /> enought to vote against
            </>
          ) : (
            <>
              Your vote against
              <br /> Is accepted successfully
            </>
          )}
        </TYPE.body>
      </SubmittedView>
    </>
  )
}


function toNumber(weiValue: string,) : string {
  return new TokenAmount(GOVERNANCE_TOKEN, JSBI.BigInt(weiValue)).toSignificant(1)
}

