import React, { useContext, useState } from 'react'
import { ReactComponent as Repeat } from '../../assets/svg/repeat.svg'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { OutlineCard } from 'components/Card'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { StyledBalanceMaxMini, SwapCallbackError } from './styleds'

export default function SwapModalFooter({
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm
}: {
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useContext(ThemeContext)
  // const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
  //   allowedSlippage,
  //   trade
  // ])
  // const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  // const severity = warningSeverity(priceImpactWithoutFee)

  return (
    <>
      <OutlineCard style={{ backgroundColor: 'rgba(0,0,0,.2)', display: 'none' }}>
        <AutoColumn gap="0px">
          <RowBetween align="center">
            <Text fontWeight={400} fontSize={12} color={theme.text2}>
              Price
            </Text>
            <Text
              fontWeight={500}
              fontSize={12}
              color={theme.text1}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                textAlign: 'right',
                paddingLeft: '10px'
              }}
            >
              <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
                <Repeat />
              </StyledBalanceMaxMini>
            </Text>
          </RowBetween>

          <RowBetween>
            <RowFixed>
              <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
                {/*{trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}*/}
              </TYPE.black>
              <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
            </RowFixed>
            <RowFixed>
              <TYPE.black fontSize={12}></TYPE.black>
              <TYPE.black fontSize={12} marginLeft={'4px'}></TYPE.black>
            </RowFixed>
          </RowBetween>
          <RowBetween>
            <RowFixed>
              <TYPE.black color={theme.text2} fontSize={12} fontWeight={400}>
                Price Impact
              </TYPE.black>
              <QuestionHelper text="The difference between the market price and your price due to trade size." />
            </RowFixed>
            {/*<FormattedPriceImpact priceImpact={priceImpactWithoutFee} />*/}
          </RowBetween>
          <RowBetween>
            <RowFixed>
              <TYPE.black fontSize={12} fontWeight={400} color={theme.text2}>
                Liquidity Provider Fee
              </TYPE.black>
              <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
            </RowFixed>
            <TYPE.black fontSize={12}>
              {/*{realizedLPFee ? realizedLPFee?.toSignificant(6) + ' ' + trade.inputAmount.currency.symbol : '-'}*/}
            </TYPE.black>
          </RowBetween>
        </AutoColumn>
      </OutlineCard>
      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          // disabled={disabledConfirm}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-swap-or-send"
        >
          <Text fontSize={16} fontWeight={500}>
            Confirm Trade
          </Text>
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
