import React, { useMemo } from 'react'
import { useOptionTypeCount } from '../../state/market/hooks'
import AppBody from '../AppBody'
import FullPositionCard from '../../components/PositionCard'

export function Liquidity() {
  const optionCount = useOptionTypeCount()

  const optionIndexes = useMemo(() => {
    return Array.from({ length: optionCount }, (v, i) => i.toString())
  }, [optionCount])

  return (
    <AppBody style={{ width: '560px' }}>
      {optionIndexes.map(item => {
        return <FullPositionCard key={item} index={item} />
      })}
    </AppBody>
  )
}
