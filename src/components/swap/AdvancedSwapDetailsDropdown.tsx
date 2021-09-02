import React from 'react'
import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from './AdvancedSwapDetails'

export default function AdvancedSwapDetailsDropdown({ undTrade, curTrade, ...rest }: AdvancedSwapDetailsProps) {
  return <AdvancedSwapDetails {...rest} undTrade={undTrade} curTrade={curTrade} />
}
