import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
// import AddressClaimModal from '../components/claim/AddressClaimModal'
import Header from '../components/Header'
import Polling from '../components/Header/Polling'
// import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
// import Sidebar from '../components/Sidebar'
import Web3ReactManager from '../components/Web3ReactManager'
// import { ApplicationModal } from '../state/application/actions'
// import { useModalOpen, useToggleModal } from '../state/application/hooks'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
// import AddLiquidity from './AddLiquidity'
// import {
//   RedirectDuplicateTokenIds,
//   RedirectOldAddLiquidityPathStructure,
//   RedirectToAddLiquidity
// } from './AddLiquidity/redirects'
import MatterToken from './MatterToken'
// import MigrateV1 from './MigrateV1'
// import MigrateV1Exchange from './MigrateV1/MigrateV1Exchange'
// import RemoveV1Exchange from './MigrateV1/RemoveV1Exchange'
// import Pool from './Pool'
// import PoolFinder from './PoolFinder'
// import RemoveLiquidity from './RemoveLiquidity'
// import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
// import Swap from './Swap'
import { /*OpenClaimAddressModalAndRedirectToSwap,*/ RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
//import Generate from './Generate'
//import Redeem from './Redeem'
// import Exercise from './Exercise'
// import ComingSoon from './ComingSoon'
import Info from './Info'
// import MatterRedemption from './MatterToken/MatterRedemption'
import WelcomeSlider from 'components/WelcomeSlider'
import FAQ from './FAQ'
import OptionTrade from './OptionTrade'
import OptionCreation from './OptionCreation'
import OptionExercise from './OptionExercise'
import Stats from './Stats'
import ComingSoon from './ComingSoon'
import Calculator from './Calculator'
import WarningModal from 'components/Modal/WarningModal'
import Helper from '../assets/svg/helper.svg'
import { ExternalLink } from '../theme'
const AppWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  overflow-x: hidden;
  background-color: ${({ theme }) => theme.bg1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
  height: 100vh;
  `}
`
const ContentWrapper = styled.div`
  width: 100%;
  max-height: 100vh;
  overflow: auto;
  align-items: center;
`

const HeaderWrapper = styled.div`
  width: 100%;
  justify-content: space-between;
  flex-direction: column;
  ${({ theme }) => theme.flexRowNoWrap}
  ${({ theme }) => theme.mediaWidth.upToSmall`
  height:0;
  overflow: hidden
  `}
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: calc(100vh - ${({ theme }) => theme.headerHeight});
  justify-content: center;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  padding-bottom: 100px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
  margin-bottom: ${theme.headerHeight};
  min-height: calc(100vh - ${theme.headerHeight + ' - ' + theme.mobileHeaderHeight}); 
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding-bottom: 0;
  margin-top: ${({ theme }) => theme.mobileHeaderHeight}
  `};
`

const Feedback = styled.img`
  z-index: 9;
  position: fixed;
  width: 48px;
  height: 48px;
  right: 100px;
  bottom: 50px;
`

export const Marginer = styled.div`
  ${({ theme }) => theme.desktop}
`

// function TopLevelModals() {
//   const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
//   const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
//   return <AddressClaimModal isOpen={open} onDismiss={toggle} />
// }

export default function App() {
  return (
    <Suspense fallback={null}>
      <ExternalLink
        href={
          'https://docs.google.com/forms/d/e/1FAIpQLSfyWq7xlI_ro72-n9rM-disc7extCoVw5oUiOQND7fnh1c80g/viewform?usp=pp_url'
        }
      >
        <Feedback src={Helper} />
      </ExternalLink>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <AppWrapper id="app">
        {/* <URLWarning /> */}
        {/* <Sidebar /> */}
        <ContentWrapper>
          <HeaderWrapper id="header">
            <Header />
          </HeaderWrapper>
          <BodyWrapper id="body">
            <Popups />
            <Polling />
            <WelcomeSlider />
            <WarningModal />
            {/* <TopLevelModals /> */}
            <Web3ReactManager>
              <Switch>
                {/* <Route exact strict path="/option_trading" component={Swap} /> */}
                <Route exact strict path="/option_creation" component={OptionCreation} />
                <Route exact strict path="/option_trading" component={OptionTrade} />
                <Route exact strict path="/calculator" component={Calculator} />
                <Route exact strict path="/option_trading/:optionId" component={OptionTrade} />
                <Route exact strict path="/option_exercise" component={OptionExercise} />
                {/* <Route exact strict path="/generate" component={Generate} /> */}
                {/* <Route exact strict path="/redeem" component={Redeem} /> */}
                {/*<Route exact strict path="/redeem/:optionTypeIndex" component={Redeem} />*/}
                <Route exact strict path="/governance" component={ComingSoon} />
                <Route exact strict path="/info" component={Info} />
                <Route exact strict path="/statistics" component={Stats} />
                {/* <Route exact strict path="/exercise" component={Exercise} /> */}
                {/* <Route exact strict path="/claim" component={OpenClaimAddressModalAndRedirectToSwap} /> */}
                <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
                {/* <Route exact strict path="/send" component={RedirectPathToSwapOnly} /> */}
                {/* <Route exact strict path="/find" component={PoolFinder} /> */}
                {/* <Route exact strict path="/liquidity" component={Pool} /> */}
                <Route exact strict path="/farm" component={MatterToken} />
                {/* <Route exact strict path="/matter_redemption" component={MatterRedemption} /> */}
                {/* <Route exact strict path="/create" component={RedirectToAddLiquidity} />
                <Route exact path="/add" component={AddLiquidity} />
                <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
                <Route exact path="/create" component={AddLiquidity} />
                <Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
                <Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} /> */}
                {/* <Route exact strict path="/remove/v1/:address" component={RemoveV1Exchange} />
                <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
                <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} /> */}
                <Route exact strict path="/faq" component={FAQ} />
                {/* <Route exact strict path="/migrate/v1" component={MigrateV1} />
                <Route exact strict path="/migrate/v1/:address" component={MigrateV1Exchange} /> */}
                {/* <Route exact strict path="/vote/:id" component={VotePage} /> */}
                <Route component={RedirectPathToSwapOnly} />
              </Switch>
            </Web3ReactManager>
            {/* <Marginer /> */}
          </BodyWrapper>
        </ContentWrapper>
      </AppWrapper>
    </Suspense>
  )
}
