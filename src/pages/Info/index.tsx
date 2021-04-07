import React from 'react'
import styled from 'styled-components'
import AppBody from 'pages/AppBody'
import { AutoRow, RowBetween } from 'components/Row'
import { TYPE } from 'theme'
import { AutoColumn } from 'components/Column'
import { TranslucentCard } from 'components/Card'
import useTheme from 'hooks/useTheme'
import antimatterLogo from 'assets/svg/antimatter_background_logo.svg'
import { ReactComponent as CallToken } from 'assets/svg/call_token.svg'
import { ReactComponent as PutToken } from 'assets/svg/put_token.svg'

function NumberWithUnit({ unit, number }: { unit: string; number: string }) {
  return (
    <TYPE.main fontWeight={500} fontSize={24}>
      {number} <span style={{ fontSize: '16px' }}>&nbsp;{unit}</span>
    </TYPE.main>
  )
}
const Divider = styled.div`
  width: 100%;
  height: 0;
  margin: 12px 0 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.bg4};
`

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
            style={{ position: 'absolute', right: '40px', top: '24px', height: '75px' }}
            alt=""
          ></img>
          <AutoColumn gap="16px">
            <TYPE.smallGray>TOTAL VALUE LOCKED</TYPE.smallGray>
            <TYPE.main fontWeight={500} fontSize={40} color={theme.primary1}>
              $ 1 000 000
            </TYPE.main>
          </AutoColumn>
        </TranslucentCard>
        <TranslucentCard>
          <AutoColumn gap="16px">
            <TYPE.smallGray>UNDERLYING ASSET</TYPE.smallGray>
            <AutoRow>
              <NumberWithUnit number="10 000" unit="ETH" />
              <TYPE.main fontWeight={500} fontSize={24} style={{ display: 'flex' }}>
                &nbsp;:&nbsp;
              </TYPE.main>
              <NumberWithUnit number="10 000" unit="USDT" />
            </AutoRow>
          </AutoColumn>
        </TranslucentCard>

        <RowBetween>
          <TranslucentCard style={{ marginRight: '16px' }}>
            <AutoColumn>
              <div>
                <AutoColumn gap="9px">
                  <TYPE.smallGray>TOTAL NUMBER OF CALL TOKENS ($1000)</TYPE.smallGray>
                  <TYPE.main fontWeight={500} fontSize={24}>
                    <CallToken style={{ marginRight: '12px' }} />
                    200
                  </TYPE.main>
                </AutoColumn>
              </div>
              <Divider />
              <div>
                <AutoColumn gap="9px">
                  <TYPE.smallGray>PRICE OF CALL TOKENS ($1000)</TYPE.smallGray>
                  <NumberWithUnit number="2000" unit="USDT" />
                </AutoColumn>
              </div>
            </AutoColumn>
          </TranslucentCard>

          <TranslucentCard>
            <AutoColumn>
              <div>
                <AutoColumn gap="9px">
                  <TYPE.smallGray>TOTAL NUMBER OF PUT TOKENS ($3000)</TYPE.smallGray>
                  <TYPE.main fontWeight={500} fontSize={24}>
                    <PutToken style={{ marginRight: '12px' }} /> 200
                  </TYPE.main>
                </AutoColumn>
              </div>
              <Divider />
              <div>
                <AutoColumn gap="9px">
                  <TYPE.smallGray>PRICE OF PUT TOKENS ($3000)</TYPE.smallGray>
                  <NumberWithUnit number="2000" unit="USDT" />
                </AutoColumn>
              </div>
            </AutoColumn>
          </TranslucentCard>
        </RowBetween>
      </AutoColumn>
    </AppBody>
  )
}
