import { task, types } from "hardhat/config";
import { ethers } from "hardhat";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import shannonConfig from "./constants/shannonConfig";

async function getInitCode(hre: HardhatRuntimeEnvironment, name: string, args: any[]) {
  const f = await hre.ethers.getContractFactory(name);
  return f.getDeployTransaction(...args).data!;
}

async function getInitCodeHash(initCode: string) {
  return ethers.utils.keccak256(initCode);
}

task("deploy:create2factory", "Deploy CREATE2Factory contract")
  .setAction(async function (_, hre: HardhatRuntimeEnvironment) {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying CREATE2Factory with Address:", deployer.address);

    const Create2Factory = await hre.ethers.getContractFactory("CREATE2Factory", deployer);
    const create2Factory = await Create2Factory.deploy();
    await create2Factory.deployed();
    console.log("CREATE2 Factory deployed:", create2Factory.address);
  });

task("deploy:shannon", "Deploys Oka with Shannon config")
  .addParam("initializeMinter", "Whether to run minter.initialize", false, types.boolean)
  .addParam("useCreate2", "Deploy Oka with CREATE2", false, types.boolean)
  .addParam("salt", "Salt for CREATE2 deployment", "Okaswap", types.string)
  .addParam("factory", "CREATE2Factory address used for vanity deployment", "0x0000000000000000000000000000000000000000", types.string)
  .setAction(async function (taskArguments, hre: HardhatRuntimeEnvironment) {

    const ACONFIG = shannonConfig;
    const gasPrice = hre.ethers.utils.parseUnits(ACONFIG.PRICE, 'wei');
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deployer:", deployer.address);

    const Oka = await hre.ethers.getContractFactory("Oka");
    let okaAddress: string;

    if (taskArguments.salt === "mine") {
      console.log("Please run: npx hardhat mine-salt ... first and then pass the discovered raw salt via --salt");
      return;
    }

    if (taskArguments.useCreate2) {
      if (
        !taskArguments.factory ||
        taskArguments.factory === "0x0000000000000000000000000000000000000000"
      ) {
        throw new Error("CREATE2 requested but no --factory address provided. Deploy CREATE2Factory first via `npx hardhat deploy:create2factory`.");
      }

      const create2Factory = await hre.ethers.getContractAt(
        "CREATE2Factory",
        taskArguments.factory,
        deployer
      );

      const saltHex = ethers.utils.id(taskArguments.salt);
      console.log("Deploying Oka via CREATE2");
      console.log("Using factory:", create2Factory.address);
      console.log("Salt (raw):", taskArguments.salt);
      console.log("Salt (hex):", saltHex);

      const initCode = await getInitCode(hre, "Oka", []);
      const initCodeHash = await getInitCodeHash(initCode);

      const predicted = await create2Factory.computeAddress(saltHex, initCodeHash);
      console.log("Predicted CREATE2 Oka address:", predicted);

      const tx = await create2Factory.deploy(saltHex, initCode, { gasPrice });
      const receipt = await tx.wait();

      okaAddress = receipt.events?.find((e: any) => e.event === "Deployed")?.args?.addr;
      console.log("Oka CREATE2 deployed at:", okaAddress);
    } else {
      console.log("Deploying Oka...");

      const oka = await Oka.deploy({ gasPrice });
      await oka.deployed();
      okaAddress = oka.address;

      console.log("Oka deployed to:", okaAddress);
    }

    const [
      GaugeFactory,
      BribeFactory,
      PairFactory,
      Router,
      Library,
      VeArtProxy,
      VotingEscrow,
      RewardsDistributor,
      Voter,
      Minter,
      MerkleClaim,
    ] = await Promise.all([
      hre.ethers.getContractFactory("GaugeFactory"),
      hre.ethers.getContractFactory("BribeFactory"),
      hre.ethers.getContractFactory("PairFactory"),
      hre.ethers.getContractFactory("Router"),
      hre.ethers.getContractFactory("OkaLibrary"),
      hre.ethers.getContractFactory("VeArtProxy"),
      hre.ethers.getContractFactory("VotingEscrow"),
      hre.ethers.getContractFactory("RewardsDistributor"),
      hre.ethers.getContractFactory("Voter"),
      hre.ethers.getContractFactory("Minter"),
      hre.ethers.getContractFactory("MerkleClaim"),
    ]);

    const gaugeFactory = await GaugeFactory.deploy({ gasPrice });
    await gaugeFactory.deployed();
    console.log("GaugeFactory deployed:", gaugeFactory.address);

    const bribeFactory = await BribeFactory.deploy({ gasPrice });
    await bribeFactory.deployed();
    console.log("BribeFactory deployed:", bribeFactory.address);

    const pairFactory = await PairFactory.deploy({ gasPrice });
    await pairFactory.deployed();
    console.log("PairFactory deployed:", pairFactory.address);

    const router = await Router.deploy(pairFactory.address, ACONFIG.WETH, { gasPrice });
    await router.deployed();
    console.log("Router deployed:", router.address);

    const library = await Library.deploy(router.address, { gasPrice });
    await library.deployed();
    console.log("OkaLibrary deployed:", library.address);

    const artProxy = await VeArtProxy.deploy({ gasPrice });
    await artProxy.deployed();
    console.log("VeArtProxy deployed:", artProxy.address);

    const escrow = await VotingEscrow.deploy(okaAddress, artProxy.address, { gasPrice });
    await escrow.deployed();
    console.log("VotingEscrow deployed:", escrow.address);

    const distributor = await RewardsDistributor.deploy(escrow.address, { gasPrice });
    await distributor.deployed();
    console.log("RewardsDistributor deployed:", distributor.address);

    const voter = await Voter.deploy(
      escrow.address,
      pairFactory.address,
      gaugeFactory.address,
      bribeFactory.address,
      { gasPrice }
    );
    await voter.deployed();
    console.log("Voter deployed:", voter.address);

    const minter = await Minter.deploy(
      voter.address,
      escrow.address,
      distributor.address,
      { gasPrice }
    );
    await minter.deployed();
    console.log("Minter deployed:", minter.address);

    const claim = await MerkleClaim.deploy(escrow.address, ACONFIG.merkleRoot, 4*7, { gasPrice });
    await claim.deployed();
    console.log("MerkleClaim deployed:", claim.address);

    // -----------------------------
    // INITIALIZE
    // -----------------------------
    const okaContract = await hre.ethers.getContractAt("Oka", okaAddress);
    await okaContract.initialMint(ACONFIG.teamEOA, { gasPrice });
    console.log("Initial minted");

    console.log("Successfully deployed Oka to Shannon (⁠ﾉ⁠◕⁠ヮ⁠◕⁠)⁠ﾉ⁠*⁠.⁠✧");
  });
