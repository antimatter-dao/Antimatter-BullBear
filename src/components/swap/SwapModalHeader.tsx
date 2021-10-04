import { CurrencyAmount, ETHER } from '@uniswap/sdk'
import React, { useContext } from 'react'
import { AlertTriangle } from 'react-feather'
//import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { Auction } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
//import { isAddress, shortenAddress } from '../../utils'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import { SwapShowAcceptChanges } from './styleds'
import { OutlineCard } from 'components/Card'
import { currencyNameHelper } from '../../utils/marketStrategyUtils'
import { OptionPrice } from '../../state/market/hooks'
import { Symbol } from '../../constants'
import { useActiveWeb3React } from '../../hooks'

const TokenPanel = styled.div`
  flex: 1;
  height: 2.5rem;
  flex-direction: row;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 0 16px;
  display: flex;
`

export default function SwapModalHeader({
  auction,
  optionPrice,
  optionCurrencyAmount,
  payTitle,
  payCurrencyAmount,
  showAcceptChanges,
  onAcceptChanges
}: {
  auction: Auction
  optionPrice: OptionPrice | undefined
  optionCurrencyAmount: CurrencyAmount | undefined
  payTitle: string
  payCurrencyAmount: CurrencyAmount | undefined
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  // const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
  //   trade,
  //   allowedSlippage
  // ])
  //const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  //const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const priceCall = optionPrice?.priceCall
  const pricePut = optionPrice?.pricePut
  return (
    <AutoColumn gap={'md'} style={{ marginTop: '20px', padding: '0 1rem' }} justify="center">
      <TYPE.main width={'100%'} color={theme.primary1}>
        Current unit price of {optionCurrencyAmount?.currency.symbol}:{' '}
        {optionCurrencyAmount?.currency?.symbol?.[0] === '+'
          ? priceCall
            ? '$' + priceCall.toSignificant(6)
            : '-'
          : pricePut
          ? '$' + pricePut.toSignificant(6)
          : '-'}
      </TYPE.main>
      <OutlineCard style={{ backgroundColor: 'rgba(0,0,0,.2)', padding: '16px 20px' }}>
        <AutoColumn style={{ flex: 1 }} gap={'8px'}>
          <TYPE.subHeader fontWeight={500} fontSize={14} color={theme.text3}>
            {auction === Auction.BUY ? 'You will receive' : 'You will Pay'}
          </TYPE.subHeader>
          <TokenPanel>
            {optionCurrencyAmount && <CurrencyLogo currency={optionCurrencyAmount.currency} size={'20px'} />}
            <TYPE.black fontWeight={500} fontSize={14} marginLeft={'8px'} flex={1}>
              {currencyNameHelper(optionCurrencyAmount?.currency, 'Call Token')}
            </TYPE.black>
            <TYPE.black fontWeight={500} fontSize={14} marginLeft={'8px'}>
              {optionCurrencyAmount && optionCurrencyAmount.toExact().toString()}
            </TYPE.black>
          </TokenPanel>
        </AutoColumn>
      </OutlineCard>
      <RowFixed />
      <OutlineCard style={{ backgroundColor: 'rgba(0,0,0,.2)', padding: '16px 20px' }}>
        <AutoColumn style={{ flex: 1 }} gap={'8px'}>
          <TYPE.subHeader fontWeight={500} fontSize={14} color={theme.text3}>
            {payTitle}
          </TYPE.subHeader>
          <TokenPanel>
            {payCurrencyAmount && <CurrencyLogo currency={payCurrencyAmount?.currency} size={'20px'} />}
            <TYPE.black fontWeight={500} fontSize={14} marginLeft={'8px'} flex={1}>
              {payCurrencyAmount?.currency === ETHER ? Symbol[chainId ?? 1] : payCurrencyAmount?.currency.symbol}
            </TYPE.black>
            <TYPE.black fontWeight={500} fontSize={14} marginLeft={'8px'}>
              {payCurrencyAmount && payCurrencyAmount.toExact().toString()}
            </TYPE.black>
          </TokenPanel>
        </AutoColumn>
      </OutlineCard>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap={'0px'}>
          <RowBetween>
            <RowFixed>
              <AlertTriangle size={20} style={{ marginRight: '8px', minWidth: 24 }} />
              <TYPE.main color={theme.primary1}> Price Updated</TYPE.main>
            </RowFixed>
            <ButtonPrimary
              style={{ padding: '.5rem', width: 'fit-content', fontSize: '0.825rem', borderRadius: '12px' }}
              onClick={onAcceptChanges}
            >
              Accept
            </ButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}
      {/*<AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>*/}
      {/*  {trade.tradeType === TradeType.EXACT_INPUT ? (*/}
      {/*    <TYPE.small textAlign="left" style={{ width: '100%' }} padding={'8px 0 0 0 '} color={theme.text3}>*/}
      {/*      {`Output is estimated. You will receive at least `}*/}
      {/*      <b>*/}
      {/*        {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}*/}
      {/*      </b>*/}
      {/*      {' or the transaction will revert.'}*/}
      {/*    </TYPE.small>*/}
      {/*  ) : (*/}
      {/*    <TYPE.small textAlign="left" style={{ width: '100%' }} padding={'8px 0 0 0 '} color={theme.text3}>*/}
      {/*      {`Input is estimated. You will sell at most `}*/}
      {/*      <b>*/}
      {/*        {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}*/}
      {/*      </b>*/}
      {/*      {' or the transaction will revert.'}*/}
      {/*    </TYPE.small>*/}
      {/*  )}*/}
      {/*</AutoColumn>*/}
    </AutoColumn>
  )
}
