import React from 'react'
import styled from 'styled-components'
import AppBody from 'pages/AppBody'
import { AutoRow, RowBetween } from 'components/Row'
import { TYPE } from 'theme'
import { AutoColumn } from 'components/Column'
//import antimatterLogo from 'assets/svg/antimatter_background_logo.svg'
import { useAllOptionTypes } from '../../state/market/hooks'
import { ChainId, WETH } from '@uniswap/sdk'
import { parseBalance } from '../../utils/marketStrategyUtils'
import PriceItem from './PriceItem'
import AssetItem from './AssetItem'

export function NumberWithUnit({ unit, number }: { unit: string; number: string }) {
  return (
    <TYPE.main fontWeight={500} fontSize={24}>
      {number} <span style={{ fontSize: '16px' }}>&nbsp;{unit}</span>
    </TYPE.main>
  )
}
export const Divider = styled.div`
  width: 100%;
  height: 0;
  margin: 12px 0 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.bg4};
`

export default function Info() {
  // const theme = useTheme()
  // const values = useValues()
  const optionTypes = useAllOptionTypes()
  // const allValue = useMemo(() => {
  //   if (!values || values.length === 0) return undefined
  //   return values?.reduce((pre, cur) => {
  //     return {
  //       priceUnderlying: JSBI.add(JSBI.BigInt(pre.priceUnderlying), JSBI.BigInt(cur.priceUnderlying)).toString(),
  //       valueReserve: JSBI.add(JSBI.BigInt(pre.valueReserve), JSBI.BigInt(cur.valueReserve)).toString()
  //     }
  //   })
  // }, [values])

  // const countUpAmountPrevious = '0'
  return (
    <AppBody style={{ maxWidth: '640px' }}>
      <AutoRow justify="center">
        <TYPE.mediumHeader>Antimatter Info</TYPE.mediumHeader>
      </AutoRow>
      <AutoColumn gap="10px" style={{ marginTop: '20px' }}>
        {/*<TranslucentCard style={{ position: 'relative', overflow: 'hidden' }}>*/}
        {/*  <img*/}
        {/*    src={antimatterLogo}*/}
        {/*    style={{ position: 'absolute', right: '40px', top: '24px', height: '75px' }}*/}
        {/*    alt=""*/}
        {/*  />*/}
        {/*  <AutoColumn gap="16px">*/}
        {/*    <TYPE.smallGray>TOTAL VALUE LOCKED</TYPE.smallGray>*/}
        {/*    <TYPE.main fontWeight={500} fontSize={40} color={theme.primary1}>*/}
        {/*      $*/}
        {/*      <CountUp*/}
        {/*        key={parseBalance({ val: allValue?.valueReserve, token: WETH[ChainId.MAINNET] })}*/}
        {/*        isCounting*/}
        {/*        decimalPlaces={2}*/}
        {/*        start={parseFloat(countUpAmountPrevious)}*/}
        {/*        end={parseFloat(parseBalance({ val: allValue?.valueReserve ?? '0', token: USDT }))}*/}
        {/*        thousandsSeparator={','}*/}
        {/*        duration={1}*/}
        {/*      />*/}
        {/*    </TYPE.main>*/}
        {/*  </AutoColumn>*/}
        {/*</TranslucentCard>*/}

        {optionTypes.map(item => {
          return (
            <>
              <AssetItem optionType={item} />

              <RowBetween>
                <PriceItem
                  address={item.callAddress ?? ''}
                  total={parseBalance({ val: item.callTotal, token: WETH[ChainId.MAINNET] })}
                  isCall
                />
                <div style={{ width: 16, height: '100%' }} />
                <PriceItem
                  address={item.putAddress ?? ''}
                  total={parseBalance({ val: item.putTotal, token: WETH[ChainId.MAINNET] })}
                />
              </RowBetween>
            </>
          )
        })}
      </AutoColumn>
    </AppBody>
  )
}
