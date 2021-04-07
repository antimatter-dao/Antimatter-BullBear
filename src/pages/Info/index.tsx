import React from 'react'
import AppBody from 'pages/AppBody'
import { AutoRow, RowBetween } from 'components/Row'
import { TYPE } from 'theme'
import { AutoColumn } from 'components/Column'
import { TranslucentCard } from 'components/Card'
import useTheme from 'hooks/useTheme'
import antimatterLogo from 'assets/svg/antimatter_background_logo.svg'

function NumberWithUnit({ unit, number }: { unit: string; number: string }) {
  return (
    <TYPE.main fontWeight={500} fontSize={24}>
      {number} <span style={{ fontSize: '16px' }}>&nbsp;{unit}</span>
    </TYPE.main>
  )
}

export default function Info() {
  const theme = useTheme()
  return (
    <AppBody style={{ maxWidth: '640px' }}>
      <AutoRow justify="center">
        <TYPE.mediumHeader>Antimatter Info</TYPE.mediumHeader>
      </AutoRow>
      <AutoColumn gap="10px" style={{ marginTop: '20px' }}>
        <TranslucentCard style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src={antimatterLogo}
            style={{ position: 'absolute', right: '-15px', top: '-5px', height: '100%' }}
            alt=""
          ></img>
          <AutoColumn gap="16px">
            <TYPE.smallGray>Total Value Locked</TYPE.smallGray>
            <TYPE.main fontWeight={500} fontSize={40} color={theme.primary1}>
              $ 1 000 000
            </TYPE.main>
          </AutoColumn>
        </TranslucentCard>
        <TranslucentCard>
          <RowBetween>
            <div style={{ width: '50%' }}>
              <AutoColumn gap="3px">
                <TYPE.smallGray>Total number of call tokens ($1000)</TYPE.smallGray>
                <TYPE.main fontWeight={500} fontSize={24}>
                  200
                </TYPE.main>
              </AutoColumn>
            </div>
            <div style={{ width: '50%' }}>
              <AutoColumn gap="3px">
                <TYPE.smallGray>Total number of put tokens ($3000)</TYPE.smallGray>
                <TYPE.main fontWeight={500} fontSize={24}>
                  200
                </TYPE.main>
              </AutoColumn>
            </div>
          </RowBetween>
        </TranslucentCard>
        <TranslucentCard>
          <RowBetween>
            <div style={{ width: '50%' }}>
              <AutoColumn gap="3px">
                <TYPE.smallGray>Price of call tokens ($1000)</TYPE.smallGray>
                <NumberWithUnit number="2000" unit="USDT" />
              </AutoColumn>
            </div>
            <div style={{ width: '50%' }}>
              <AutoColumn gap="3px">
                <TYPE.smallGray>Price of put tokens ($3000)</TYPE.smallGray>
                <NumberWithUnit number="2000" unit="USDT" />
              </AutoColumn>
            </div>
          </RowBetween>
        </TranslucentCard>
        <TranslucentCard>
          <AutoColumn gap="16px">
            <TYPE.smallGray>Underlying asset</TYPE.smallGray>
            <AutoRow>
              {' '}
              <NumberWithUnit number="10 000" unit="ETH" />
              <TYPE.main fontWeight={500} fontSize={24} style={{ display: 'flex' }}>
                &nbsp;:&nbsp;
              </TYPE.main>
              <NumberWithUnit number="10 000" unit="USDT" />
            </AutoRow>
          </AutoColumn>
        </TranslucentCard>
      </AutoColumn>
    </AppBody>
  )
}
