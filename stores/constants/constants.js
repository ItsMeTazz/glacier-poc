import BigNumber from 'bignumber.js'
import * as contractsTestnet from './contractsTestnet'
import * as contracts from './contracts'
import * as actions from './actions'

let isTestnet = process.env.NEXT_PUBLIC_CHAINID == 4002

// URLS
let scan = 'https://snowtrace.io/'
let cont = contracts

if(isTestnet) {
  scan = 'https://testnet.snowtrace.io/'
  cont = contractsTestnet
}

export const ETHERSCAN_URL = scan

export const CONTRACTS = cont
//export const CONTRACTS = contractsTestnet

export const ACTIONS = actions

export const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toFixed(0)
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const FALLBACK_RPC = 'https://rpc.ankr.com/avalanche'
