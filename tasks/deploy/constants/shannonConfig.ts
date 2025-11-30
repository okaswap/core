import { ethers } from "ethers";

const TOKEN_DECIMALS = ethers.BigNumber.from("10").pow(
  ethers.BigNumber.from("18")
);
const MILLION = ethers.BigNumber.from("10").pow(ethers.BigNumber.from("6"));

const TWENTY_MILLION = ethers.BigNumber.from("20")
  .mul(MILLION)
  .mul(TOKEN_DECIMALS);

const VE_MAX = ethers.BigNumber.from("140")
  .mul(MILLION)
  .mul(TOKEN_DECIMALS);

// ===== TODO =====
const DEV_EOA = "0x100002e5cfceb9c7de1d712a01390fed502c25dd";
const TEAM_EOA = "0x100002e5cfceb9c7de1d712a01390fed502c25dd";
const TEAM_MULTISIG = "0x100002e5cfceb9c7de1d712a01390fed502c25dd";
const DRUM_GUILD = "0x100002e5cfceb9c7de1d712a01390fed502c25dd";
const SHANNON_EOA = "0x100002e5cfceb9c7de1d712a01390fed502c25dd";

// const WSOMI = "" MAINNET
const WSTT = "0x4A3BC48C156384f9564Fd65A53a2f3D534D8f2b7"
const USDC = "0x28EC6E9Ef1C1e91462e738108E90ffAc38629d31"
const USDT = "0x8756FDf0a5ea9FAF4f5f4B5190E28E2E6cD3E7B9"

const shannonConfig = {

  // Gas Price
  PRICE: "6000000000", // 6 GWEI

  // Tokens
  // WSOMI: WSOMI
  WSTT: WSTT,
  USDC: USDC,
  USDT: USDT,

  // Addresses
  devEOA: DEV_EOA,
  teamEOA: TEAM_EOA,
  teamMultisig: TEAM_MULTISIG,

  merkleRoot:
    "0x451117bbf7a4d7d05e1a160696331de34b198370aa63b9c93d9d08b4091f7be0", // TODO
  
  tokenWhitelist: [
    WSTT,
    USDC,
    USDT,
  ],
  
  partnerAddrs: [
    SHANNON_EOA,
    SHANNON_EOA,
    DRUM_GUILD,
    DRUM_GUILD,
    DRUM_GUILD,
    DRUM_GUILD,
    TEAM_EOA,
  ],
  partnerAmts: [
    TWENTY_MILLION,
    TWENTY_MILLION,
    TWENTY_MILLION,
    TWENTY_MILLION,
    TWENTY_MILLION,
    TWENTY_MILLION,
    TWENTY_MILLION,
  ],
  partnerMax: VE_MAX, // 140M
};

export default shannonConfig;
