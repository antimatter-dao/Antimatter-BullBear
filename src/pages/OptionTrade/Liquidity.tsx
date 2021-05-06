import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Currency, Pair } from '@uniswap/sdk'
import AddLiquidity from 'pages/AddLiquidity'
import { AutoColumn } from 'components/Column'
import { OptionInterface } from './'
import { FullPositionCardMini } from '../../components/PositionCard'
import { TYPE } from '../../theme'
import { OutlineCard } from '../../components/Card'
import { RowBetween, RowFixed } from '../../components/Row'
import { usePair } from '../../data/Reserves'
import { Dots } from '../../components/swap/styleds'
import RemoveLiquidity from 'pages/RemoveLiquidity'
import SettingsTab from 'components/Settings'
import { useActiveWeb3React } from 'hooks'
import CurrencyLogo from 'components/CurrencyLogo'

const Wrapper = styled.div`
  min-height: 100%;
  display: flex;
`

const SectionWrapper = styled(AutoColumn)`
  width: 100%;
  grid-template-rows: min-content min-content;
  grid-gap: 20px;
`

const AdvanceInfoWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 20px 40px;
  grid-template-rows: min-content auto;
`

const EmptyProposals = styled(OutlineCard)`
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 235px;
`

enum LiquidityState {
  ADD = 'add',
  REMOVE = 'remove'
}
export default function Liquidity({
  currencyA,
  currencyB
}: {
  currencyA?: Currency | null
  currencyB?: Currency | null
  option?: OptionInterface
}) {
  const [liquidityState, setLiquidityState] = useState<LiquidityState>(LiquidityState.REMOVE)

  const pair = usePair(currencyA ?? undefined, currencyB ?? undefined)

  const handleAdd = useCallback(() => setLiquidityState(LiquidityState.ADD), [])
  const handleRemove = useCallback(() => setLiquidityState(LiquidityState.REMOVE), [])
  return (
    <Wrapper>
      {liquidityState === LiquidityState.ADD ? (
        <AddLiquidity currencyA={currencyA} currencyB={currencyB} />
      ) : (
        <RemoveLiquidity currencyA={currencyA} currencyB={currencyB} onGoBack={handleAdd} />
      )}
      <AdvanceInfoWrapper gap="lg">
        <OverallLiquidity currencyA={currencyA ?? undefined} currencyB={currencyB ?? undefined} />
        <LiquidityInfo onRemove={handleRemove} pair={pair?.[1] ?? undefined} />
      </AdvanceInfoWrapper>
    </Wrapper>
  )
}

function OverallLiquidity({ currencyA, currencyB }: { currencyA?: Currency; currencyB?: Currency }) {
  return (
    <SectionWrapper>
      <RowBetween>
        <TYPE.mediumHeader fontSize={18}>Total Pooled Tokens</TYPE.mediumHeader>
        <RowFixed>
          <SettingsTab /> <TYPE.darkGray>Liquidity Setting</TYPE.darkGray>
        </RowFixed>
      </RowBetween>
      <OutlineCard>
        <AutoColumn gap="lg">
          <TYPE.body>{currencyB && <CurrencyLogo currency={currencyB} />}</TYPE.body>
          <TYPE.body>{currencyA && <CurrencyLogo currency={currencyA} />}</TYPE.body>
        </AutoColumn>
      </OutlineCard>
    </SectionWrapper>
  )
}

function LiquidityInfo({ onRemove, pair }: { onRemove: () => void; pair: Pair | undefined }) {
  const { account } = useActiveWeb3React()

  return (
    <SectionWrapper>
      <TYPE.mediumHeader fontSize={18} style={{ justifySelf: 'flex-start' }}>
        Your Supply
      </TYPE.mediumHeader>
      {!account && (
        <EmptyProposals>
          <TYPE.darkGray textAlign="center">Connect to a wallet to view your liquidity.</TYPE.darkGray>
        </EmptyProposals>
      )}
      {account && pair ? (
        <FullPositionCardMini pair={pair} onRemove={onRemove} />
      ) : (
        <EmptyProposals>
          <TYPE.darkGray textAlign="center">
            <Dots>Loading</Dots>
          </TYPE.darkGray>
          {/* <TYPE.darkGray textAlign="center">No liquidity found</TYPE.darkGray> */}
        </EmptyProposals>
      )}
    </SectionWrapper>
  )
}
