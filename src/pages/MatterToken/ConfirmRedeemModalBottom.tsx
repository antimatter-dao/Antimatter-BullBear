import React from 'react'
import { Text } from 'rebass'
import { ButtonPrimary } from '../../components/Button'
import { DeltaData } from '../../state/market/hooks'
import { Currency, Token } from '@uniswap/sdk'
import { GenerateBar } from '../../components/MarketStrategy/GenerateBar'
import { parseBalance } from '../../utils/marketStrategyUtils'
import { TOKEN_TYPES } from '../../components/MarketStrategy/TypeRadioButton'
import { ZERO_ADDRESS } from '../../constants'

export function ConfirmRedeemModalBottom({
  tokenType = TOKEN_TYPES.callPut,
  delta,
  callTyped,
  putTyped,
  currencyA,
  currencyB,
  onRedeem
}: {
  tokenType?: string
  delta?: DeltaData | undefined
  callTyped?: string
  putTyped?: string
  currencyA?: Currency | undefined | null
  currencyB?: Currency | undefined | null
  onRedeem: () => void
}) {
  return (
    <>
      <GenerateBar
        cardTitle={``}
        subTitle="Output Token"
        callVol={parseBalance({ val: delta?.dUnd, token: new Token(1, ZERO_ADDRESS, currencyA?.decimals ?? 18) })}
        putVol={parseBalance({ val: delta?.dCur, token: new Token(1, ZERO_ADDRESS, currencyB?.decimals ?? 18) })}
        currency0={currencyA ?? undefined}
        currency1={currencyB ?? undefined}
      />
      <GenerateBar
        tokenType={tokenType}
        cardTitle={``}
        subTitle="Input Token"
        callTitle={'You will pay'}
        putTitle={'You will pay'}
        callVol={callTyped}
        putVol={putTyped}
        currency0={undefined}
        currency1={undefined}
      />
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onRedeem}>
        <Text fontWeight={400} fontSize={16}>
          Confirm Generation
        </Text>
      </ButtonPrimary>
    </>
  )
}
