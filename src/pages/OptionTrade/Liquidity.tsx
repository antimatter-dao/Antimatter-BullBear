import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Currency, CurrencyAmount, Pair } from '@uniswap/sdk'
import AddLiquidity from 'pages/AddLiquidity'
import { AutoColumn } from 'components/Column'
import { OptionInterface } from './'
import { FullPositionCardMini } from '../../components/PositionCard'
import { TYPE } from '../../theme'
import { OutlineCard } from '../../components/Card'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { Dots } from '../../components/swap/styleds'
import RemoveLiquidity from 'pages/RemoveLiquidity'
import SettingsTab from 'components/Settings'
import { useActiveWeb3React } from 'hooks'
import CurrencyLogo from 'components/CurrencyLogo'
import { useDerivedMintInfo } from 'state/mint/hooks'
import { Field } from 'state/mint/actions'

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
  option
}: {
  currencyA?: Currency | null
  currencyB?: Currency | null
  option?: OptionInterface
}) {
  const [liquidityState, setLiquidityState] = useState<LiquidityState>(LiquidityState.ADD)

  const { pair, currencyBalances } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)
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
        <OverallLiquidity
          currencyA={currencyA ?? undefined}
          currencyB={currencyB ?? undefined}
          currencyAmounts={currencyBalances}
          tokenTitle={option?.title}
        />
        <LiquidityInfo onRemove={handleRemove} pair={pair ?? undefined} />
      </AdvanceInfoWrapper>
    </Wrapper>
  )
}

function OverallLiquidity({
  currencyA,
  currencyB,
  currencyAmounts,
  tokenTitle
}: {
  currencyA?: Currency
  currencyB?: Currency
  tokenTitle?: string
  currencyAmounts: {
    [filed in Field]?: CurrencyAmount | undefined
  }
}) {
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
              {currencyB && <CurrencyLogo currency={currencyB} />}
              <span>
                {currencyAmounts[Field.CURRENCY_B]?.toFixed()}&nbsp;{tokenTitle}
              </span>
            </AutoRow>
          </TYPE.body>
          <TYPE.body>
            <AutoRow gap="10px">
              {currencyA && <CurrencyLogo currency={currencyA} />}
              <span>
                {currencyAmounts[Field.CURRENCY_A]?.toFixed()}&nbsp; {currencyA?.symbol}
              </span>
            </AutoRow>
          </TYPE.body>
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
      {account && (
        <>
          {pair ? (
            <FullPositionCardMini pair={pair} onRemove={onRemove} />
          ) : (
            <EmptyProposals>
              <TYPE.darkGray textAlign="center">
                <Dots>Loading</Dots>
              </TYPE.darkGray>
              {/* <TYPE.darkGray textAlign="center">No liquidity found</TYPE.darkGray> */}
            </EmptyProposals>
          )}
        </>
      )}
    </SectionWrapper>
  )
}
