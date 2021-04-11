/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../../components/Button'
import StakingModal from '../../components/earn/StakingModal'
import { useStakingInfo } from '../../state/stake/hooks'
import UnstakingModal from '../../components/earn/UnstakingModal'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { CountUp } from 'use-count-up'
import { usePair } from '../../data/Reserves'
import usePrevious from '../../hooks/usePrevious'
// import { BIG_INT_SECONDS_IN_WEEK } from '../../constants'
import { LPT_PAIRS, LPT_RewardPerDay, LPT_TYPE } from 'constants/matterToken/matterTokenTokens'
import QuestionHelper from '../../components/QuestionHelper'
import { ReactComponent as Logo1 } from 'assets/svg/ETH+_USDT.svg'
import { ReactComponent as Logo2 } from 'assets/svg/ETH-_USDT.svg'
import { ReactComponent as Logo3 } from 'assets/svg/ETH_Matter.svg'
import { ReactComponent as Logo4 } from 'assets/svg/Matter+_matter.svg'
import { AutoRow, RowBetween } from 'components/Row'
import Card, { OutlineCard } from 'components/Card'
import { AutoColumn } from 'components/Column'

const sectionPadding = '25px'
const GridWrapper = styled.div`
  background: ${({ theme }) => theme.gradient2};
  border-radius: 36px;
  border: 1px solid ${({ theme }) => theme.bg3};
  display: flex;
  flex-direction: column;
  width: 495px;
  ${({ theme }) => theme.mediaWidth.upToMedium`  width: 100%;`}
`

const ClaimRewardWrapper = styled.div`
  height: 100%;
  width: 100%
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
  padding: ${sectionPadding};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
const OptionCard = styled(Card)`
  padding: 0;
  svg {
    height: 24px;
    width: 24px;
    margin-right: 10px;
  }
`
const LPTWrapper = styled.div`
  height: 100%;
  flex-grow: 1;
  display: flex;

  section {
    width: 50%
    height: 100%;
    padding: ${sectionPadding};
    :first-child {
      border-right: 1px solid ${({ theme }) => theme.bg3};
    }
  }
`
const APYCard = styled(OutlineCard)`
  border-radius: 10px;
  padding: 9px;
  min-width: 122px;
  width: fit-content;
`

enum STAKING_MODAL_TYPE {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  CLAIM = 'claim'
}

function NumberUnitText({ number, unit }: { number: string; unit: string }) {
  return (
    <div
      style={{
        fontWeight: 500,
        fontSize: '26px',
        fontFamily: 'Futura PT',
        overflowWrap: 'anywhere',
        lineHeight: '26px'
      }}
    >
      {number}
      <span
        style={{
          marginLeft: '8px',
          fontFamily: 'Roboto',
          fontWeight: 400,
          fontSize: '14px',
          whiteSpace: 'nowrap'
        }}
      >
        {unit}
      </span>
    </div>
  )
}

const Logos = {
  [LPT_TYPE.ETH_CALL_DAI]: <Logo1 />,
  [LPT_TYPE.ETH_PUT_DAI]: <Logo2 />,
  [LPT_TYPE.MATTER_ETH]: <Logo3 />,
  [LPT_TYPE.MATTER_CALL_MATTER]: <Logo4 />
}

export default function MatterTokenManageModal({ lptType }: { lptType: LPT_TYPE }) {
  const [modalType, setModalType] = useState<STAKING_MODAL_TYPE | undefined>(undefined)
  const { account, chainId } = useActiveWeb3React()
  // get currencies and pair
  const [tokenA, tokenB] = [LPT_PAIRS[chainId ?? 3]?.[lptType].currencyA, LPT_PAIRS[chainId ?? 3]?.[lptType].currencyB]

  const [, stakingTokenPair] = usePair(tokenA, tokenB)
  const stakingInfo = useStakingInfo(stakingTokenPair)?.[0]
  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  // const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  const countUpAmount = stakingInfo?.active
    ? stakingInfo?.earnedAmount?.toSignificant(6, { groupSeparator: ',' }) ?? '-'
    : '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  const toggleWalletModal = useWalletModalToggle()

  const handleModalClick = useCallback(
    modalType =>
      function() {
        if (account) {
          setModalType(modalType)
        } else {
          toggleWalletModal()
        }
      },
    [account, toggleWalletModal]
  )

  const handleCloseModal = useCallback(() => setModalType(undefined), [setModalType])

  return (
    <>
      {stakingInfo && (
        <>
          <StakingModal
            isOpen={modalType === STAKING_MODAL_TYPE.STAKE}
            onDismiss={handleCloseModal}
            stakingInfo={stakingInfo}
            userLiquidityUnstaked={userLiquidityUnstaked}
          />
          <UnstakingModal
            isOpen={modalType === STAKING_MODAL_TYPE.UNSTAKE}
            onDismiss={handleCloseModal}
            stakingInfo={stakingInfo}
          />
          <ClaimRewardModal
            isOpen={modalType === STAKING_MODAL_TYPE.CLAIM}
            onDismiss={handleCloseModal}
            stakingInfo={stakingInfo}
          />
        </>
      )}
      {!modalType && (
        <GridWrapper>
          <ClaimRewardWrapper>
            <AutoColumn gap="25px">
              <RowBetween>
                <OptionCard>
                  <AutoRow>
                    {Logos[lptType]}
                    {lptType}
                  </AutoRow>
                </OptionCard>

                <APYCard>
                  <RowBetween>
                    <TYPE.smallGray fontSize={14}>APY</TYPE.smallGray>
                    {stakingInfo && lptType !== LPT_TYPE.MATTER_CALL_MATTER && (
                      <TYPE.body fontSize={20}>
                        {`${stakingInfo?.apy.divide('10000000000000000').quotient} %`}
                      </TYPE.body>
                    )}
                  </RowBetween>
                </APYCard>
              </RowBetween>
              <TYPE.darkGray fontSize={20} fontWeight={400}>
                Your Staking Rewards Estimation
              </TYPE.darkGray>
              <TYPE.largeHeader
                display="flex"
                fontSize={58}
                fontWeight={400}
                style={{ marginTop: 'auto', alignItems: 'flex-end' }}
              >
                <CountUp
                  key={countUpAmount}
                  isCounting
                  decimalPlaces={2}
                  start={parseFloat(countUpAmountPrevious)}
                  end={parseFloat(countUpAmount)}
                  thousandsSeparator={','}
                  duration={1}
                />
                <TYPE.body
                  style={{ whiteSpace: 'nowrap', marginLeft: 8, marginBottom: 12 }}
                  fontSize={14}
                  fontWeight={400}
                  fontFamily="Roboto"
                >
                  Matter Option Token
                </TYPE.body>
              </TYPE.largeHeader>
              <ButtonPrimary height="48px" width="100%" onClick={handleModalClick(STAKING_MODAL_TYPE.CLAIM)}>
                Claim Rewards
              </ButtonPrimary>
              <RowBetween>
                <TYPE.darkGray fontSize={14} fontWeight={400}>
                  Token LPT Staked
                </TYPE.darkGray>
                <NumberUnitText
                  number={stakingInfo?.totalStakedAmount.toSignificant(4, { groupSeparator: ',' })}
                  unit="LPT"
                />
              </RowBetween>
              <RowBetween>
                <TYPE.darkGray style={{ whiteSpace: 'nowrap' }} fontSize={14} fontWeight={400}>
                  Total Network Rewards Per Day
                  <QuestionHelper
                    text={`+MATTER($1) 
                       Matter Option Token`}
                  />
                </TYPE.darkGray>
                {lptType === LPT_TYPE.MATTER_CALL_MATTER ? (
                  <NumberUnitText number={'pending'} unit="" />
                ) : (
                  <NumberUnitText number={LPT_RewardPerDay[lptType]} unit="Matter Option Token" />
                )}
              </RowBetween>
            </AutoColumn>
          </ClaimRewardWrapper>
          <LPTWrapper>
            <section>
              <AutoColumn gap="19px">
                <TYPE.darkGray fontSize={14} fontWeight={400}>
                  Your Stake
                </TYPE.darkGray>
                <NumberUnitText number={stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'} unit="LPT" />
                <ButtonPrimary width="100%" onClick={handleModalClick(STAKING_MODAL_TYPE.UNSTAKE)}>
                  Unstake LPT
                </ButtonPrimary>
              </AutoColumn>
            </section>
            <section>
              <AutoColumn gap="19px">
                <TYPE.darkGray fontSize={14} fontWeight={400}>
                  Your Balance
                </TYPE.darkGray>
                <NumberUnitText number={userLiquidityUnstaked?.toSignificant(6) ?? '-'} unit="LPT" />
                <ButtonPrimary width="100%" onClick={handleModalClick(STAKING_MODAL_TYPE.STAKE)}>
                  Stake LPT
                </ButtonPrimary>
              </AutoColumn>
            </section>
          </LPTWrapper>
        </GridWrapper>
      )}
    </>
  )
}
