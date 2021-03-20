import { Trade, TradeType } from '@uniswap/sdk'
import React, { useContext, useMemo } from 'react'
import { ArrowDown, AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { isAddress, shortenAddress } from '../../utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import { TruncatedText, SwapShowAcceptChanges } from './styleds'
import Card from 'components/Card'

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges
}: {
  trade: Trade
  allowedSlippage: number
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    trade,
    allowedSlippage
  ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap={'md'} style={{ marginTop: '20px', padding: '0 1rem' }} justify="center">
      <Card style={{ backgroundColor: theme.translucent }} padding="14px">
        <RowBetween justify="space-between">
          <RowFixed gap={'0px'}>
            <Text color={theme.text2}>From: </Text>
            <CurrencyLogo currency={trade.inputAmount.currency} size={'28px'} style={{ margin: '0 12px' }} />
            <Text fontSize={16} fontWeight={500} style={{ marginLeft: '10px' }}>
              {trade.inputAmount.currency.symbol}
            </Text>
          </RowFixed>
          <RowFixed gap={'0px'}>
            <TruncatedText
              fontSize={16}
              fontWeight={500}
              color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? theme.primary1 : ''}
            >
              {trade.inputAmount.toSignificant(6)}
            </TruncatedText>
          </RowFixed>
        </RowBetween>
      </Card>
      <RowFixed>
        <ArrowDown size="30" color={theme.text1} style={{ marginLeft: '4px', minWidth: '14px' }} />
      </RowFixed>
      <Card style={{ backgroundColor: theme.translucent }} padding="14px">
        <RowBetween justify="space-between">
          <RowFixed gap={'0px'}>
            <Text color={theme.text2}>To: </Text>
            <CurrencyLogo currency={trade.outputAmount.currency} size={'28px'} style={{ margin: '0 12px' }} />
            <Text fontSize={16} fontWeight={500} style={{ marginLeft: '10px' }}>
              {trade.outputAmount.currency.symbol}
            </Text>
          </RowFixed>
          <RowFixed gap={'0px'}>
            <TruncatedText
              fontSize={16}
              fontWeight={500}
              color={
                priceImpactSeverity > 2
                  ? theme.red1
                  : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
                  ? theme.primary1
                  : ''
              }
            >
              {trade.outputAmount.toSignificant(6)}
            </TruncatedText>
          </RowFixed>
        </RowBetween>
      </Card>
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
      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <TYPE.small textAlign="left" style={{ width: '100%' }} padding={'8px 0 0 0 '} color={theme.text3}>
            {`Output is estimated. You will receive at least `}
            <b>
              {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.small>
        ) : (
          <TYPE.small textAlign="left" style={{ width: '100%' }} padding={'8px 0 0 0 '} color={theme.text3}>
            {`Input is estimated. You will sell at most `}
            <b>
              {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </TYPE.small>
        )}
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <TYPE.main>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </TYPE.main>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
