import React from 'react'
import { AutoColumn } from '../../components/Column'
import { TYPE } from '../../theme'
import { NumberWithUnit } from './index'
import { TranslucentCard } from '../../components/Card'
import { OptionTypeData } from '../../state/market/hooks'
import { parseBalance } from '../../utils/marketStrategyUtils'
import { AutoRow } from '../../components/Row'
import { useToken } from '../../hooks/Tokens'
import { useTokenBalance } from '../../state/wallet/hooks'

export default function AssetItem({ optionType }: { optionType: OptionTypeData }) {
  const underlyingToken = useToken(optionType.underlying)
  const currencyToken = useToken(optionType.currency)
  const underlyingBalance = useTokenBalance(optionType.callAddress, underlyingToken ?? undefined)
  const currencyBalance = useTokenBalance(optionType.putAddress, currencyToken ?? undefined)

  return (
    <TranslucentCard>
      <AutoColumn gap="16px">
        {currencyToken && (
          <TYPE.smallGray>
            {optionType.underlyingSymbol ?? '-'}(
            {parseBalance({ val: optionType.priceFloor, token: currencyToken }) ?? '-'}$
            {parseBalance({ val: optionType.priceCap, token: currencyToken }) ?? '-'}) underlying asset
          </TYPE.smallGray>
        )}

        <AutoRow>
          <NumberWithUnit
            number={underlyingBalance?.toFixed(2, { groupSeparator: ',' }) ?? '-'}
            unit={optionType.underlyingSymbol ?? '-'}
          />
          <TYPE.main fontWeight={500} fontSize={24} style={{ display: 'flex' }}>
            &nbsp;:&nbsp;
          </TYPE.main>
          <NumberWithUnit
            number={currencyBalance?.toFixed(2, { groupSeparator: ',' }) ?? '-'}
            unit={optionType.currencySymbol ?? ''}
          />
        </AutoRow>
      </AutoColumn>
    </TranslucentCard>
  )
}
