import { AbstractConnector } from '@web3-react/abstract-connector'
import React from 'react'
import styled from 'styled-components'
// import Option from './Option'
// import { SUPPORTED_WALLETS } from '../../constants'
// import { injected } from '../../connectors'
// import { darken } from 'polished'
import Loader from '../Loader'
import { RowBetween } from 'components/Row'
import { ButtonPrimary } from 'components/Button'
import { ReactComponent as CrossCircle } from 'assets/svg/cross_circle.svg'
import { AutoColumn } from 'components/Column'

const StyledAutoColumn = styled(AutoColumn)<{ error: boolean }>`
  grid-gap: 32px;
  margin: ${({ error }) => (error ? '-2rem' : '0')} -3rem -10px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin: 0;`}
`

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
    <StyledAutoColumn error={!!error}>
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
        const option = SUPPORTED_WALLETS[key]
        if (option.connector === connector) {
          if (option.connector === injected) {
            if (isMetamask && option.name !== 'MetaMask') {
              return null
            }
            if (!isMetamask && option.name === 'MetaMask') {
              return null
            }
          }
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              clickable={false}
              color={option.color}
              header={option.name}
              subheader={option.description}
              icon={require('../../assets/images/' + option.iconName)}
            />
          )
        }
        return null
      })} */}
      </PendingSection>
      {error && (
        <RowBetween>
          {children}
          {error && (
            <ButtonPrimary
              onClick={() => {
                setPendingError(false)
                connector && tryActivation(connector)
              }}
              style={{ marginLeft: '16px' }}
            >
              Try Again
            </ButtonPrimary>
          )}
        </RowBetween>
      )}
    </StyledAutoColumn>
  )
}
