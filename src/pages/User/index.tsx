import React, { useCallback, useEffect, useState } from 'react'
import styled, { CSSProperties } from 'styled-components'
import { SwitchTabWrapper, Tab } from '../../components/SwitchTab'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { AnimatedImg, AnimatedWrapper, HideSmall, ShowSmall } from '../../theme'
import Loader from '../../assets/svg/antimatter_background_logo.svg'
import Table from '../../components/Table'
import Copy from 'components/AccountDetails/Copy'
import { shortenAddress } from 'utils'
import { RowFixed } from 'components/Row'
import { ButtonOutlined } from 'components/Button'
import { ReactComponent as BuyIcon } from '../../assets/svg/buy.svg'
import { ReactComponent as SellIcon } from '../../assets/svg/sell.svg'
import showPassDateTime from '../../utils/showPassDateTime'

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
const TableButtonOutlined = styled(ButtonOutlined)`
  height: 40px;
  width: 100px;
  color: #b2f355;
  border: 1px solid #b2f355;
  opacity: 0.8;
  &:hover {
    border: 1px solid #b2f355;
    opacity: 1;
  }
`

export enum UserInfoTabs {
  POSITION = 'my_position',
  CREATION = 'my_creation',
  ACTIVITY = 'activity'
}
export const UserInfoTabRoute = {
  [UserInfoTabs.POSITION]: 'My Position',
  [UserInfoTabs.CREATION]: 'My Creation',
  [UserInfoTabs.ACTIVITY]: 'Activity'
}

const postionData = [
  'ETH ($1000 ~ $3000)',
  'CALL',
  '121',
  <RowFixed key={1}>
    {shortenAddress('0x55cB10Cc3AE459EeE072567c8D53d1Bca31761fA' ?? '', 5)}
    <Copy toCopy={'0x55cB10Cc3AE459EeE072567c8D53d1Bca31761fA'}></Copy>
  </RowFixed>,
  <TableButtonOutlined key={2}>Trade</TableButtonOutlined>
]
const postionDatas = [postionData, postionData, postionData]
const creationData = [
  'ETH ($1000 ~ $3000)',
  'ETH, USDT',
  '121',
  '121 MATTER',
  <TableButtonOutlined key={2}>Claim</TableButtonOutlined>
]
function randTime() {
  return new Date(new Date().getTime() - Math.floor(Math.random() * 86400 * 1.2 * 1000))
}
const creationDatas = [creationData, creationData, creationData, creationData, creationData]
const makeActiveData = () => [
  'ETH ($1000 ~ $3000)',
  'CALL',
  Math.random() > 0.5 ? (
    <>
      <BuyIcon />
      Buy
    </>
  ) : (
    <>
      <SellIcon />
      Sell
    </>
  ),
  '121',
  showPassDateTime(randTime())
]
const activeDatas = [makeActiveData(), makeActiveData(), makeActiveData(), makeActiveData(), makeActiveData()]

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

  return (
    <Wrapper>
      <AppBody>
        <SwitchTab style={{ padding: '50px 50px 0' }} onTabClick={handleTabClick} currentTab={currentTab} />
        {((currentTab === UserInfoTabs.CREATION && false) ||
          (currentTab === UserInfoTabs.POSITION && false) ||
          (currentTab === UserInfoTabs.ACTIVITY && false)) && (
          <>
            <HideSmall>
              <AnimatedWrapper style={{ marginTop: 40 }}>
                <AnimatedImg>
                  <img src={Loader} alt="loading-icon" />
                </AnimatedImg>
              </AnimatedWrapper>
            </HideSmall>
            <ShowSmall>
              <AnimatedWrapper style={{ marginTop: 40 }}>
                <AnimatedImg>
                  <img src={Loader} alt="loading-icon" />
                </AnimatedImg>
              </AnimatedWrapper>
            </ShowSmall>
          </>
        )}
        {currentTab === UserInfoTabs.POSITION && (
          <>
            <Table header={['OPTION', 'TYPE', 'AMOUNT', 'CONTRACT ADDRESS', '']} rows={postionDatas} />
          </>
        )}
        {currentTab === UserInfoTabs.CREATION && (
          <>
            <Table header={['OPTION', 'UNDERLYING ASSET', 'ISSUANCE', 'FEE EARN']} rows={creationDatas} />
          </>
        )}
        {currentTab === UserInfoTabs.ACTIVITY && (
          <>
            <Table header={['OPTION', 'TYPE', 'ACTION', 'AMOUNT', 'DATE']} rows={activeDatas} />
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
