import { AbstractConnector } from '@web3-react/abstract-connector'
import React from 'react'
import styled from 'styled-components'
// import OptionCard from './OptionCard'
// import { SUPPORTED_WALLETS } from '../../constants'
// import { injected } from '../../connectors'
// import { darken } from 'polished'
import Loader from '../Loader'
import { RowBetween } from 'components/Row'
import { ButtonPrimary } from 'components/Button'
import { ReactComponent as CrossCircle } from 'assets/svg/cross_circle.svg'
import { AutoColumn } from 'components/Column'

const PendingSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  width: 100%;
  & > * {
    width: 100%;
  }
`

const StyledLoader = styled(Loader)`
  margin-right: 1rem;
`

const LoadingMessage = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: flex-start;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid ${({ theme }) => theme.primary1};

  & > * {
    padding: 1rem;
  }
`
const ButtonGroup = styled(RowBetween)`
  button:first-child {
    margin-left: 16px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column
  button:first-child{
    margin-left: unset
    margin-bottom: 12px;
  };
  padding-bottom: 20px
`}
`
// const ErrorButton = styled.div`
//   border-radius: 8px;
//   font-size: 12px;
//   color: ${({ theme }) => theme.text1};
//   background-color: ${({ theme }) => theme.bg4};
//   margin-left: 1rem;
//   padding: 0.5rem;
//   font-weight: 600;
//   user-select: none;

//   &:hover {
//     cursor: pointer;
//     background-color: ${({ theme }) => darken(0.1, theme.text4)};
//   }
// `

const LoadingWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
`

export default function PendingView({
  connector,
  error = false,
  setPendingError,
  tryActivation,
  children
}: {
  children: React.ReactNode
  connector?: AbstractConnector
  error?: boolean
  setPendingError: (error: boolean) => void
  tryActivation: (connector: AbstractConnector) => void
}) {
  // const isMetamask = window?.ethereum?.isMetaMask

  return (
    <AutoColumn gap="32px">
      <PendingSection>
        {error ? (
          <AutoColumn justify="center" gap="16px">
            <CrossCircle />
            Error connecting. Please try again
          </AutoColumn>
        ) : (
          <>
            <LoadingMessage>
              <LoadingWrapper>
                <StyledLoader />
                Initializing...
              </LoadingWrapper>
            </LoadingMessage>
          </>
        )}

        {/* {Object.keys(SUPPORTED_WALLETS).map(key => {
        const OptionCard = SUPPORTED_WALLETS[key]
        if (OptionCard.connector === connector) {
          if (OptionCard.connector === injected) {
            if (isMetamask && OptionCard.name !== 'MetaMask') {
              return null
            }
            if (!isMetamask && OptionCard.name === 'MetaMask') {
              return null
            }
          }
          return (
            <OptionCard
              id={`connect-${key}`}
              key={key}
              clickable={false}
              color={OptionCard.color}
              header={OptionCard.name}
              subheader={OptionCard.description}
              icon={require('../../assets/images/' + OptionCard.iconName)}
            />
          )
        }
        return null
      })} */}
      </PendingSection>
      {error && (
        <ButtonGroup>
          {children}
          {error && (
            <ButtonPrimary
              onClick={() => {
                setPendingError(false)
                connector && tryActivation(connector)
              }}
            >
              Try Again
            </ButtonPrimary>
          )}
        </ButtonGroup>
      )}
    </AutoColumn>
  )
}
