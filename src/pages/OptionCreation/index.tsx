import React, { useState, useCallback } from 'react'
import { Currency } from '@uniswap/sdk'
import { Plus } from 'react-feather'
import styled from 'styled-components'
import AppBody from 'pages/AppBody'
import { RowBetween, RowFixed } from 'components/Row'
import { TYPE } from 'theme'
import { AutoColumn } from 'components/Column'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import ButtonSelect from 'components/Button/ButtonSelect'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'
import { currencyNameHelper } from 'utils/marketStrategyUtils'
import NumberInputPanel from 'components/NumberInputPanel'
import { ButtonPrimary } from 'components/Button'
import { USDT } from '../../constants'
import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { OutlineCard, TranslucentCard } from 'components/Card'
import { SubmittedView } from 'components/ModalViews'
import { Dots } from 'components/swap/styleds'

const InputWrapper = styled(RowBetween)`
  & > div {
    width: 46%;
  }
`

// const asset1List = {
//   USDT: USDT
// }
const asset1Options = [
  {
    id: 'USDT',
    option: (
      <RowFixed>
        <CurrencyLogo currency={USDT} size="24px" style={{ marginRight: 20 }} /> {USDT.symbol}
      </RowFixed>
    )
  }
]

export default function OptionCreation() {
  const [asset0, setAsset0] = useState<Currency | undefined>(undefined)
  const [asset1Id, setAsset1Id] = useState<string>('')
  // const asset1 = asset1List[asset1Id as keyof typeof asset1List]
  const [currencySearchOpen, setCurrencySearchOpen] = useState(false)
  const [floor, setFloor] = useState('')
  const [cap, setCap] = useState('')
  const [txHash, setTxHash] = useState<string>('')
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn] = useState<boolean>(false) // clicked confirm

  const theme = useTheme()

  const handleSelectAsset0 = useCallback((currency: Currency) => setAsset0(currency), [])
  const handleSelectAsset1 = useCallback((id: string) => setAsset1Id(id), [])
  const handleDismissSearch = useCallback(() => setCurrencySearchOpen(false), [])
  const handleOpenAssetSearch = useCallback(() => setCurrencySearchOpen(true), [])
  const handleFloor = useCallback((floor: string) => setFloor(floor), [])
  const handleCap = useCallback((cap: string) => setCap(cap), [])
  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setTxHash('')
  }, [])

  const createdOption = `${asset0?.symbol} (${floor}$${cap})`
  const modalHeader = () => {
    return (
      <TYPE.mediumHeader style={{ textAlign: 'center', marginTop: '30px' }}>
        You will create the option {createdOption}{' '}
      </TYPE.mediumHeader>
    )
  }
  const modalBottom = () => {
    return (
      <AutoColumn gap="32px">
        <OutlineCard style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <AutoColumn justify="center" gap="16px">
            <TYPE.body fontSize={14}>Initial deployment cost</TYPE.body>
            <RowBetween>
              <TranslucentCard width="46%"></TranslucentCard>
              <Plus size={14} />
              <TranslucentCard width="46%"></TranslucentCard>
            </RowBetween>
          </AutoColumn>
        </OutlineCard>
        <ButtonPrimary>Confirm</ButtonPrimary>
      </AutoColumn>
    )
  }

  const submittedContent = () => {
    return (
      <SubmittedView onDismiss={handleDismissConfirmation} hash={undefined}>
        <AutoColumn gap="32px">
          <AutoColumn gap="5px">
            <TYPE.body fontSize={18}>Congratulations!</TYPE.body>
            <TYPE.body fontSize={14}>You have successfully create your option ETH(1000$3000)</TYPE.body>
          </AutoColumn>
          <OutlineCard style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}></OutlineCard>
          <ButtonPrimary>Close</ButtonPrimary>
        </AutoColumn>
      </SubmittedView>
    )
  }
  return (
    <>
      <CurrencySearchModal
        isOpen={currencySearchOpen}
        onDismiss={handleDismissSearch}
        onCurrencySelect={handleSelectAsset0}
        hasManage={true}
      />
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={() => (
          <ConfirmationModalContent
            title="Creation confirmation"
            onDismiss={handleDismissConfirmation}
            topContent={modalHeader}
            bottomContent={modalBottom}
          />
        )}
        pendingText={`Creation the option ${createdOption} `}
        submittedContent={submittedContent}
      />
      <AppBody maxWidth="560px">
        <AutoColumn gap="30px">
          <RowFixed>
            <TYPE.largeHeader>Option Creation</TYPE.largeHeader>
          </RowFixed>
          <AutoColumn gap="15px">
            <TYPE.body>1. Option underlying asset pair:</TYPE.body>
            <RowBetween>
              <ButtonSelect
                width="46%"
                onClick={handleOpenAssetSearch}
                label="Asset to create option "
                marginRight="0"
                disabled
              >
                <TYPE.body color={asset0 ? theme.text1 : theme.text3}>
                  <RowFixed>
                    {asset0 && <CurrencyLogo currency={asset0} size={'24px'} style={{ marginRight: 20 }} />}
                    {currencyNameHelper(asset0, 'Select asset')}
                  </RowFixed>
                </TYPE.body>
              </ButtonSelect>
              <Plus size={30} style={{ marginTop: 20 }} color={theme.text3} />
              <ButtonSelect
                width="46%"
                label="Underlying asset"
                placeholder="Select asset"
                marginRight="0"
                selectedId={asset1Id}
                onSelection={handleSelectAsset1}
                options={asset1Options}
                disabled
              />
            </RowBetween>
          </AutoColumn>
          <AutoColumn gap="15px">
            <TYPE.body>2. Option underlying asset pair:</TYPE.body>
            <InputWrapper>
              <NumberInputPanel
                label="Price Floor"
                id="floor"
                value={floor}
                onUserInput={handleFloor}
                showMaxButton={false}
                hideBalance={true}
              />
              <NumberInputPanel
                label="Price Ceiling"
                id="cap"
                value={cap}
                onUserInput={handleCap}
                showMaxButton={false}
                hideBalance={true}
              />
            </InputWrapper>
          </AutoColumn>
          <ButtonPrimary disabled>
            Coming Soon <Dots />
          </ButtonPrimary>
        </AutoColumn>
      </AppBody>
    </>
  )
}
