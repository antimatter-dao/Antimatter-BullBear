import React, { useState } from 'react'
import styled from 'styled-components'
import { ButtonOutlined } from '../Button'
import { GradientCard } from '../Card'
import { ReactComponent as EthLogo } from '../../assets/svg/eth_logo.svg'
import { ReactComponent as Dot } from '../../assets/svg/copy.svg'
import { ReactComponent as MatamaskLogo } from '../../assets/svg/metamask_logo.svg'
import { ReactComponent as WalletConnectLogo } from '../../assets/svg/walletConnect_logo.svg'

const HeaderWrapper = styled.div`
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.bg1};
  display: flex;
  justify-content: space-between;
  z-index: 2;
`

const OutlinedButton = styled(ButtonOutlined)`
  border-color: ${({ theme }) => theme.text1};
  border-radius: 49px;
  padding: 8px 26px;
`

const StyledSelect = styled.select`
  font-size: 1.1rem;
  background-color: #000000;
  min-width: 270px;
  border: none
  color: ${({ theme }) => theme.text1}
  font-size: 18px
  margin: 0 50px
`

const InfoWrapper = styled.div`
  display: flex;
`
const NetworkCard = styled.div`
  display: flex;
  width: 66px;
  height: 32px;
  margin-right: 12px;
  margin-left: 19px;
  justify-content: center;
  border-radius: 4px;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.12);
  font-size: 13px;
  font-weight: 500;
`
const Wallet = styled.div`
  border: 1px solid #FFFFFF;
  
  border-radius: 4px;
  height: 32px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  
  & .dot{
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, #FFFFFF 4.17%, rgba(255, 255, 255, 0) 75%);
    border: 0.6px solid #FFFFFF;
    box-sizing: border-box;
    border-radius: 50%
    margin: 0 16px;
  }

  & .wallet__balance {
    padding-right: 16px;
    border-right: 1px solid #fff;
    font-size: 13px;
  }

  & .wallet__address{
    display: flex;
    align-items: center
    & p{
      margin-right: 16px
    }
  }

`
const ConnectCard = styled.div`
  height: 100%;
  position: absolute;
  width: calc(100% - 212px);
  z-index: 2;
  background: ${({ theme }) => theme.bg1};
  display: flex
  justify-content:center
  align-items: center

  & .connect__wallet {
    position: absolute;
    right: 85px
    top: 48px
  }

  &>div{
    display: flex
    flex-direction: column
    align-items: center
  }

  & button:last-child{
    margin-top: 16px
  }
`
export default function Header() {
  const [connected, setConnected] = useState(true)

  return connected ? (
    <HeaderWrapper>
      <StyledSelect>
        <option>Option Positions and Statistics </option>
      </StyledSelect>
      <InfoWrapper>
        <NetworkCard>
          <EthLogo />
          <p>ETH</p>
        </NetworkCard>
        <Wallet>
          <p className="wallet__balance">99.99 MATTER</p>
          <div className="wallet__address">
            <div className="dot"></div>
            <p>0x834B...62e</p>
            <Dot />
          </div>
        </Wallet>
      </InfoWrapper>
    </HeaderWrapper>
  ) : (
    <ConnectCard>
      <OutlinedButton className="connect__wallet" onClick={() => setConnected(true)} width="auto">
        Connect Wallet
      </OutlinedButton>
      <GradientCard width="560px" padding="52px">
        <p>Connected with MetaMask</p>
        <OutlinedButton width="280px" height="60px">
          <MatamaskLogo />
          MetaMask
        </OutlinedButton>
        <OutlinedButton width="280px" height="60px">
          <WalletConnectLogo />
          WalletConnect
        </OutlinedButton>
      </GradientCard>
    </ConnectCard>
  )
}
