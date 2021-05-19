import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Currency, Pair } from '@uniswap/sdk'
import AddLiquidity from 'pages/AddLiquidity'
import { AutoColumn } from 'components/Column'
import { FullPositionCardMini } from '../../components/PositionCard'
import { TYPE } from '../../theme'
import { OutlineCard } from '../../components/Card'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
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
  currencyB,
  pair
}: {
  currencyA?: Currency | null
  currencyB?: Currency | null
  pair: Pair | null | undefined
}) {
  const [liquidityState, setLiquidityState] = useState<LiquidityState>(LiquidityState.ADD)

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
        <OverallLiquidity pair={pair} />
        <LiquidityInfo onRemove={handleRemove} pair={pair} />
      </AdvanceInfoWrapper>
    </Wrapper>
  )
}

function OverallLiquidity({ pair }: { pair: Pair | undefined | null }) {
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
          <TYPE.body>
            <AutoRow gap="10px">
              {pair?.token0 && <CurrencyLogo currency={pair.token0} />}
              <span>
                {pair ? pair.reserve0.toFixed() : '-'}&nbsp;{pair?.token0?.symbol}
              </span>
            </AutoRow>
          </TYPE.body>
          <TYPE.body>
            <AutoRow gap="10px">
              {pair?.token1 && <CurrencyLogo currency={pair.token1} />}
              <span>
                {pair ? pair.reserve1.toFixed() : '-'}&nbsp; {pair?.token1?.symbol}
              </span>
            </AutoRow>
          </TYPE.body>
        </AutoColumn>
      </OutlineCard>
    </SectionWrapper>
  )
}

function LiquidityInfo({ onRemove, pair }: { onRemove: () => void; pair: Pair | undefined | null }) {
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
      {account && (
        <>
          {pair ? (
            <FullPositionCardMini pair={pair} onRemove={onRemove} />
          ) : (
            <EmptyProposals>
              <TYPE.darkGray textAlign="center">
                {pair === null ? <>No pool available</> : <Dots>Loading</Dots>}
              </TYPE.darkGray>
              {/* <TYPE.darkGray textAlign="center">No liquidity found</TYPE.darkGray> */}
            </EmptyProposals>
          )}
        </>
      )}
    </SectionWrapper>
  )
}
