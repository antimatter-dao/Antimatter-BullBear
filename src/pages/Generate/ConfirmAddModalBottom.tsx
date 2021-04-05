import React from 'react'
import { Text } from 'rebass'
import { ButtonPrimary } from '../../components/Button'
import { DeltaData } from '../../state/market/hooks'
import { Currency } from '@uniswap/sdk'
import { GenerateBar } from '../../components/MarketStrategy/GenerateBar'
import { parseBalance } from '../../utils/marketStrategyUtils'
import { TOKEN_TYPES } from '../../components/MarketStrategy/TypeRadioButton'

export function ConfirmGenerationModalBottom({
  tokenType = TOKEN_TYPES.callPut,
  delta,
  callTyped,
  putTyped,
  currencyA,
  currencyB,
  onGenerate
}: {
  tokenType?: string
  delta?: DeltaData | undefined
  callTyped?: string
  putTyped?: string
  currencyA?: Currency | undefined | null
  currencyB?: Currency | undefined | null
  onGenerate: () => void
}) {
  return (
    <>
      <GenerateBar
        tokenType={tokenType}
        cardTitle={``}
        subTitle="Input Token"
        callTitle={'You will receive'}
        putTitle={'You will receive'}
        callVol={callTyped}
        putVol={putTyped}
        currency0={undefined}
        currency1={undefined}
      />
      <GenerateBar
        cardTitle={``}
        subTitle="Output Token"
        callVol={parseBalance(delta?.dUnd)}
        putVol={parseBalance(delta?.dCur)}
        currency0={currencyA ?? undefined}
        currency1={currencyB ?? undefined}
      />
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onGenerate}>
        <Text fontWeight={400} fontSize={16}>
          Confirm Generation
        </Text>
      </ButtonPrimary>
    </>
  )
}
