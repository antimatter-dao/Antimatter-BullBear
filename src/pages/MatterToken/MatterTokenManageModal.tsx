/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, useState } from 'react'
import { AutoColumn } from '../../components/Column'
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
import { LPT_TYPE, LPT_PAIRS, LPT_RewardPerDay } from 'constants/matterToken/matterTokenTokens'
import QuestionHelper from '../../components/QuestionHelper'
import { ReactComponent as Logo1 } from 'assets/svg/ETH+_USDT.svg'
import { ReactComponent as Logo2 } from 'assets/svg/ETH-_USDT.svg'
import { ReactComponent as Logo3 } from 'assets/svg/ETH_Matter.svg'
import { ReactComponent as Logo4 } from 'assets/svg/Matter+_matter.svg'
import { AutoRow } from 'components/Row'
import Card from 'components/Card'

const sectionPadding = '32px'
const GridWrapper = styled.div`
  background: ${({ theme }) => theme.gradient2};
  height: 360px;
  border-radius: 36px;
  border: 1px solid ${({ theme }) => theme.bg3};
  display: flex;
`

const ClaimRewardWrapper = styled.div`
  height: 100%;
  width: fit-content;
  border-right: 1px solid ${({ theme }) => theme.bg3};
  padding: ${sectionPadding};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
const OptionCard = styled(Card)`
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 14px;
  padding: 14px;
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
  flex-direction: column;
  & > div {
    width: 100%;
    display: flex;
    flex-grow: 1;
    :first-child {
      height: 37%;
      flex-grow: 0;
      border-bottom: 1px solid ${({ theme }) => theme.bg3};
    }
    & > section {
      width: 309px;
      height: 100%;
      padding: ${sectionPadding};
      :first-child {
        border-right: 1px solid ${({ theme }) => theme.bg3};
      }
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
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
  // const [lptType, setLptType] = useState<LPT_TYPE>(LPT_TYPE.ETH_CALL_DAI)
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
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            <AutoColumn style={{ width: '330px', marginBottom: '20px' }}>
              <OptionCard>
                <AutoRow>
                  {Logos[lptType]}
                  {lptType}
                </AutoRow>
              </OptionCard>
            </AutoColumn>
            <GridWrapper>
              <ClaimRewardWrapper>
                <TYPE.darkGray fontSize={20} fontWeight={400} width={260}>
                  Your Staking Rewards Estimation
                </TYPE.darkGray>
                <TYPE.largeHeader
                  display="flex"
                  fontSize={58}
                  fontWeight={400}
                  style={{ marginTop: 'auto', marginBottom: 48, alignItems: 'flex-end' }}
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
                    style={{ whiteSpace: 'nowrap', marginBottom: 12, marginLeft: 8 }}
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
              </ClaimRewardWrapper>
              <LPTWrapper>
                <div>
                  <section style={{ paddingBottom: 20 }}>
                    <TYPE.darkGray fontSize={14} fontWeight={400}>
                      Token LPT Staked
                    </TYPE.darkGray>
                    <NumberUnitText
                      number={stakingInfo?.totalStakedAmount.toSignificant(4, { groupSeparator: ',' })}
                      unit="LPT"
                    />
                  </section>
                  <section style={{ paddingBottom: 20 }}>
                    <TYPE.darkGray style={{ whiteSpace: 'nowrap' }} fontSize={14} fontWeight={400}>
                      Total Network Rewards Per Day
                      <QuestionHelper
                        text={`+MATTER($1) 
                       Matter Option Token`}
                      />
                    </TYPE.darkGray>
                    {/* <NumberUnitText
                      number={
                        stakingInfo?.active
                          ? stakingInfo?.totalRewardRate
                              ?.multiply(BIG_INT_SECONDS_IN_WEEK)
                              ?.toFixed(0, { groupSeparator: ',' }) ?? '-'
                          : '0'
                      }
                      unit="Matter Option Token"
                    /> */}{' '}
                    <NumberUnitText number={LPT_RewardPerDay[lptType]} unit="Matter Option Token" />
                  </section>
                </div>
                <div>
                  <section>
                    <TYPE.darkGray fontSize={14} fontWeight={400}>
                      Your Balance
                    </TYPE.darkGray>
                    <NumberUnitText number={userLiquidityUnstaked?.toSignificant(6) ?? '-'} unit="LPT" />
                    <ButtonPrimary width="100%" onClick={handleModalClick(STAKING_MODAL_TYPE.STAKE)}>
                      Stake LPT
                    </ButtonPrimary>
                  </section>
                  <section>
                    <TYPE.darkGray fontSize={14} fontWeight={400}>
                      Your Stake
                    </TYPE.darkGray>
                    <NumberUnitText number={stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'} unit="LPT" />
                    <ButtonPrimary width="100%" onClick={handleModalClick(STAKING_MODAL_TYPE.UNSTAKE)}>
                      Unstake LPT
                    </ButtonPrimary>
                  </section>
                </div>
              </LPTWrapper>
            </GridWrapper>
          </div>
        </div>
      )}
    </>
  )
}
