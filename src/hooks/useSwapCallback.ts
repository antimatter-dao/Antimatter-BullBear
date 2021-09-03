//import { BigNumber } from '@ethersproject/bignumber'
//import { Contract } from '@ethersproject/contracts'
import { useMemo } from 'react'
//import { BIPS_BASE, INITIAL_ALLOWED_SLIPPAGE } from '../constants'
//import { getTradeVersion, useV1TradeExchangeAddress } from '../data/V1'
import { useTransactionAdder } from '../state/transactions/hooks'
//import { calculateGasMargin, getRouterContract, isAddress, shortenAddress } from '../utils'
//import isZero from '../utils/isZero'
//import v1SwapArguments from '../utils/v1SwapArguments'
import { useActiveWeb3React } from './index'
import { useAntimatterRouterContract } from './useContract'
//import useTransactionDeadline from './useTransactionDeadline'
//import useENS from './useENS'
//import { Version } from './useToggledVersion'
import { RouteDelta } from '../state/swap/hooks'
import { Option } from '../state/market/hooks'
import { Currency, JSBI } from '@uniswap/sdk'

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID
}

// interface SwapCall {
//   contract: Contract
//   parameters: SwapParameters
// }

// interface SuccessfulCall {
//   call: SwapCall
//   gasEstimate: BigNumber
// }

// interface FailedCall {
//   call: SwapCall
//   error: Error
// }

//type EstimatedSwapCall = SuccessfulCall | FailedCall

/**
 * Returns the swap calls that can be used to make the trade
 * @param payCurrency
 * @param option
 * @param callAmount
 * @param putAmount
 * @param undPath
 * @param curPath
 * @param routeDelta
 */
// function useSwapCallArguments(
//   trade: Trade | undefined, // trade to execute, required
//   allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
//   recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
// ): SwapCall[] {
//   const { account, chainId, library } = useActiveWeb3React()
//
//   const { address: recipientAddress } = useENS(recipientAddressOrName)
//   const recipient = recipientAddressOrName === null ? account : recipientAddress
//   const deadline = useTransactionDeadline()
//
//   const v1Exchange = useV1ExchangeContract(useV1TradeExchangeAddress(trade), true)
//
//   return useMemo(() => {
//     const tradeVersion = getTradeVersion(trade)
//     if (!trade || !recipient || !library || !account || !tradeVersion || !chainId || !deadline) return []
//
//     const contract: Contract | null =
//       tradeVersion === Version.v2 ? getRouterContract(chainId, library, account) : v1Exchange
//     if (!contract) {
//       return []
//     }
//
//     const swapMethods = []
//
//     switch (tradeVersion) {
//       case Version.v2:
//         swapMethods.push(
//           Router.swapCallParameters(trade, {
//             feeOnTransfer: false,
//             allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
//             recipient,
//             deadline: deadline.toNumber()
//           })
//         )
//
//         if (trade.tradeType === TradeType.EXACT_INPUT) {
//           swapMethods.push(
//             Router.swapCallParameters(trade, {
//               feeOnTransfer: true,
//               allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
//               recipient,
//               deadline: deadline.toNumber()
//             })
//           )
//         }
//         break
//       case Version.v1:
//         swapMethods.push(
//           v1SwapArguments(trade, {
//             allowedSlippage: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
//             recipient,
//             deadline: deadline.toNumber()
//           })
//         )
//         break
//     }
//     return swapMethods.map(parameters => ({ parameters, contract }))
//   }, [account, allowedSlippage, chainId, deadline, library, recipient, trade, v1Exchange])
// }

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  payCurrency: Currency | undefined,
  option: Option | undefined,
  callAmount: string | undefined,
  putAmount: string | undefined,
  undPath: string[] | undefined,
  curPath: string[] | undefined,
  routeDelta: RouteDelta | undefined
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const contract = useAntimatterRouterContract(true)
  return useMemo(() => {
    if (
      !option ||
      !callAmount ||
      !putAmount ||
      !contract ||
      !undPath ||
      !curPath ||
      !routeDelta ||
      !library ||
      !account ||
      !chainId ||
      !payCurrency
    ) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    const { priceFloor, priceCap } = option
    const { undMax, curMax } = routeDelta

    const args = [undPath, curPath, priceFloor, priceCap, callAmount, putAmount, undMax, curMax]
    console.log('args___>',args)
    const payParsedAmount = JSBI.ADD(JSBI.BigInt(undMax), JSBI.BigInt(curMax)).toString()
    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        return contract
          .swap(...args, {
            value: payCurrency.symbol === 'ETH' && payParsedAmount[0] !== '-' ? payParsedAmount : '0',
            from: account
          })
          .then((response: any) => {
            addTransaction(response, {
              summary: ''
            })

            return response.hash
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.')
            } else {
              // otherwise, the error was unexpected and we need to convey that
              console.error(`Swap failed`, error, args)
              throw new Error(`Swap failed: ${error.message}`)
            }
          })
      },
      error: null
    }
  }, [
    option,
    callAmount,
    putAmount,
    contract,
    undPath,
    curPath,
    routeDelta,
    library,
    account,
    chainId,
    payCurrency,
    addTransaction
  ])
}
