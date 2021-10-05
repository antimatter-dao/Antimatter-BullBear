import React, { useCallback, useState } from 'react'
import { ChevronLeft } from 'react-feather'
import { useHistory } from 'react-router'
import styled from 'styled-components'
import OptionSwap from './OptionSwap'
import AppBody, { BodyWrapper } from 'pages/AppBody'
import { CustomLightSpinner, ExternalLink, TYPE, HideSmall, ShowSmall } from 'theme'
//import Liquidity from './Liquidity'
import useTheme from 'hooks/useTheme'
import { RowBetween, RowFixed } from 'components/Row'
import { ButtonEmpty } from 'components/Button'
import { AutoColumn } from 'components/Column'
//import { USDT } from '../../constants'
//import { useCurrency } from 'hooks/Tokens'
//import { currencyId } from 'utils/currencyId'
//import { OptionInterface } from './'
import Loader from 'assets/svg/gray_loader.svg'
import { Option, OptionPrice, useOption, useOptionPrice } from '../../state/market/hooks'
import CurrencyLogo from 'components/CurrencyLogo'
import { tryFormatAmount } from '../../state/swap/hooks'
import { getEtherscanLink, shortenAddress } from 'utils'
import { useActiveWeb3React } from 'hooks'
import { useTotalSupply } from '../../data/TotalSupply'
// import { OptionField } from '../Swap'
import { useCurrencyBalance } from '../../state/wallet/hooks'
//import { ChainId, WETH } from '@uniswap/sdk'
//import { useDerivedMintInfo } from 'state/mint/hooks'

enum TABS {
  SWAP = 'swap',
  LIQUIDITY = 'liquidity',
  INFO = 'info'
}

const Wrapper = styled.div`
  min-height: calc(100vh - ${({ theme }) => theme.headerHeight + ' - 100px'});
  width: 100%;
  padding: 0 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToLarge`
  min-height: calc(100vh - ${({ theme }) => theme.headerHeight + ' - ' + theme.mobileHeaderHeight});
  padding: 0 24px;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding:0;
  width: calc(100% + 2px);
  margin: 0 -1px
  `}
`

const ActionWrapper = styled.div`
  margin-top: 10px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
  width: 100%;
  `}
`

const Elevate = styled.div`
  z-index: 2;
  height: 100%;
`

const SwitchTabWrapper = styled.div`
  display: flex;
  margin-bottom: -1px;
  margin-left: -1px;
  flex-direction: row-reverse;
  justify-content: flex-end;
`

const Circle = styled.div`
  margin-right: 16px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.bg5};
  background-color: ${({ theme }) => theme.bg4};
  min-height: 32px;
  min-width: 32px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const TabStyle = styled.button<{ selected?: boolean; isFirstChild?: boolean }>`
  outline: none;
  border:none;
  background: none;
  position: relative;
  min-width: ${({ isFirstChild }) => (isFirstChild ? '157px' : '229px')};
  padding: 0;
  height: 42px;
  margin-left:${({ isFirstChild }) => (isFirstChild ? '0' : '-74px')};
  svg {
    z-index:${({ selected }) => (selected ? '2' : '0')}
    position: absolute;
    top: ${({ selected }) => (selected ? '0' : '-1px')};
    left: 0;
    stroke: ${({ theme, selected }) => (selected ? theme.text4 : theme.text5)};
    fill:${({ selected, theme, isFirstChild }) => (selected ? '#141414' : isFirstChild ? 'transparent' : theme.bg1)}
    stroke-width: 1px;
  }
  div{
    z-index: 2;
    position: absolute;
    line-height: 41px;
    text-align: center;
    top: 0;
    left:${({ isFirstChild }) => (isFirstChild ? '50px' : '50%')};
    transform:${({ isFirstChild }) => (isFirstChild ? 'translateX(0)' : 'translateX(-50%)')};
    margin-left:${({ isFirstChild }) => (isFirstChild ? '0' : '8px')};
    color: ${({ selected, theme }) => (selected ? theme.text1 : theme.text3)};
  };
`

const StyledAppBody = styled(BodyWrapper)<{ tab: TABS }>`
  max-width: 1116px;
  padding: 0;
  background: black;
  border-color: ${({ tab }) => (tab === TABS.SWAP ? '#727272' : 'rgb(114, 114, 114)')};
  width: 1116px;
  overflow: hidden;
  ${({ theme }) => theme.mediaWidth.upToLarge`
  max-width: 100%;
  width: 100%;
  max-height: unset;
  margin-bottom: 50px
`}
  ${({ theme }) => theme.mediaWidth.upToSmall`
  min-height:100%;
  padding: 0;
  flex-grow: 1;
  border-bottom: 0;
  `}
`

export const StyledExternalLink = styled(ExternalLink)`
  text-decoration: none;
  font-size: 12px;
  color: ${({ theme }) => theme.text3};
  :hover {
    color: ${({ theme }) => theme.text4};
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-right:14px
  `}
`

const InfoAppBody = styled(BodyWrapper)`
  max-width: 1116px;

  min-height: 402px;
  margin: -1px;
  border-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 48px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    padding:20px;
  `}
`

const InfoAppBodyInner = styled(BodyWrapper)`
  min-width: 550px;
  width: 50%;
  background: transparent
    ${({ theme }) => theme.mediaWidth.upToMedium`
  min-width: unset;
  width: 100%;

  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  border: none;
  background: transparent;
  `};
`

const Title = styled(TYPE.subHeader)`
  white-space: nowrap;
  ${({ theme }) => theme.mediaWidth.upToSmall`  
    white-space: pre-wrap;
    padding-right: 14px;
    text-align: right
  `};
`

const TitleWrapper = styled(AutoColumn)`
  justify-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-items: end;
    padding-right: 14px
  `};
`

export default function OptionTradeAction({ optionId }: { optionId?: string }) {
  //const { chainId } = useActiveWeb3React()
  const [tab, setTab] = useState(TABS.SWAP)
  const option = useOption(optionId)
  const theme = useTheme()
  const history = useHistory()
  //const currencyA = chainId === ChainId.MAINNET ? USDT : chainId && WETH[chainId]
  //const currencyB = useCurrency(addressA)
  //const underlyingCurrency = useCurrency(option?.underlyingAddress ?? undefined)
  //const { pair } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

  const handleSetTab = useCallback((tab: TABS) => setTab(tab), [setTab])
  const handleBack = useCallback(() => history.push('/option_trading'), [history])
  // const [optionType, setOptionType] = useState<string>(OptionField.CALL)

  const optionPrice = useOptionPrice(option)

  return (
    <>
      {optionId ? (
        <Wrapper>
          <RowBetween style={{ padding: '27px 0', maxWidth: 1116 }}>
            <ButtonEmpty width="auto" color={theme.text1} onClick={handleBack} padding="14px 14px 14px 0">
              <ChevronLeft style={{ flexShrink: 0 }} />
              <HideSmall>Go Back</HideSmall>
            </ButtonEmpty>

            <TitleWrapper gap="8px">
              {option && (
                <RowFixed>
                  <HideSmall>
                    <Circle>
                      <CurrencyLogo currency={option?.underlying ?? undefined} size="100%" />
                    </Circle>
                  </HideSmall>
                  <Title fontSize={24} fontWeight={500}>
                    {`${option?.underlying?.symbol} ${'\n'}($${tryFormatAmount(
                      option?.priceFloor,
                      option?.currency ?? undefined
                    )
                      ?.toExact()
                      .toString()}~$${tryFormatAmount(option?.priceCap, option?.currency ?? undefined)
                      ?.toExact()
                      .toString()})`}
                  </Title>
                  <ShowSmall>
                    <Circle>
                      <CurrencyLogo currency={option?.underlying ?? undefined} size="36px" />
                    </Circle>
                  </ShowSmall>
                </RowFixed>
              )}

              {option && option.callToken && option.putToken && (
                <RowFixed gap="10px">
                  <StyledExternalLink
                    href={getEtherscanLink(option.callToken.chainId, option.callToken.address, 'token')}
                  >
                    {shortenAddress(option.callToken.address, 6)}
                  </StyledExternalLink>
                  <TYPE.smallGray>&nbsp;&nbsp;|&nbsp;&nbsp;</TYPE.smallGray>
                  <StyledExternalLink
                    href={getEtherscanLink(option.putToken.chainId, option.putToken.address, 'token')}
                  >
                    {shortenAddress(option.putToken.address, 6)}
                  </StyledExternalLink>
                </RowFixed>
              )}
            </TitleWrapper>
            <HideSmall>
              <div style={{ width: 113 }} />
            </HideSmall>
          </RowBetween>
          <ActionWrapper>
            <SwitchTab tab={tab} setTab={handleSetTab} />
            <StyledAppBody tab={tab} isCard={false}>
              <Elevate>
                {tab === TABS.SWAP && (
                  <OptionSwap /*handleOptionType={setOptionType}*/ optionPrice={optionPrice} option={option} />
                )}
                {/*{tab === TABS.LIQUIDITY && <Liquidity currencyA={currencyA} currencyB={currencyB} pair={pair} />}*/}
                {tab === TABS.INFO && <Info optionPrice={optionPrice} option={option} />}
              </Elevate>
            </StyledAppBody>
          </ActionWrapper>
        </Wrapper>
      ) : (
        <AppBody style={{ minHeight: '402px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CustomLightSpinner src={Loader} alt="loader" size={'100px'} />
        </AppBody>
      )}
    </>
  )
}

function SwitchTab({ tab, setTab }: { tab: TABS; setTab: (tab: TABS) => void }) {
  const swapClick = useCallback(() => setTab(TABS.SWAP), [setTab])
  //const liquidityClick = useCallback(() => setTab(TABS.LIQUIDITY), [setTab])
  const infoClick = useCallback(() => setTab(TABS.INFO), [setTab])
  return (
    <SwitchTabWrapper>
      <Tab onClick={infoClick} selected={tab === TABS.INFO}>
        Info
      </Tab>
      {/*<Tab onClick={liquidityClick} selected={tab === TABS.LIQUIDITY}>*/}
      {/*  Liquidity*/}
      {/*</Tab>*/}
      <Tab isFirstChild={true} onClick={swapClick} selected={tab === TABS.SWAP}>
        Trade
      </Tab>
    </SwitchTabWrapper>
  )
}
function Tab({
  isFirstChild,
  selected,
  children,
  onClick
}: {
  isFirstChild?: boolean
  selected?: boolean
  children: string
  onClick: () => void
}) {
  return (
    <TabStyle selected={selected} isFirstChild={isFirstChild} onClick={onClick}>
      {isFirstChild ? (
        <svg width="157" height="76" viewBox="0 0 157 76" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M157 42V41.5C150.187 42 143.885 38.3867 140.443 32.5068L127.793 10.8964C124.205 4.76683 117.635 1 110.533 1H33C15.3269 1 1 15.3269 1 33V76" />
          {!selected && (
            <path
              d="M157 42V42C150.187 42 143.885 38.3867 140.443 32.5068L127.793 10.8964C124.205 4.76683 117.635 1 110.533 1H33C15.3269 1 1 15.3269 1 33V42"
              fill="#000000"
              strokeWidth="0"
              stroke="transparent"
            />
          )}
        </svg>
      ) : (
        <svg width="229" height="43" viewBox="0 0 229 43" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.8469 42C25.0603 42 36.2086 35.0479 41.5827 24.0804L44.1114 18.9196C49.4854 7.95208 60.6338 1 72.8472 1H161.754C169.37 1 176.325 5.32574 179.693 12.157L188.904 30.843C192.272 37.6742 199.227 42 206.843 41.5" />

          <path
            stroke="transparent"
            fill={selected ? '#141414' : 'transparent'}
            d="M12.8469 43C25.0603 42 36.2086 35.0479 41.5827 24.0804L44.1114 18.9196C49.4854 7.95208 60.6338 1 72.8472 1H161.754C169.37 1 176.325 5.32574 179.693 12.157L188.904 30.843C192.272 37.6742 199.227 42 206.843 43"
          />
        </svg>
      )}
      <TYPE.smallHeader fontSize={18}>{children}</TYPE.smallHeader>
    </TabStyle>
  )
}

function Info({
  option,
  placeholder = '-',
  optionPrice
}: {
  option?: Option
  placeholder?: string
  optionPrice: OptionPrice | undefined
}) {
  // const theme = useTheme()
  const { chainId } = useActiveWeb3React()
  const callTotal = useTotalSupply(option?.call?.token)
  const putTotal = useTotalSupply(option?.put?.token)
  const undTotal = useCurrencyBalance(option?.call?.token.address, option?.underlying ?? undefined)
  const curTotal = useCurrencyBalance(option?.put?.token.address, option?.currency ?? undefined)

  const priceCall = optionPrice?.priceCall
  const pricePut = optionPrice?.pricePut
  return (
    <InfoAppBody>
      <TYPE.smallHeader style={{ marginBottom: 20 }} fontSize={18}>
        Option Information
      </TYPE.smallHeader>
      <InfoAppBodyInner>
        <AutoColumn style={{ width: '100%' }} justify="center" gap="32px">
          <AutoColumn style={{ width: '100%' }} justify="center" gap="md">
            <RowBetween>
              <TYPE.darkGray>{'Option Price Range:'}</TYPE.darkGray>
              <TYPE.main>
                {option &&
                  `$${tryFormatAmount(option?.priceFloor, option?.currency ?? undefined)
                    ?.toExact()
                    .toString() ?? placeholder} ~ $${tryFormatAmount(option?.priceCap, option?.currency ?? undefined)
                    ?.toExact()
                    .toString() ?? placeholder}`}
              </TYPE.main>
            </RowBetween>
            <RowBetween>
              <TYPE.darkGray>{'Underlying Asset:'}</TYPE.darkGray>
              <TYPE.main>
                {(option && option?.underlying?.symbol) ?? placeholder}, {option && option?.currency?.symbol}
              </TYPE.main>
            </RowBetween>
            <RowBetween>
              <TYPE.darkGray>{'Underlying Asset Ratio:'}</TYPE.darkGray>
              <TYPE.main>
                {undTotal ? undTotal.toSignificant(2).toString() + option?.underlying?.symbol : '-'} :{' '}
                {curTotal ? curTotal.toSignificant(2).toString() + option?.currency?.symbol : '-'}
              </TYPE.main>
            </RowBetween>
          </AutoColumn>
          <AutoColumn style={{ width: '100%' }} justify="center" gap="md">
            <RowBetween>
              <TYPE.darkGray>{'Call Token Contact Address:'}</TYPE.darkGray>
              <ExternalLink
                href={option?.call && chainId ? getEtherscanLink(chainId, option?.call?.token.address, 'token') : ''}
              >
                <TYPE.main>
                  {option && option?.call?.token.address ? shortenAddress(option.call?.token.address) : placeholder}
                </TYPE.main>
              </ExternalLink>
            </RowBetween>
            <RowBetween>
              <TYPE.darkGray>{'Call Token Issuance:'}</TYPE.darkGray>
              <TYPE.main>{callTotal?.toFixed(2).toString() ?? placeholder}</TYPE.main>
            </RowBetween>
            <RowBetween>
              <TYPE.darkGray>{'Call Token Market Price:'}</TYPE.darkGray>
              <TYPE.main>{`$${priceCall ? priceCall.toSignificant(6) : placeholder}`}</TYPE.main>
            </RowBetween>
          </AutoColumn>
          <AutoColumn style={{ width: '100%' }} justify="center" gap="md">
            <RowBetween>
              <TYPE.darkGray>{'Put Token Contact Address:'}</TYPE.darkGray>
              <ExternalLink
                href={option?.put && chainId ? getEtherscanLink(chainId, option?.put?.token.address, 'token') : ''}
              >
                <TYPE.main>
                  {option && option?.put?.token.address ? shortenAddress(option.put.token.address) : placeholder}
                </TYPE.main>
              </ExternalLink>
            </RowBetween>
            <RowBetween>
              <TYPE.darkGray>{'Put Token Issuance:'}</TYPE.darkGray>
              <TYPE.main>{putTotal?.toFixed(2).toString() ?? placeholder}</TYPE.main>
            </RowBetween>
            <RowBetween>
              <TYPE.darkGray>{'Put Token Market Price:'}</TYPE.darkGray>
              <TYPE.main>{`$${pricePut ? pricePut.toSignificant(6) : placeholder}`}</TYPE.main>
            </RowBetween>
          </AutoColumn>
        </AutoColumn>
      </InfoAppBodyInner>
    </InfoAppBody>
  )
}
