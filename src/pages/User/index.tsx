import React, { useCallback, useEffect, useState, useMemo } from 'react'
import styled, { CSSProperties } from 'styled-components'
import { SwitchTabWrapper, Tab } from '../../components/SwitchTab'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { AnimatedImg, AnimatedWrapper, HideSmall, ShowSmall } from '../../theme'
import Loader from '../../assets/svg/antimatter_background_logo.svg'
import Table, { UserPositionTable } from '../../components/Table'
// import { ReactComponent as BuyIcon } from '../../assets/svg/buy.svg'
// import { ReactComponent as SellIcon } from '../../assets/svg/sell.svg'
// import showPassDateTime from '../../utils/showPassDateTime'
import { useMyPosition, useMyCreation } from '../../hooks/useUserFetch'
import Pagination from '../../components/Pagination'
import { parsePrice } from 'utils/option/utils'
import { ButtonOutlinedPrimary } from 'components/Button'
import { RowFixed } from 'components/Row'
import CopyHelper from 'components/AccountDetails/Copy'
import { shortenAddress } from 'utils'

const Wrapper = styled.div`
  padding: 78px 0 88px;
  width: 90vw;
  max-width: 1284px;
  display: flex;
  justify-content: center;
  min-height: calc(100vh - ${({ theme }) => theme.headerHeight});
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 0 0 40px;
  color: #ffffff
  width: 100%;
  `}
`

const AppBody = styled.div`
  width: 100%;
  background: linear-gradient(
    286.36deg,
    rgba(255, 255, 255, 0.18) -2.42%,
    rgba(255, 255, 255, 0.17) 19.03%,
    rgba(255, 255, 255, 0.114217) 57.75%,
    rgba(255, 255, 255, 0.0617191) 92.46%,
    rgba(255, 255, 255, 0) 100.04%
  );
  border-radius: 32px;
  /* padding: 52px; */
  max-width: 1284px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  background: transparent;
  padding: 32px 24px;
  `}
`

export enum UserInfoTabs {
  POSITION = 'my_position',
  CREATION = 'my_creation'
  // ACTIVITY = 'activity'
}
export const UserInfoTabRoute = {
  [UserInfoTabs.POSITION]: 'My Position',
  [UserInfoTabs.CREATION]: 'My Creation'
  // [UserInfoTabs.ACTIVITY]: 'Activity'
}

const formatMyCreation = (data: any[] | undefined, historyPush: (param: string) => void) => {
  if (!data) return []

  return data.reduce(
    (
      acc,
      {
        underlyingSymbol,
        priceCap,
        priceFloor,
        currencyDecimals,
        totalCall,
        totalPut,
        callAddress,
        putAddress,
        optionIndex
      }
    ) => {
      acc.push(
        [
          `${underlyingSymbol}($${parsePrice(priceFloor, currencyDecimals)} ~ $${parsePrice(
            priceCap,
            currencyDecimals
          )})`,
          'Call',
          totalCall,
          <RowFixed>
            {shortenAddress(callAddress, 6)}
            <CopyHelper key={callAddress + 'a'} toCopy={callAddress} />
          </RowFixed>,
          <ButtonOutlinedPrimary
            key={callAddress}
            onClick={() => {
              historyPush(`/option_trading/${optionIndex}`)
            }}
            padding="12px"
          >
            Trade
          </ButtonOutlinedPrimary>
        ],
        [
          `${underlyingSymbol}($${parsePrice(priceFloor, currencyDecimals)} ~ $${parsePrice(
            priceCap,
            currencyDecimals
          )})`,
          'Put',
          totalPut,
          <RowFixed>
            {shortenAddress(putAddress, 6)}
            <CopyHelper key={putAddress + 'a'} toCopy={putAddress} />
          </RowFixed>,
          <ButtonOutlinedPrimary
            key={putAddress}
            onClick={() => {
              historyPush(`/option_trading/${optionIndex}`)
            }}
            padding="12px"
          >
            Trade
          </ButtonOutlinedPrimary>
        ]
      )
      return acc
    },
    []
  )
}

// function randTime() {
//   return new Date(new Date().getTime() - Math.floor(Math.random() * 86400 * 1.2 * 1000))
// }
// const makeActiveData = () => [
//   'ETH ($1000 ~ $3000)',
//   'CALL',
//   Math.random() > 0.5 ? (
//     <>
//       <BuyIcon />
//       Buy
//     </>
//   ) : (
//     <>
//       <SellIcon />
//       Sell
//     </>
//   ),
//   '121',
//   showPassDateTime(randTime())
// ]
// const activeDatas = [makeActiveData(), makeActiveData(), makeActiveData(), makeActiveData(), makeActiveData()]

export default function User() {
  const history = useHistory()
  const { tab } = useParams<{ tab: string }>()
  const location = useLocation()
  const [currentTab, setCurrentTab] = useState(UserInfoTabs.POSITION)
  const handleTabClick = useCallback(
    tab => () => {
      setCurrentTab(tab)
      history.push('/profile/' + tab)
    },
    [history]
  )

  useEffect(() => {
    if (tab && UserInfoTabRoute[tab as keyof typeof UserInfoTabRoute]) {
      setCurrentTab(tab as UserInfoTabs)
    }
  }, [location, tab])
  const { data: myPosition, page: myPositionPage, loading: myPositionLoading } = useMyPosition()

  const myCreation = useMyCreation()

  console.log(999, myCreation)

  const myCreationData = useMemo(() => {
    return formatMyCreation(myCreation, history.push)
  }, [history.push, myCreation])

  return (
    <Wrapper>
      <AppBody>
        <SwitchTab style={{ padding: '50px 50px 0' }} onTabClick={handleTabClick} currentTab={currentTab} />
        {(currentTab === UserInfoTabs.CREATION && myCreation === undefined) ||
        (currentTab === UserInfoTabs.POSITION && myPositionLoading) ? (
          <>
            <HideSmall>
              <AnimatedWrapper>
                <AnimatedImg>
                  <img src={Loader} alt="loading-icon" />
                </AnimatedImg>
              </AnimatedWrapper>
            </HideSmall>
            <ShowSmall>
              <AnimatedWrapper>
                <AnimatedImg>
                  <img src={Loader} alt="loading-icon" />
                </AnimatedImg>
              </AnimatedWrapper>
            </ShowSmall>
          </>
        ) : (
          <>
            {currentTab === UserInfoTabs.POSITION && (
              <>
                <UserPositionTable header={['OPTION', 'TYPE', 'AMOUNT', 'CONTRACT ADDRESS', '']} data={myPosition} />
                {myPositionPage.totalPages !== 0 && (
                  <Pagination
                  page={myPositionPage.currentPage}
                  count={myPositionPage.totalPages}
                  setPage={myPositionPage.setCurrentPage}
                  />
                )}
                {!myPosition.length && !myPositionLoading && (
                  <p style={{ margin: 50 }}>You have no postion at the moment</p>
                )}
              </>
            )}
            {currentTab === UserInfoTabs.CREATION && (
              <>
                <Table header={['OPTION', 'TYPE', 'AMOUNT', 'CONTRACT ADDRESS', '']} rows={myCreationData} />

                {/* {!myCreation.length && !myCreationLoading && (
                  <p style={{ margin: 50 }}>You have no creation at the moment</p>
                )} */}
              </>
            )}
            {/* {currentTab === UserInfoTabs.ACTIVITY && (
              <>
                <Table header={['OPTION', 'TYPE', 'ACTION', 'AMOUNT', 'DATE']} rows={activeDatas} />
              </>
            )} */}
          </>
        )}
      </AppBody>
    </Wrapper>
  )
}

function SwitchTab({
  currentTab,
  onTabClick,
  style
}: {
  currentTab: UserInfoTabs
  onTabClick: (tab: UserInfoTabs) => () => void
  style: CSSProperties
}) {
  return (
    <SwitchTabWrapper style={style}>
      {Object.keys(UserInfoTabRoute).map(tab => {
        const tabName = UserInfoTabRoute[tab as keyof typeof UserInfoTabRoute]
        return (
          <Tab key={tab} onClick={onTabClick(tab as UserInfoTabs)} selected={currentTab === tab}>
            {tabName}
          </Tab>
        )
      })}
    </SwitchTabWrapper>
  )
}
