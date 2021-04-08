import { ChainId, Token, ETHER } from '@uniswap/sdk'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { UNI } from '../index'

interface Currencies {
  ETH_CALL: Token
  ETH_PUT: Token
  MATTER: Token
  DAI: Token
  ETHER: Token
}

export const currencies: {
  [chainId in ChainId]?: Currencies
} = {
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
  ETH_CALL_DAI = '+ETH/DAI>+MATTER($1)',
  ETH_PUT_DAI = '-ETH/DAI>+MATTER($1)',
  MATTER_ETH = 'MATTER/ETH>+MATTER($1)'
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
    }
  }
}

export const LPT_rewardPerDay = {
  [LPT_TYPE.ETH_CALL_DAI]: '100',
  [LPT_TYPE.ETH_PUT_DAI]: '200',
  [LPT_TYPE.MATTER_ETH]: '300'
}
