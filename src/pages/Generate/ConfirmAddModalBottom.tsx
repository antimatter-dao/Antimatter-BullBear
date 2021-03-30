import React from 'react'
import { Text } from 'rebass'
import { ButtonPrimary } from '../../components/Button'
import { DeltaData } from '../../state/market/hooks'
import { Currency, Token, TokenAmount } from '@uniswap/sdk'
import { ZERO_ADDRESS } from '../../constants'
import { GenerateBar } from '../../components/MarketStrategy/GenerateBar'

export function ConfirmGenerationModalBottom({
  delta,
  callTyped,
  putTyped,
  currencyA,
  currencyB,
  onGenerate
}: {
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
        cardTitle={`You will pay`}
        callVol={new TokenAmount(
          new Token(1, ZERO_ADDRESS, currencyA?.decimals ?? 18),
          delta?.dUnd.toString() ?? '0'
        )?.toSignificant(4)}
        putVol={new TokenAmount(
          new Token(1, ZERO_ADDRESS, currencyB?.decimals ?? 18),
          delta?.dCur.toString() ?? '0'
        )?.toSignificant(4)}
        currency0={undefined}
        currency1={undefined}
      />
      <GenerateBar
        cardTitle={`you will get`}
        callVol={callTyped}
        putVol={putTyped}
        currency0={currencyA ?? undefined}
        currency1={currencyB ?? undefined}
      />
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onGenerate}>
        <Text fontWeight={500} fontSize={20}>
          Confirm Generation
        </Text>
      </ButtonPrimary>
    </>
  )
}
