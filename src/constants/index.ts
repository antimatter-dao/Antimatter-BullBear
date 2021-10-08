import { ChainId, JSBI, Percent, Token, WETH } from '@uniswap/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { fortmatic, injected, portis, walletconnect, walletlink } from '../connectors'

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  [ChainId.ROPSTEN]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  [ChainId.BSC]: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  [ChainId.Arbitrum]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  [ChainId.Avalanche]: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106'
}

export const ANTIMATTER_ADDRESS = '0x90183C741CC13195884B6E332Aa0ac1F7c1E67Fa'

export const ANTIMATTER_ROUTER_ADDRESS = '0xf80975Be2840C1422d3D9E5B198c49781E7fe299'

export const ANTIMATTER_GOVERNANCE_ADDRESS = '0x78fC5460737EB07Ce9e7d954B294ecA7E6203D19'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export { PRELOADED_PROPOSALS } from './proposals'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

const UNI_ADDRESS = '0x1C9491865a1DE77C5b6e19d2E6a5F1D7a6F2b25F'

export const Matter = new Token(ChainId.MAINNET, UNI_ADDRESS, 18, 'MATTER', 'Antimatter.Finance Governance Token')
export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USDC')
export const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
export const COMP = new Token(ChainId.MAINNET, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
export const MKR = new Token(ChainId.MAINNET, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
export const AMPL = new Token(ChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
export const WBTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC')

export const WUSDT = {
  [ChainId.MAINNET]: USDT,
  [ChainId.ROPSTEN]: new Token(ChainId.MAINNET, '0x6ee856ae55b6e1a249f04cd3b947141bc146273c', 6, 'USDT', 'Tether USD'),
  [ChainId.BSC]: new Token(
    ChainId.BSC,
    '0x55d398326f99059ff775485246999027b3197955',
    18,
    'BUSDT',
    'Binance-Peg BSC-USD'
  ),
  [ChainId.Arbitrum]: new Token(
    ChainId.Arbitrum,
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    6,
    'USDT',
    'Tether USD'
  ),
  [ChainId.Avalanche]: new Token(
    ChainId.Avalanche,
    '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    6,
    'USDT.e',
    'Tether USD'
  )
}

export const WDAI = {
  [ChainId.MAINNET]: DAI,
  [ChainId.ROPSTEN]: new Token(
    ChainId.MAINNET,
    '0xad6d458402f60fd3bd25163575031acdce07538d',
    18,
    'DAI',
    'Dai Stablecoin'
  )
}

export const WUSDC = {
  [ChainId.MAINNET]: USDC,
  [ChainId.ROPSTEN]: USDC
}

export const ETH_CALL = new Token(
  ChainId.MAINNET,
  '0x3843a61f2960108287A51806c683fc854dC00354',
  18,
  '+ETH($1000)',
  'AntiMatter.Finance ETH Perpetual Bull Option Floor $1000 Cap $3000'
)
export const ETH_PUT = new Token(
  ChainId.MAINNET,
  '0xfE41168Fe09359c4b010E414c724c643dF4159A3',
  18,
  '-ETH($3000)',
  'AntiMatter.Finance ETH Perpetual Bear Option Floor $1000 Cap $3000'
)
export const MATTER_CALL = new Token(
  ChainId.MAINNET,
  '0xD5eE7F431fFB7F03a19CFAE69A1E75a450Ec2021',
  18,
  '+MATTER($1)',
  'AntiMatter.Finance MATTER Perpetual Bull Option Floor $1 Cap $100'
)

// Block time here is slightly higher (~1s) than average in order to avoid ongoing proposals past the displayed time
export const AVERAGE_BLOCK_TIME_IN_SECS = 13
export const PROPOSAL_LENGTH_IN_BLOCKS = 40_320
export const PROPOSAL_LENGTH_IN_SECS = AVERAGE_BLOCK_TIME_IN_SECS * PROPOSAL_LENGTH_IN_BLOCKS

export const GOVERNANCE_ADDRESS = '0x78fC5460737EB07Ce9e7d954B294ecA7E6203D19'

export const TIMELOCK_ADDRESS = '0x1a9C8182C09F50C8318d769245beA52c32BE35BC'

export const UNI: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, UNI_ADDRESS, 18, 'MATTER', 'Matter'),
  [ChainId.BSC]: new Token(ChainId.BSC, UNI_ADDRESS, 18, 'MATTER', 'Matter'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, UNI_ADDRESS, 18, 'MATTER', 'Matter'),
  [ChainId.Arbitrum]: new Token(ChainId.Arbitrum, UNI_ADDRESS, 18, 'MATTER', 'Matter'),
  [ChainId.Avalanche]: new Token(ChainId.Avalanche, UNI_ADDRESS, 18, 'MATTER', 'Matter')
}

export const COMMON_CONTRACT_NAMES: { [address: string]: string } = {
  [UNI_ADDRESS]: 'UNI',
  [GOVERNANCE_ADDRESS]: 'Governance',
  [TIMELOCK_ADDRESS]: 'Timelock'
}

// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x090D4613473dEE047c3f2706764f49E0821D256e'
}

const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.ROPSTEN]: [WETH[ChainId.ROPSTEN]],
  [ChainId.BSC]: [WETH[ChainId.BSC]],
  [ChainId.Arbitrum]: [WETH[ChainId.Arbitrum]],
  [ChainId.Avalanche]: [WETH[ChainId.Avalanche]]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, COMP, WBTC],
  [ChainId.BSC]: [WUSDT[ChainId.BSC]],
  [ChainId.Arbitrum]: [WUSDT[ChainId.Arbitrum]],
  [ChainId.Avalanche]: [WUSDT[ChainId.Avalanche]]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    [AMPL.address]: [DAI, WETH[ChainId.MAINNET]]
  }
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, WBTC]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, WBTC]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')
    ],
    [USDC, USDT],
    [DAI, USDT]
  ]
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: 'WalletConnect',
    iconName: 'walletConnectIcon.svg',
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true
  },
  WALLET_LINK: {
    connector: walletlink,
    name: 'Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Use Coinbase Wallet app on mobile device',
    href: null,
    color: '#315CF5'
  },
  COINBASE_LINK: {
    name: 'Open in Coinbase Wallet',
    iconName: 'coinbaseWalletIcon.svg',
    description: 'Open in Coinbase Wallet app.',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    color: '#315CF5',
    mobile: true,
    mobileOnly: true
  },
  FORTMATIC: {
    connector: fortmatic,
    name: 'Fortmatic',
    iconName: 'fortmaticIcon.png',
    description: 'Login using Fortmatic hosted wallet',
    href: null,
    color: '#6748FF',
    mobile: true
  },
  Portis: {
    connector: portis,
    name: 'Portis',
    iconName: 'portisIcon.png',
    description: 'Login using Portis hosted wallet',
    href: null,
    color: '#4A6C9B',
    mobile: true
  }
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

// used for rewards deadlines
export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
  '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
  '0x901bb9583b24D97e995513C6778dc6888AB6870e',
  '0xA7e5d5A720f06526557c513402f2e6B5fA20b008',
  '0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91353C'
]

export const Symbol: { readonly [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: 'ETH',
  [ChainId.ROPSTEN]: 'ETH',
  [ChainId.BSC]: 'BNB',
  [ChainId.Avalanche]: 'AVAX',
  [ChainId.Arbitrum]: 'ETH'
}

export const Name: { readonly [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: 'ETHER',
  [ChainId.ROPSTEN]: 'ETHER',
  [ChainId.BSC]: 'Binance Coin',
  [ChainId.Avalanche]: 'Avalanche',
  [ChainId.Arbitrum]: 'ETHER'
}

// class MainCurrency extends Currency {
//   //eslint-disable-next-line
//   constructor(decimals: number, symbol?: string, name?: string) {
//     super(decimals, symbol, name)
//   }
// }

// export const MAIN_CURRENCY: { readonly [chainId in ChainId]?: Currency } = {
//   [ChainId.MAINNET]: ETHER,
//   [ChainId.ROPSTEN]: ETHER,
//   [ChainId.BSC]: new MainCurrency(8, Symbol[ChainId.BSC], Name[ChainId.BSC]),
//   [ChainId.Avalanche]: new MainCurrency(18, Symbol[ChainId.Avalanche], Name[ChainId.Avalanche]),
//   [ChainId.Arbitrum]: ETHER
// }
