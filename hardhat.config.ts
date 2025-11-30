import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-preprocessor";
import "hardhat-abi-exporter";

import fs from "fs";
import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";

// import somniaConfig from "./tasks/deploy/constants/somniaConfig";
import shannonConfig from "./tasks/deploy/constants/shannonConfig";
//import "./tasks/accounts";
import "./tasks/deploy";
import "./tasks/mineSalt";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const remappings = fs
  .readFileSync("remappings.txt", "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => line.trim().split("="));

/** const accounts = {
  count: 10,
  initialIndex: process.env.MNEMONIC_INDEX ? parseInt(process.env.MNEMONIC_INDEX) : 0,
  mnemonic: process.env.MNEMONIC,
  path: "m/44'/60'/0'/0",
}; */

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      // forking: {
      //   url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      //   blockNumber: 16051852
      // }
    },
    opera: {
      url: "https://rpc.fantom.network",
      accounts: [process.env.PRIVATE_KEY!],
    },
    ftmTestnet: {
      url: "https://rpc.testnet.fantom.network",
      accounts: [process.env.PRIVATE_KEY!],
    },
    optimisticEthereum: {
      url: "https://mainnet.optimism.io",
      accounts: [process.env.PRIVATE_KEY!],
    },
    optimisticKovan: {
      url: "https://kovan.optimism.io",
      accounts: [process.env.PRIVATE_KEY!],
    },
    // SOMNIA
    somnia: {
  url: "https://somnia-rpc.publicnode.com",
  accounts: [process.env.PRIVATE_KEY!],
    },
    shannon: {
  url: process.env.SHANNON_RPC,
  accounts: [process.env.PRIVATE_KEY!],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
    ],
  },
  // This fully resolves paths for imports in the ./lib directory for Hardhat
  preprocess: {
    eachLine: (hre) => ({
      transform: (line: string) => {
        if (!line.match(/^\s*import /i)) {
          return line;
        }

        const remapping = remappings.find(([find]) => line.match('"' + find));
        if (!remapping) {
          return line;
        }

        const [find, replace] = remapping;
        return line.replace('"' + find, '"' + replace);
      },
    }),
  },
  etherscan: {
    apiKey: {
      somnia: "okaswap", // apiKey is not required, just set a placeholder
      shannon: "okaswap",
    },
    customChains: [
      {
        network: "somnia",
        chainId: 5031,
        urls: {
          apiURL: "https://explorer.somnia.network/api",
          browserURL: "https://explorer.somnia.network/"
        }
      },
      {
        network: "shannon",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network/"
        }
      }
    ]
  },
  sourcify: {
    enabled: false
  }

};

export default config;
