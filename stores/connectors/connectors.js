import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { NetworkConnector } from "@web3-react/network-connector";

const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  43114: "https://nd-614-417-636.p2pify.com/f42034ae8424ee0821a4fd6c3c39ce8d/ext/bc/C/rpc",
  43113: "https://rpc.ankr.com/avalanche_fuji"
};

let obj = {}
if(process.env.NEXT_PUBLIC_CHAINID == 43114) {
  obj = { 43114: RPC_URLS[43114] }
} else {
  obj = { 43113: RPC_URLS[43113] }
}

export const network = new NetworkConnector({ urls: obj });

export const injected = new InjectedConnector({
  supportedChainIds: [parseInt(process.env.NEXT_PUBLIC_CHAINID)]
});

export const walletconnect = new WalletConnectConnector({
  rpc: {
    43114: RPC_URLS[43114],
    43113: RPC_URLS[43113]
  },
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAINID),
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: POLLING_INTERVAL
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[process.env.NEXT_PUBLIC_CHAINID],
  appName: "Glacier",
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAINID),
});
