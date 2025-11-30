import { task, types } from "hardhat/config";

import somniaConfig from "./constants/somniaConfig";

task("deploy:somnia", "Deploys Okaswap contracts on Somnia")
  .addParam("initializeMinter", "Whether to run minter.initialize", "false", types.boolean)
  .setAction(async function (
    taskArguments,
    hre
  ) {

    const ACONFIG = somniaConfig;

    const gasPrice = hre.ethers.utils.parseUnits(ACONFIG.PRICE, 'wei');

    const [
      Oka,
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
      hre.ethers.getContractFactory("Oka"),
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

    const oka = await Oka.deploy({ gasPrice });
    await oka.deployed();
    console.log("Oka deployed to: ", oka.address);
    
    const gaugeFactory = await GaugeFactory.deploy({ gasPrice });
    await gaugeFactory.deployed();
    console.log("GaugeFactory deployed to: ", gaugeFactory.address);

    const bribeFactory = await BribeFactory.deploy({ gasPrice });
    await bribeFactory.deployed();
    console.log("BribeFactory deployed to: ", bribeFactory.address);

    const pairFactory = await PairFactory.deploy({ gasPrice });
    await pairFactory.deployed();
    console.log("PairFactory deployed to: ", pairFactory.address);

    const router = await Router.deploy(pairFactory.address, ACONFIG.WETH, { gasPrice });
    await router.deployed();
    console.log("Router deployed to: ", router.address);
    console.log("Args: ", pairFactory.address, ACONFIG.WETH, "\n");

    const library = await Library.deploy(router.address, { gasPrice });
    await library.deployed();
    console.log("OkaLibrary deployed to: ", library.address);
    console.log("Args: ", router.address, "\n");

    const artProxy = await VeArtProxy.deploy({ gasPrice });
    await artProxy.deployed();
    console.log("VeArtProxy deployed to: ", artProxy.address);

    const escrow = await VotingEscrow.deploy(oka.address, artProxy.address, { gasPrice });
    await escrow.deployed();
    console.log("VotingEscrow deployed to: ", escrow.address);
    console.log("Args: ", oka.address, artProxy.address, "\n");

    const distributor = await RewardsDistributor.deploy(escrow.address, { gasPrice });
    await distributor.deployed();
    console.log("RewardsDistributor deployed to: ", distributor.address);
    console.log("Args: ", escrow.address, "\n");

    const voter = await Voter.deploy(
      escrow.address,
      pairFactory.address,
      gaugeFactory.address,
      bribeFactory.address,
      { gasPrice }
    );
    await voter.deployed();
    console.log("Voter deployed to: ", voter.address);
    console.log("Args: ", 
      escrow.address,
      pairFactory.address,
      gaugeFactory.address,
      bribeFactory.address,
      "\n"
    );

    const minter = await Minter.deploy(
      voter.address,
      escrow.address,
      distributor.address,
      { gasPrice }
    );
    await minter.deployed();
    console.log("Minter deployed to: ", minter.address);
    console.log("Args: ", 
      voter.address,
      escrow.address,
      distributor.address,
      "\n"
    );

    // Airdrop
    const claim = await MerkleClaim.deploy(escrow.address, ACONFIG.merkleRoot, 4*7, { gasPrice }); // 4 weeks
    await claim.deployed();
    console.log("MerkleClaim deployed to: ", claim.address);
    console.log("Args: ", escrow.address, ACONFIG.merkleRoot, 4*7, "\n");

    // Initialize
    await oka.initialMint(ACONFIG.teamEOA, { gasPrice });
    console.log("Initial minted");

    await oka.setMinter(minter.address, { gasPrice });
    console.log("Minter set");

    await pairFactory.setPauser(ACONFIG.teamMultisig, { gasPrice });
    console.log("Pauser set");

    await pairFactory.setFeeManager(ACONFIG.teamMultisig, { gasPrice });
    console.log("Fee Manager set");

    await escrow.setVoter(voter.address, { gasPrice });
    console.log("Voter set");

    await escrow.setTeam(ACONFIG.teamMultisig, { gasPrice });
    console.log("Team set for escrow");

    await voter.setGovernor(ACONFIG.teamMultisig, { gasPrice });
    console.log("Governor set");

    await voter.setEmergencyCouncil(ACONFIG.teamMultisig, { gasPrice });
    console.log("Emergency Council set");

    await distributor.setDepositor(minter.address, { gasPrice });
    console.log("Depositor set");

    let ts = Math.floor(Date.now() / 1000);
    let epochStartTs = Math.floor(ts / (7 * 24 * 3600) + 1) * 7 * 24 * 3600;
    await claim.setStartTime(epochStartTs, { gasPrice });
    console.log("Airdrop start time set: ", new Date(epochStartTs * 1000).toUTCString());

    // Whitelist
    const nativeToken = [oka.address];
    const tokenWhitelist = nativeToken.concat(ACONFIG.tokenWhitelist);
    await voter.initialize(tokenWhitelist, minter.address, { gasPrice });
    console.log("Whitelist set");

    if (taskArguments.initializeMinter) {
      const tx = await minter.initialize(
        ACONFIG.partnerAddrs,
        ACONFIG.partnerAmts,
        ACONFIG.partnerMax,
        { gasLimit: 6000000, gasPrice }  // Set a manual gas limit
      );
      console.log("veOKA distributed");
    }

    await minter.setTeam(ACONFIG.teamMultisig, { gasPrice })
    console.log("Team set for minter");

    console.log("~= Contracts deloyed on Somnia =~");
  });
