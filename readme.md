# Okaswap Core

This repo contains the main contracts for Okaswap Protocol, an AMM on Somnia inspired by Velodrome & Solidly. [Learn more](https://okaswap.xyz/)

## Testing

This repo uses both Foundry (for Solidity testing) and Hardhat (for deployment).

Foundry Setup

```ml
forge init
forge build
forge test
```

Hardhat Setup

```ml
npm i
npx hardhat compile
```

## Deployment

This project's deployment process uses [Hardhat tasks](https://hardhat.org/guides/create-task.html). The scripts are found in `tasks/`.

Deployment guide:

`npx hardhat deploy:somnia` which deploys the core contracts to Somnia Network.

## Security

Okaswap ensures transparency in terms of risks, changes, and the security audits of smart contracts. As a friendly fork of Velodrome and Solidly, you can find the security records for Velodrome [here](https://github.com/velodrome-finance/docs/blob/main/pages/security.md) and for Solidly [here](https://github.com/froggerdev/solidly). We will soon publish our own audit results.
