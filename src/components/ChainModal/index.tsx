import React from 'react'
import Modal from 'components/Modal'
import { ButtonOutlinedPrimary } from 'components/Button'
import { ReactComponent as ETH } from 'assets/svg/eth_logo.svg'
import { ReactComponent as Heco } from 'assets/svg/huobi.svg'
import { ReactComponent as BSC } from 'assets/svg/binance.svg'
import { ExternalLink, TYPE } from 'theme'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components'

const Button = styled(ButtonOutlinedPrimary)`
border-color: ${({ theme }) => theme.text1};
color: ${({ theme }) => theme.text1};
  :focus,:active{
    border-color: ${({ theme }) => theme.text1};
    color: ${({ theme }) => theme.text1};
  }
  :hover {
    border-color: ${({ theme }) => theme.primary1};
    color: ${({ theme }) => theme.primary1};
  }
  :disabled{
    :hover{
      border-color: ${({ theme }) => theme.text1};
      color: ${({ theme }) => theme.text1};
      opacity:.6;
      box-shadow:unset
    }
    border-color: ${({ theme }) => theme.text1};
    color: ${({ theme }) => theme.text1};
    opacity:.6;
    box-shadow:unset
  }
  padding: 0;
  a,p {
    color: inherit;
    font-weight: inherit;
    padding: 14px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content center;
    text-decoration:none;
    margin:0;
     svg {
      height: 32px;
      width: 32px;
      margin-right: 20px;
    };
  }
`

export default function ChainModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  return (
    <>
      {isOpen && (
        <Modal isOpen={isOpen} onDismiss={onDismiss}>
          <AutoColumn justify="center" gap="24px" style={{ width: '100%', padding: '60px' }}>
            <TYPE.mediumHeader style={{ paddingBottom: '10px' }}>
              Select Antimatter on available chains:
            </TYPE.mediumHeader>
            <Button onClick={onDismiss}>
              <ExternalLink href="https://app.antimatter.finance">
                <ETH />
                Antimatter Ethereum Mainnet
              </ExternalLink>
            </Button>
            <Button onClick={onDismiss}>
              <ExternalLink href="https://heco.antimatter.finance">
                <Heco />
                Antimatter HECO Chain
              </ExternalLink>
            </Button>
            <Button onClick={onDismiss} disabled>
              <div>
                <BSC />
                <AutoColumn>
                  Antimatter BSC Chain
                  <TYPE.smallGray> Coming Soon</TYPE.smallGray>
                </AutoColumn>
              </div>
            </Button>
          </AutoColumn>
        </Modal>
      )}
    </>
  )
}
