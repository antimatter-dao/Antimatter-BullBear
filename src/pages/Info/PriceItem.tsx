import React from 'react'
import { AutoColumn } from '../../components/Column'
import { TYPE } from '../../theme'
import { Divider, NumberWithUnit } from './index'
import { useCurrency } from '../../hooks/Tokens'
import { TranslucentCard } from '../../components/Card'
import { ReactComponent as CallToken } from '../../assets/svg/call_token.svg'
import { ReactComponent as PutToken } from '../../assets/svg/put_token.svg'
import { useUSDTPrice } from '../../utils/useUSDCPrice'

export default function PriceItem({ address, total, isCall }: { address: string; total: string; isCall?: boolean }) {
  const currency = useCurrency(address)
  const price = useUSDTPrice(currency ?? undefined)
  return (
    <TranslucentCard>
      <AutoColumn>
        <div>
          <AutoColumn gap="9px">
            <TYPE.smallGray>TOTAL NUMBER OF {currency?.symbol}</TYPE.smallGray>
            <TYPE.main fontWeight={500} fontSize={24}>
              {isCall ? <CallToken style={{ marginRight: '12px' }} /> : <PutToken style={{ marginRight: '12px' }} />}
              {total}
            </TYPE.main>
          </AutoColumn>
        </div>
        <Divider />
        <div>
          <AutoColumn gap="9px">
            <TYPE.smallGray>PRICE OF {currency?.symbol}</TYPE.smallGray>
            <NumberWithUnit number={price?.toFixed(2) ?? '-'} unit="USDT" />
          </AutoColumn>
        </div>
      </AutoColumn>
    </TranslucentCard>
  )
}
