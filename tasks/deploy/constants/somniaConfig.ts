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
const SOMNIA_EOA = "0x100002e5cfceb9c7de1d712a01390fed502c25dd";

// const WSOMI = "" MAINNET
const WSTT = "0x0000000000000000000000000000000000000000"
const USDC = "0x0000000000000000000000000000000000000000"
const USDT = "0x0000000000000000000000000000000000000000"

const somniaConfig = {

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
    "0x0000000000000000000000000000000000000000", // TODO
  
  tokenWhitelist: [
    WSTT,
    USDC,
    USDT,
  ],
  
  partnerAddrs: [
    SOMNIA_EOA,
    SOMNIA_EOA,
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

export default somniaConfig;
