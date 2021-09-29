import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Currency } from '@uniswap/sdk'
import { Plus } from 'react-feather'
import styled from 'styled-components'
import debounce from 'lodash.debounce'
import AppBody, { BodyHeader } from 'pages/AppBody'
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
import { WUSDT, WDAI, WUSDC } from '../../constants'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent
} from 'components/TransactionConfirmationModal'
import { SubmittedView } from 'components/ModalViews'
import { useCreationCallback } from 'hooks/useCreationCallback'
import { useTransactionAdder } from 'state/transactions/hooks'
import DataCard from 'components/Card/DataCard'
import { useActiveWeb3React } from 'hooks'

const InputWrapper = styled(RowBetween)`
  & > div {
    width: 46%;
  }
`
const underlyingAssetList = [WUSDT, WDAI, WUSDC]

enum ERROR {
  CAP_TOO_LARGE = 'Price cap should not be larger than four times price cap',
  FLOOR_TOO_LARGE = 'Price floor should be smaller than price cap',
  FLOOR_REQUIRED = 'Price floor is required',
  CAP_REQUIRED = 'Price cap is required',
  CURRENCY_REQUIRED = 'Currency  is required',
  UNDERLYING_REQUIRED = 'Underlying is required'
}

export default function OptionCreation() {
  const { chainId } = useActiveWeb3React()
  const [asset0, setAsset0] = useState<Currency | undefined>(undefined)
  const [asset1, setAsset1] = useState<Currency | undefined>(undefined)
  const [currencySearchOpen, setCurrencySearchOpen] = useState(false)
  const [floor, setFloor] = useState('')
  const [cap, setCap] = useState('')
  const [txHash, setTxHash] = useState<string>('')
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [txnError, setTxnError] = useState('')
  const [error, setError] = useState('')
  const { callback: creationCallback } = useCreationCallback()
  const addTransaction = useTransactionAdder()

  const theme = useTheme()

  const asset1Options = useMemo(() => {
    return underlyingAssetList.map((wrappedCurrency: any) => {
      const currency = wrappedCurrency[chainId as number]
      return {
        id: currency.symbol ?? '',
        currency,
        option: (
          <RowFixed>
            <CurrencyLogo currency={currency} size="24px" style={{ marginRight: 20 }} /> {currency.symbol}
          </RowFixed>
        )
      }
    })
  }, [chainId])

  const handleSelectAsset0 = useCallback((currency: Currency) => setAsset0(currency), [])
  const handleSelectAsset1 = useCallback(
    (assetId: string) => {
      setAsset1(asset1Options?.find(({ id }) => assetId === id)?.currency)
    },
    [asset1Options]
  )
  const handleDismissSearch = useCallback(() => setCurrencySearchOpen(false), [])
  const handleOpenAssetSearch = useCallback(() => setCurrencySearchOpen(true), [])
  const handleFloor = useCallback((floor: string) => setFloor(floor), [])
  const handleCap = useCallback((cap: string) => setCap(cap), [])
  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setAttemptingTxn(false)
    setTxHash('')
    setTxnError('')
  }, [])

  const handleNext = () => {
    let errorString = ''
    if (floor && cap && +cap > +floor * 4) errorString = ERROR.CAP_TOO_LARGE
    if (floor && cap && +floor > +cap) errorString = ERROR.FLOOR_TOO_LARGE
    if (!floor) errorString = ERROR.FLOOR_REQUIRED
    if (!cap) errorString = ERROR.CAP_REQUIRED
    if (!asset1) errorString = ERROR.CURRENCY_REQUIRED
    if (!asset0) errorString = ERROR.UNDERLYING_REQUIRED
    setError(errorString)
    if (errorString) return
    setShowConfirm(true)
  }

  useEffect(() => {
    debounce(() => {
      let errorString = ''
      if (floor && cap && +cap > +floor * 4) errorString = ERROR.CAP_TOO_LARGE
      if (floor && cap && +floor > +cap) errorString = ERROR.FLOOR_TOO_LARGE
      if ((floor || cap) && !asset1) errorString = ERROR.CURRENCY_REQUIRED
      if ((floor || cap) && !asset0) errorString = ERROR.UNDERLYING_REQUIRED
      setError(errorString)
    }, 1000)()
  }, [asset0, asset1, cap, floor])

  const createdOption = `${asset0?.symbol} (${floor}$${cap})`

  const handleCreate = () => {
    if (creationCallback) {
      setAttemptingTxn(true)
      creationCallback(asset0, asset1, floor, cap)
        .then((response: any) => {
          setAttemptingTxn(false)
          addTransaction(response, {
            summary: `Create option ${createdOption}`
          })
          setTxHash(response.hash)
        })
        .catch((error: any) => {
          setTxHash('error')
          setAttemptingTxn(false)
          if (error?.code === 4001) {
            handleDismissConfirmation()
            return
          }
          setTxnError(error.message)
          console.error('---->', error)
        })
    }
  }

  //   addTransaction(response, {
  //     summary: 'Create proposal "' + input.title + '"'
  //   })
  //   setTxHash(response.hash)
  // })
  // )
  // .catch(error => {
  // setAttemptingTxn(false)
  // setTxHash('error')
  // if (error?.code !== 4001) {
  //   setSubmitError(error)
  //   console.error('---->', error)
  // }
  // })

  const modalHeader = () => {
    return (
      <TYPE.mediumHeader style={{ textAlign: 'center', marginTop: '30px' }}>
        You will create the option {createdOption}{' '}
      </TYPE.mediumHeader>
    )
  }
  const modalBottom = () => {
    return (
      <>
        <AutoColumn gap="32px">
          <DataCard
            rowHeight="22px"
            data={[
              {
                title: 'Underlying Asset:',
                content: (
                  <RowFixed>
                    <CurrencyLogo currency={asset0} style={{ marginRight: 5 }} />
                    {asset0?.symbol}
                  </RowFixed>
                )
              },
              {
                title: 'Currency',
                content: (
                  <RowFixed>
                    <CurrencyLogo currency={asset1} style={{ marginRight: 5 }} />
                    {asset1?.symbol}
                  </RowFixed>
                )
              },
              {
                title: 'Price floor',
                content: `${floor}${asset1?.symbol ?? ''}`
              },
              {
                title: 'Price cap',
                content: `${cap}${asset1?.symbol ?? ''}`
              }
            ]}
            // bgColor="rgba(255,255,255,.08)"
          />
          <ButtonPrimary onClick={handleCreate}>Confirm</ButtonPrimary>
        </AutoColumn>
        {/* 
        <OutlineCard style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <AutoColumn justify="center" gap="16px">
             <TYPE.body fontSize={14}>Initial deployment cost</TYPE.body>
           <RowBetween>
              <TranslucentCard width="46%" padding="10px 12px">
                <RowBetween>
                  <CurrencyLogo currency={asset0} />
                  <TYPE.body>123</TYPE.body>
                </RowBetween>
              </TranslucentCard>
              <Plus size={14} />
              <TranslucentCard width="46%" padding="10px 12px">
                <RowBetween>
                  <CurrencyLogo currency={asset1} />
                  <TYPE.body>123</TYPE.body>
                </RowBetween>
              </TranslucentCard>
            </RowBetween> 
  
          </AutoColumn>
        </OutlineCard> 
   */}
      </>
    )
  }

  const submittedContent = () => {
    return (
      <>
        {txnError ? (
          <TransactionErrorContent onDismiss={handleDismissConfirmation} message={txnError} />
        ) : (
          <SubmittedView onDismiss={handleDismissConfirmation} hash={undefined}>
            {/* <AutoColumn gap="32px">
              <AutoColumn gap="5px">
                <TYPE.body fontSize={18}>Congratulations!</TYPE.body>
                <TYPE.body fontSize={14}>You have successfully create your option ETH(1000$3000)</TYPE.body>
              </AutoColumn>
              <OutlineCard style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}></OutlineCard>
            </AutoColumn> */}
            <AutoColumn gap="24px" justify={'center'}>
              <TYPE.body fontSize={18}>Transaction Submitted</TYPE.body>
            </AutoColumn>
          </SubmittedView>
        )}
      </>
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
          <BodyHeader title="Option Creation" />
          <AutoColumn gap="15px">
            <TYPE.body>1. Option underlying asset pair:</TYPE.body>
            <RowBetween>
              <ButtonSelect width="46%" onClick={handleOpenAssetSearch} label="Asset to create option " marginRight="0">
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
                selectedId={asset1 ? asset1.symbol : ''}
                onSelection={handleSelectAsset1}
                options={asset1Options}
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
                placeholder="Enter Price Floor"
              />
              <NumberInputPanel
                label="Price Ceiling"
                id="cap"
                value={cap}
                onUserInput={handleCap}
                showMaxButton={false}
                hideBalance={true}
                placeholder="Enter Price Ceiling"
              />
            </InputWrapper>
          </AutoColumn>
          <TYPE.body color={theme.primary1} fontSize={14} height={16}>
            {error}{' '}
          </TYPE.body>
          <ButtonPrimary onClick={handleNext}>Create</ButtonPrimary>
        </AutoColumn>
      </AppBody>
    </>
  )
}
