import { ChainId, Token, ETHER } from '@uniswap/sdk'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { ETH_CALL, ETH_PUT, MATTER_CALL, UNI, USDT } from '../index'

interface Currencies {
  ETH_CALL?: Token
  ETH_PUT?: Token
  MATTER?: Token
  DAI?: Token
  ETHER?: Token
}

export const currencies: {
  [chainId in ChainId]?: Currencies
} = {
  [ChainId.MAINNET]: {
    ETHER: wrappedCurrency(ETHER, ChainId.MAINNET)
  },
  [ChainId.ROPSTEN]: {
    ETH_CALL: new Token(ChainId.ROPSTEN, '0x1dA4A25AE837259cB2f14E362BA94aF015F77d7d', 18, 'ETH+', 'ETH+'),
    ETH_PUT: new Token(ChainId.ROPSTEN, '0x747434F3334Ec885De96e2A8e053DcAeE0E7F492', 18, 'ETH-', 'ETH-'),
    MATTER: UNI[ChainId.ROPSTEN],
    DAI: new Token(ChainId.ROPSTEN, '0xaD6D458402F60fD3Bd25163575031ACDce07538D', 18, 'DAI', 'Dai Stablecoin'),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ETHER: wrappedCurrency(ETHER, ChainId.ROPSTEN)!
  }
}
export enum LPT_TYPE {
  ETH_CALL_DAI = '+ETH($1000)/USDT LP Pool',
  ETH_PUT_DAI = '-ETH($3000)/USDT LP Pool',
  MATTER_ETH = 'MATTER/ETH LP Pool',
  MATTER_CALL_MATTER = '+MATTER($1)/MATTER LP Pool'
}

export enum LPT_CYCLE_REWARDS {
  ETH_CALL_DAI = 1000,
  ETH_PUT_DAI = 1000,
  MATTER_ETH = 1000
}

export const LPT_PAIRS: {
  [chainId in ChainId]?: {
    [lptType in LPT_TYPE]: { title: string; currencyA: Token | undefined; currencyB: Token | undefined }
  }
} = {
  [ChainId.MAINNET]: {
    [LPT_TYPE.ETH_CALL_DAI]: {
      title: '+ETH($1000)/USDT LP Pool',
      currencyA: ETH_CALL,
      currencyB: USDT
    },
    [LPT_TYPE.ETH_PUT_DAI]: {
      title: '-ETH($3000)/USDT LP Pool',
      currencyA: ETH_PUT,
      currencyB: USDT
    },
    [LPT_TYPE.MATTER_ETH]: {
      title: 'MATTER/ETH LP Pool',
      currencyA: UNI[ChainId.MAINNET],
      currencyB: currencies[ChainId.MAINNET]?.ETHER
    },
    [LPT_TYPE.MATTER_CALL_MATTER]: {
      title: '+MATTER($1)/MATTER LP Pool',
      currencyA: MATTER_CALL,
      currencyB: UNI[ChainId.MAINNET]
    }
  },
  [ChainId.ROPSTEN]: {
    [LPT_TYPE.ETH_CALL_DAI]: {
      title: '+ETH/DAI>+MATTER($1)',
      currencyA: currencies[ChainId.ROPSTEN]?.ETH_CALL,
      currencyB: currencies[ChainId.ROPSTEN]?.DAI
    },
    [LPT_TYPE.ETH_PUT_DAI]: {
      title: '-ETH/DAI>+MATTER($1)',
      currencyA: currencies[ChainId.ROPSTEN]?.ETH_PUT,
      currencyB: currencies[ChainId.ROPSTEN]?.DAI
    },
    [LPT_TYPE.MATTER_ETH]: {
      title: 'MATTER/ETH>+MATTER($1)',
      currencyA: currencies[ChainId.ROPSTEN]?.MATTER,
      currencyB: currencies[ChainId.ROPSTEN]?.ETHER
    },
    [LPT_TYPE.MATTER_CALL_MATTER]: {
      title: '+MATTER($1)/MATTER LP Pool',
      currencyA: currencies[ChainId.ROPSTEN]?.MATTER,
      currencyB: currencies[ChainId.ROPSTEN]?.ETHER
    }
  }
}

export const LPT_RewardPerDay = {
  [LPT_TYPE.ETH_CALL_DAI]: '1000',
  [LPT_TYPE.ETH_PUT_DAI]: '1000',
  [LPT_TYPE.MATTER_ETH]: '1000',
  [LPT_TYPE.MATTER_CALL_MATTER]: '333'
}
