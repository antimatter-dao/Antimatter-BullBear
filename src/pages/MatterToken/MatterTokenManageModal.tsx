/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useCallback, useState } from 'react'
import { CountUp } from 'use-count-up'
import styled from 'styled-components'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ButtonText, TYPE } from '../../theme'
import { ButtonPrimary } from '../../components/Button'
import StakingModal from '../../components/earn/StakingModal'
import { useStakingInfo } from '../../state/stake/hooks'
import UnstakingModal from '../../components/earn/UnstakingModal'
import ClaimRewardModal from '../../components/earn/ClaimRewardModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { usePair } from '../../data/Reserves'
import usePrevious from '../../hooks/usePrevious'
// import { BIG_INT_SECONDS_IN_WEEK } from '../../constants'
import { LPT_PAIRS, LPT_TYPE } from 'constants/matterToken/matterTokenTokens'
// import { ReactComponent as Logo1 } from 'assets/svg/ETH+_USDT.svg'
// import { ReactComponent as Logo2 } from 'assets/svg/ETH-_USDT.svg'
// import { ReactComponent as Logo3 } from 'assets/svg/ETH_Matter.svg'
// import { ReactComponent as Logo4 } from 'assets/svg/Matter+_matter.svg'
import { AutoRow, RowBetween } from 'components/Row'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import useTheme from 'hooks/useTheme'
// import { ReactComponent as ETH } from 'assets/svg/eth_logo.svg'
import DoubleCurrencyLogoReverse from 'components/DoubleLogo/DoubleLogoReverse'
import { useCurrency } from 'hooks/Tokens'
import JSBI from 'jsbi'

const sectionPadding = '25px'
export const cardWidth = '380px'

const GridWrapper = styled.div`
  background: ${({ theme }) => theme.gradient2};
  border-radius: 36px;
  border: 1px solid ${({ theme }) => theme.bg3};
  display: flex;
  flex-direction: column;
  width: ${cardWidth};
  ${({ theme }) => theme.mediaWidth.upToMedium`  width: 100%;`};
`

const ClaimRewardWrapper = styled.div`
  height: 100%;
  width: 100%
  padding: ${sectionPadding};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
const OptionCard = styled(Card)`
  padding: 0;
`
// const LPTWrapper = styled.div`
//   height: 100%;
//   flex-grow: 1;
//   display: flex;

//   section {
//     width: 50%
//     height: 100%;
//     padding: ${sectionPadding};
//     :first-child {
//       border-right: 1px solid ${({ theme }) => theme.bg3};
//     }
//   }
// `
// const APYCard = styled(OutlineCard)`
//   border-radius: 10px;
//   padding: 9px;
//   min-width: 122px;
//   width: fit-content;
// `
// const LogoWrapper = styled.div`
//   border-radius: 50%;
//   width: 32px;
//   height: 32px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   margin-right: 10px;
//   background-color: ${({ theme }) => theme.text1};
//   svg {
//     width: 30px;
//     height: 30px;
//   }
// `
// const AccordionStyle = styled.div`
//   width: 100%;
//   position: relative;
//   button {
//     padding: 14px 2rem 0;
//     display: flex;
//     justify-content: space-between
//   }
//   & > div {
//     width: 100%
//     padding: 10px 32px 20px;
//     display: grid;
//     grid-template-columns: 100%;
//     grid-gap: 16px;
//   }
// `

// const Network = styled.div`
//   border: 1px solid ${({ theme }) => theme.text5};
//   padding: 5px 8px 5px 5px;
//   border-radius: 4px;
//   display: flex;
//   align-items: center;
//   svg {
//     height: 20px;
//     width: 20px;
//     margin-right: 5px;
//   }
// `

enum STAKING_MODAL_TYPE {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  CLAIM = 'claim'
}

// function NumberUnitText({ number, unit }: { number: string; unit: string }) {
//   return (
//     <div
//       style={{
//         fontWeight: 500,
//         fontSize: '26px',
//         fontFamily: 'Futura PT',
//         overflowWrap: 'anywhere',
//         lineHeight: '26px'
//       }}
//     >
//       {number}
//       <span
//         style={{
//           marginLeft: '8px',
//           fontFamily: 'Roboto',
//           fontWeight: 400,
//           fontSize: '14px',
//           whiteSpace: 'nowrap'
//         }}
//       >
//         {unit}
//       </span>
//     </div>
//   )
// }

// const Logos = {
//   [LPT_TYPE.ETH_CALL_DAI]: <Logo1 />,
//   [LPT_TYPE.ETH_PUT_DAI]: <Logo2 />,
//   [LPT_TYPE.MATTER_ETH]: <Logo3 />,
//   [LPT_TYPE.MATTER_CALL_MATTER]: <Logo4 />
// }

export default function MatterTokenManageModal({ lptType }: { lptType: LPT_TYPE }) {
  const [modalType, setModalType] = useState<STAKING_MODAL_TYPE | undefined>(undefined)
  const { account, chainId } = useActiveWeb3React()
  const theme = useTheme()
  // get currencies and pair
  const [tokenA, tokenB] = [LPT_PAIRS[chainId ?? 1]?.[lptType].currencyA, LPT_PAIRS[chainId ?? 1]?.[lptType].currencyB]
  const [, stakingTokenPair] = usePair(tokenA, tokenB)
  const stakingInfo = useStakingInfo(stakingTokenPair)?.[0]
  const currency0 = useCurrency(tokenA?.address)
  const currency1 = useCurrency(tokenB?.address)
  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  // const showAddLiquidityButton = Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  // const countUpAmount = stakingInfo?.active ? stakingInfo?.earnedAmount?.toSignificant(6) ?? '-' : '0'
  const countUpAmount = stakingInfo?.apy
    ? JSBI.toNumber(stakingInfo.apy.divide('10000000000000000').quotient).toString()
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
      {!modalType && (
        <GridWrapper>
          <ClaimRewardWrapper>
            <AutoColumn gap="20px">
              <RowBetween>
                <OptionCard>
                  <RowBetween>
                    <AutoRow>
                      <DoubleCurrencyLogoReverse
                        currency0={currency0 ?? undefined}
                        currency1={currency1 ?? undefined}
                        size={28}
                        mr="10px"
                      />

                      <TYPE.small fontSize={12}>{lptType}</TYPE.small>
                    </AutoRow>
                    <ButtonText
                      onClick={handleModalClick(STAKING_MODAL_TYPE.CLAIM)}
                      color={theme.primary1}
                      style={{ whiteSpace: 'nowrap', fontSize: 12 }}
                    >
                      Claim Rewards
                    </ButtonText>
                    {/* <Network>
                      <ETH />
                      <TYPE.small>ETH</TYPE.small>
                    </Network> */}
                  </RowBetween>
                </OptionCard>
                {/* <APYCard>
                  <RowBetween>
                    <TYPE.smallGray fontSize={14}>APY</TYPE.smallGray>
                    {stakingInfo && lptType !== LPT_TYPE.MATTER_CALL_MATTER && (
                      <TYPE.body fontSize={20}>
                        {`${stakingInfo?.apy.divide('10000000000000000').quotient} %`}
                      </TYPE.body>
                    )}
                  </RowBetween>
                </APYCard> */}
              </RowBetween>
              <div style={{ width: '100%', height: 0, borderBottom: `1px solid ${theme.bg5}` }} />
              <RowBetween style={{ alignItems: 'flex-end' }}>
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
                  %
                  <TYPE.body
                    style={{ whiteSpace: 'nowrap', marginLeft: 8, marginBottom: 12 }}
                    fontSize={16}
                    fontWeight={400}
                    fontFamily="Roboto"
                  >
                    APY
                  </TYPE.body>
                </TYPE.largeHeader>
                <AutoColumn style={{ marginBottom: 12, textAlign: 'right' }}>
                  <TYPE.smallGray> Token Earned</TYPE.smallGray>
                  <TYPE.body>
                    {stakingInfo?.active ? stakingInfo?.earnedAmount?.toSignificant(6) ?? '-' : '0'}
                  </TYPE.body>
                </AutoColumn>
              </RowBetween>

              {/* <RowBetween style={{ alignItems: 'flex-end' }}>
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
                    fontSize={16}
                    fontWeight={400}
                    fontFamily="Roboto"
                  >
                    Token Earned
                  </TYPE.body>
                </TYPE.largeHeader>
              </RowBetween> */}
              <RowBetween>
                <ButtonPrimary width="48%" onClick={handleModalClick(STAKING_MODAL_TYPE.STAKE)}>
                  Stake LPT
                </ButtonPrimary>
                <ButtonPrimary width="48%" onClick={handleModalClick(STAKING_MODAL_TYPE.UNSTAKE)}>
                  Unstake LPT
                </ButtonPrimary>
              </RowBetween>

              <AutoColumn gap="10px">
                {[
                  {
                    title: 'Your Stake',
                    content: stakingInfo ? `${stakingInfo.stakedAmount?.toSignificant(6)} LPT` : '-'
                  },
                  {
                    title: 'Pooled Total',
                    content: stakingInfo
                      ? `${stakingInfo.totalStakedAmount.toSignificant(4, { groupSeparator: ',' })} LPT`
                      : '-'
                  }
                ].map(({ title, content }) => (
                  <RowBetween key={title}>
                    <TYPE.smallGray>{title}</TYPE.smallGray>
                    <TYPE.small> {content}</TYPE.small>
                  </RowBetween>
                ))}
              </AutoColumn>

              {/* <RowBetween>
                <TYPE.darkGray fontSize={14} fontWeight={400}>
                  Token LPT Staked
                </TYPE.darkGray>
                <NumberUnitText
                  number={stakingInfo?.totalStakedAmount.toSignificant(4, { groupSeparator: ',' })}
                  unit="LPT"
                />
              </RowBetween> */}
              {/* <RowBetween>
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
              </RowBetween> */}
            </AutoColumn>
          </ClaimRewardWrapper>

          {/* <Accordion
            title="Statistics"
            data={[
              {
                title: 'APY',
                content: stakingInfo ? `${stakingInfo.apy.divide('10000000000000000').quotient} %` : '-'
              },
              { title: 'Your Stake', content: stakingInfo ? `${stakingInfo.stakedAmount?.toSignificant(6)} LPT` : '-' },
              {
                title: 'Pooled Total',
                content: stakingInfo
                  ? `${stakingInfo.totalStakedAmount.toSignificant(4, { groupSeparator: ',' })} LPT`
                  : '-'
              }
            ]}
          /> */}
          {/* <LPTWrapper>
            <section>
              <AutoColumn gap="19px">
                <TYPE.darkGray fontSize={14} fontWeight={400}>
                  Your Stake
                </TYPE.darkGray>
                <NumberUnitText number={stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'} unit="LPT" />
              </AutoColumn>
            </section>
            <section>
              <AutoColumn gap="19px">
                <TYPE.darkGray fontSize={14} fontWeight={400}>
                  Your Balance
                </TYPE.darkGray>
                <NumberUnitText number={userLiquidityUnstaked?.toSignificant(6) ?? '-'} unit="LPT" />
              </AutoColumn>
            </section>
          </LPTWrapper> */}
        </GridWrapper>
      )}
    </>
  )
}

// function Accordion({ title, data }: { title: string; data: { title: string; content: string }[] }) {
//   const [isOpen, setIsOpen] = useState(false)
//   const handleOpen = useCallback(() => setIsOpen(open => !open), [setIsOpen])
//   return (
//     <AccordionStyle>
//       <ButtonEmpty onClick={handleOpen}>
//       <ButtonEmpty>
//         <span>{title}</span>
//         <ChevronDown
//         style={{
//           transform: isOpen ? 'rotate(180deg)' : 'none',
//           transition: 'none'
//         }}
//         />
//       </ButtonEmpty>
//       {isOpen && (
//       <div>
//         {data.map(({ title, content }) => (
//           <RowBetween key={title}>
//             <TYPE.smallGray>{title}</TYPE.smallGray>
//             <TYPE.small> {content}</TYPE.small>
//           </RowBetween>
//         ))}
//       </div>
//        )}
//     </AccordionStyle>
//   )
// }
