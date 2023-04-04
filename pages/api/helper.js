import {
  PairFactoryABI,
  PairABI,
  tokenABI,
  VoterABI,
  gaugeABI,
  InternalBribeABI,
  ExternalBribeABI,
} from "./constants/abis";
import {
  PairFactoryContractAddress,
  VoterContractAddress,
  EqualTokenAddress,
} from "./constants/addresses";
import Web3 from "web3";
import fetchDBPairs, { updateDBPairs } from "../../utils/firestoreHelper";
import axios from "axios";
import BigNumber from "bignumber.js";

const web3 = new Web3();
web3.setProvider(
  new web3.providers.HttpProvider("https://api.avax.network/ext/bc/C/rpc")
);

const PairFactoryContract = new web3.eth.Contract(
  PairFactoryABI,
  PairFactoryContractAddress
);
const VoterContract = new web3.eth.Contract(VoterABI, VoterContractAddress);

async function _getPairData(i) {
  const pairContractAddress = await PairFactoryContract.methods
    .allPairs(i)
    .call();
  const PairContract = await new web3.eth.Contract(
    PairABI,
    pairContractAddress
  );

  const gaugesAddress = await VoterContract.methods
    .gauges(pairContractAddress)
    .call();

  // Check if gaugesAddress is not 0, and proceed only if it's a non-zero address
  if (gaugesAddress !== "0x0000000000000000000000000000000000000000") {
    const gaugeContract = await new web3.eth.Contract(gaugeABI, gaugesAddress);

    const gaugeLPTotalSupply = await gaugeContract.methods.totalSupply().call();

    const token0Address = await PairContract.methods.token0().call();
    const token1Address = await PairContract.methods.token1().call();

    const token0 = await _getTokenDetails(token0Address);
    const token1 = await _getTokenDetails(token1Address);

    // Check if token details are not null
    if (token0 && token1) {
      const reserves = await PairContract.methods.getReserves().call();

      const EqualTokenDetails = await _getTokenDetails(EqualTokenAddress);
      const gaugeDetails = await _gaugeDetails(
        gaugesAddress,
        pairContractAddress
      );
      const totalSupply = await PairContract.methods.totalSupply().call();
      const decimals = await PairContract.methods.decimals().call();
      const symbol = await PairContract.methods.symbol().call();
      const name = await PairContract.methods.name().call();
      const stable = await PairContract.methods.stable().call();
      const gaugeLPPortion =
        BigNumber(gaugeLPTotalSupply) / BigNumber(totalSupply);

      let pair = {};
      pair.address = pairContractAddress;
      pair.gaugesAddress = gaugesAddress;
      pair.token0 = token0;
      pair.token1 = token1;
      pair.symbol = symbol;
      pair.name = name;
      pair.stable = stable;
      pair.decimals = decimals;
      pair.token0_address = token0Address;
      pair.token1_address = token1Address;
      pair.totalSupply =
        BigNumber(totalSupply) / (10 ** decimals).toFixed(parseInt(decimals));
      pair.reserve0 =
        (BigNumber(reserves[0]) * gaugeLPPortion) /
        (10 ** pair.token0.decimals).toFixed(parseInt(pair.token0.decimals));
      pair.reserve1 =
        (BigNumber(reserves[1]) * gaugeLPPortion) /
        (10 ** pair.token1.decimals).toFixed(parseInt(pair.token1.decimals));
      pair.gauge = gaugeDetails;
      pair.price0 = token0.price;
      pair.price1 = token1.price;
      try {
        pair.tvl =
          parseFloat(pair.reserve0 * pair.price0) +
          parseFloat(pair.reserve1 * pair.price1);
      } catch (e) {
        pair.tvl = 0;
      }
      if (pair.tvl) {
        try {
          pair.apr = parseFloat(
            parseFloat(
              parseFloat(
                parseFloat(gaugeDetails.reward * EqualTokenDetails.price) /
                  parseFloat(pair.tvl)
              ) * 100
            ) * 365
          );
        } catch (e) {
          pair.apr = 0;
        }
      }
      return pair;
    } else {
      console.error('Error: Cannot read properties of null (reading "token0")');
      return null;
    }
  }
}

async function _gaugeDetails(gaugeAddress, pairAddress) {
  if (gaugeAddress == "0x0000000000000000000000000000000000000000") {
    return {};
  }

  const gaugeContract = await new web3.eth.Contract(gaugeABI, gaugeAddress);

  const external_bribe = await gaugeContract.methods.external_bribe().call();
  const internal_bribe = await gaugeContract.methods.internal_bribe().call();
  const totalSupply = await gaugeContract.methods.totalSupply().call();
  const totalWeight = await VoterContract.methods.totalWeight().call();
  const balance = 0; // await gaugeContract.methods.balanceOf(userAddress).call();
  const gaugeWeight = await VoterContract.methods.weights(pairAddress).call();
  const guagereward = await gaugeContract.methods
    .rewardRate(EqualTokenAddress)
    .call();
  const PairContract = await new web3.eth.Contract(PairABI, pairAddress);
  const token1Address = await PairContract.methods.token1().call();
  const token1Contract = await new web3.eth.Contract(tokenABI, token1Address);
  const contractBalanceBN = await token1Contract.methods
    .balanceOf(gaugeAddress)
    .call();
  const contractBalance = (contractBalanceBN / 10 ** 18).toFixed(2);

  const ExternalBribeContract = await new web3.eth.Contract(
    ExternalBribeABI,
    external_bribe
  );
  const InternalBribeContract = await new web3.eth.Contract(
    InternalBribeABI,
    internal_bribe
  );

  let rewardsListlength = await ExternalBribeContract.methods
    .rewardsListLength()
    .call();
  let rewardsListlength_Internal = await InternalBribeContract.methods
    .rewardsListLength()
    .call();

  const bribes = [];
  let external_bribes = [];
  let internal_bribes = [];

  let tbv = 0;
  let set1 = 0;
  let set2 = 0;

  for (let i = 0; i < rewardsListlength; i++) {
    let tokenAddress = await ExternalBribeContract.methods.rewards(i).call();
    let TOKEN = await _getTokenDetails(tokenAddress);
    let left = await ExternalBribeContract.methods.left(tokenAddress).call();
    //left = parseFloat(parseFloat(left) / 10 ** TOKEN.decimals)
    left = left / 10 ** TOKEN.decimals;
    tbv = tbv + left;
    set1 = left;
    // for (let j = 0; j < rewardsListlength; j++) {
    external_bribes[i] = {
      token_details: TOKEN,
      reward: left,
    };

    //}
  }

  //let internal_bribes = [];

  for (let i = 0; i < rewardsListlength_Internal; i++) {
    let tokenAddress = await InternalBribeContract.methods.rewards(i).call();
    let TOKEN = await _getTokenDetails(tokenAddress);
    let left = await InternalBribeContract.methods.left(tokenAddress).call();
    //left = parseFloat(parseFloat(left) / 10 ** TOKEN.decimals);
    left = left / 10 ** TOKEN.decimals;
    tbv = tbv + left;
    set2 = left;

    internal_bribes[i] = {
      token_details: TOKEN,
      reward: left,
    };
  }

  for (let i = 0; i < external_bribes.length; i++) {
    for (let j = 0; j < internal_bribes.length; j++) {
      if (
        external_bribes[i].token_details.address ==
        internal_bribes[j].token_details.address
      ) {
        external_bribes[i].reward =
          external_bribes[i].reward + internal_bribes[j].reward;
      }
    }
  }

  for (let i = 0; i < external_bribes.length; i++) {
    bribes.push({
      rewardAmmount: external_bribes[i].reward,
      reward_ammount: external_bribes[i].reward,
      token: external_bribes[i].token_details,
    });
  }

  let tbvUSD = 0;
  for (let i = 0; i < bribes.length; i++) {
    tbvUSD += bribes[i].rewardAmmount * bribes[i].token.price;
  }
  let aprUsd = 0;

  let TOKENDATA = await _getTokenDetails(EqualTokenAddress);
  let votes = parseFloat(gaugeWeight / 10 ** TOKENDATA.decimals);

  if (TOKENDATA.price > 0 && TOKENDATA.price * votes > 0) {
    aprUsd = parseFloat(
      aprUsd +
        parseFloat(
          parseFloat(
            parseFloat(tbvUSD * 52) / parseFloat(votes * TOKENDATA.price)
          ) * 100
        )
    );
  }

  return {
    address: gaugeAddress,
    external_bribe: external_bribe,
    internal_bribe: internal_bribe,
    bribeAddress: external_bribe,
    bribe_address: external_bribe,
    feesAddress: internal_bribe,
    fees_address: internal_bribe,
    decimals: 18,
    balance: balance,
    totalSupply: 0 || BigNumber(totalSupply) / (10 ** 18).toFixed(18),
    bribes: bribes, //external_bribes,//// No found now
    weight: 0 || BigNumber(gaugeWeight) / (10 ** 18).toFixed(18),
    weightPercent:
      0 || parseFloat((BigNumber(gaugeWeight) * 100) / totalWeight).toFixed(2),
    reward: parseFloat((guagereward / 10 ** TOKENDATA.decimals) * 86400),
    tbv: tbv,
    tbvUSD: tbvUSD,
    votes: votes,
    aprUsd: aprUsd,
    set1: set1,
    set2: set2,
    contractBalance: contractBalance,
  };
}

async function _getTokenDetails(contractAddress) {
  if (contractAddress == "0x0000000000000000000000000000000000000000") {
    // return {};
  }
  const tokenContract = await new web3.eth.Contract(tokenABI, contractAddress);
  let name = await tokenContract.methods.name().call();
  let symbol = await tokenContract.methods.symbol().call();
  let decimals = await tokenContract.methods.decimals().call();
  let isWhitelisted = await VoterContract.methods
    .isWhitelisted(contractAddress)
    .call();
  let price;
  //check contract addresses 1 by 1 for getting price
  //glacier price
  if (contractAddress === "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6") {
    //Test token
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0x2071A39DA7450d68e4F4902774203DF208860Da2"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //weth
  } else if (contractAddress === "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0x42Be75636374dfA0e57EB96fA7F68fE7FcdAD8a3"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //btc
  } else if (contractAddress === "0x152b9d0FdC40C096757F570A51E494bd4b943E50") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0x11C0F9134D7Db45e3dab7A78AC3c957a92229E8c"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //yfx
  } else if (contractAddress === "0x8901cB2e82CC95c01e42206F8d1F417FE53e7Af0") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0x640f87FEF16c1e767ED80bAe124E067B49D3E6a7"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //yyavax
  } else if (contractAddress === "0xF7D9281e8e363584973F946201b82ba72C965D27") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0xf25EcAd00b5Ce43Ad24551835F3c57d4978D1fBB"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //fbomb
  } else if (contractAddress === "0x5C09A9cE08C4B332Ef1CC5f7caDB1158C32767Ce") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0x964F92d354a23ec943a8fAE020CA1391257C3308"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //usdc.e
  } else if (contractAddress === "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0x18332988456C4Bd9ABa6698ec748b331516F5A14"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //usdt
  } else if (contractAddress === "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7") {
    price = 1;
  } else if (contractAddress === "0xa41A879bcFdd75983a987FD6b68fae37777e8b28") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0x217CF282d7774Bb842B77d3f455DdfDF241eC814"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      });
    //magik
  } else if (contractAddress === "0xF7554D17d1c3F09899dCc8B404beCAE6dFA584Fa") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/fantom/0x7e46D5F4Add361bb52b5a933b0e004E924170ba0"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //might
  } else if (contractAddress === "0xF7554D17d1c3F09899dCc8B404beCAE6dFA584Fa") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/fantom/0x476606b47dDA7131268A25F144e6F5F529C2d918"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      });
  } else if (contractAddress === "0x1e3c6c53F9f60BF8aAe0D7774C21Fa6b1afddC57") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/arbitrum/0x96Db7Fb649cFe9b65493b2F6B4422736CCF5b7bF"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //wshare
  } else if (contractAddress === "0xe6d1aFea0B76C8f51024683DD27FA446dDAF34B6") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0x03d15E0451e54Eec95ac5AcB5B0a7ce69638c62A"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //ibermax
  } else if (contractAddress === "0x089d3dAF549f99553C2182DB24bC4336A4F0C824") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0xefa454d0b7093BcDC36454F7e7b18A458De2fc9d"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //wlrs
  } else if (contractAddress === "0x395908aeb53d33A9B8ac35e148E9805D34A555D3") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0x82845B52b53c80595bbF78129126bD3E6Fc2C1DF"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      }); //nrwl
  } else if (contractAddress === "0x501012893eE88976AB8B5289B7a78E307d5d9DCb") {
    await axios
      .get(
        "https://api.dexscreener.com/latest/dex/pairs/avalanche/0xE4f4f9DD9cD45bC44FD517f4AE490591030274F6"
      )
      .then((result) => (price = result.data.pairs[0].priceUsd))
      .catch((ex) => {
        price = 1;
        console.log(ex);
      });
  } else
    await axios
      .get("https://api.beefy.finance/prices")
      .then((result) => {
        // Find the price of the token by its symbol in the returned data
        price = result.data[symbol] || 0;
        //   console.log(price, "price")
      })
      .catch((ex) => {
        price = 0;
        console.log(ex);
      });

  return {
    address: contractAddress,
    name: name,
    symbol: symbol,
    decimals: decimals,
    logoURI:
      "https://raw.githubusercontent.com/magikfinance/tokenlogos/main/" +
      symbol +
      ".png",
    balance: 0,
    isWhitelisted: isWhitelisted,
    price: price,
  };
}

export async function checkNewPairs() {
  const allPairsLength = await PairFactoryContract.methods
    .allPairsLength()
    .call();

  const oldData = await fetchDBPairs();
  let updatedPairs = [];
  if (allPairsLength > oldData.length) {
    for (let i = oldData.length; i < allPairsLength; i++) {
      const pair = await _getPairData(i);
      if (pair) {
        updatedPairs.push(pair);
      }
    }
  }
  await updateDBPairs(updatedPairs);
}

export async function updatePairsStats(startIndex, endIndex) {
  const allPairsLength = await PairFactoryContract.methods
    .allPairsLength()
    .call();

  if (startIndex < allPairsLength) {
    if (endIndex > allPairsLength) {
      endIndex = allPairsLength;
    }

    let updatedPairs = [];
    for (let i = startIndex; i < endIndex; i++) {
      console.log("updating pair for index " + i);
      const pair = await _getPairData(i);
      if (pair) {
        updatedPairs.push(pair);
      }
    }
    await updateDBPairs(updatedPairs);
    return true;
  }
  return false;
}
