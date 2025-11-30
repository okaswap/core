import { task, types } from "hardhat/config";
import { ethers } from "ethers";
import { computeCreate2Address } from "./utils/create2Utils";

task("mine-salt", "Vanity SALT Miner for Oka (CREATE2)")
  .addParam("factory", "CREATE2Factory address")
  .addParam("initcodehash", "Init code hash of Oka contract")
  .addParam("prefix", "Desired address prefix without 0x, e.g. 55555")
  .addOptionalParam("start", "Starting counter", "0", types.string)
  .addOptionalParam("max", "Maximum iterations", "50000000", types.string)
  .setAction(async (args, hre) => {
    const factory = args.factory.toLowerCase();
    const initHash = args.initcodehash.toLowerCase();
    const prefix = args.prefix.toLowerCase();
    let counter = ethers.BigNumber.from(args.start || "0");
    const max = ethers.BigNumber.from(args.max || "50000000");

    console.log("\n🔥 Starting Vanity Salt Miner (single-thread)");
    console.log(`→ Factory       : ${factory}`);
    console.log(`→ InitCodeHash  : ${initHash}`);
    console.log(`→ Prefix        : 0x${prefix}`);
    console.log(`→ Start counter : ${counter.toString()}`);
    console.log(`→ Max iterations: ${max.toString()}`);
    console.log("-----------------------------------");

    let foundSalt: { rawSalt: string; saltHex: string; address: string } | null = null;

    const logEvery = ethers.BigNumber.from("50000");

    while (counter.lt(max)) {
      const rawSalt = "salt_" + counter.toString();
      const saltHex = ethers.utils.id(rawSalt);
      const addr = computeCreate2Address(factory, saltHex, initHash);

      if (addr.toLowerCase().startsWith("0x" + prefix)) {
        foundSalt = { rawSalt, saltHex, address: addr };
        break;
      }

      if (counter.mod(logEvery).isZero()) {
        console.log(`Checked up to index ${counter.toString()} → last address ${addr}`);
      }

      counter = counter.add(1);
    }

    if (!foundSalt) {
      console.log("\n❌ No matching salt found in the given range.");
      return;
    }

    console.log("\n====================================");
    console.log(" FINAL SALT FOUND ");
    console.log(" Raw Salt :", foundSalt.rawSalt);
    console.log(" Hex Salt :", foundSalt.saltHex);
    console.log(" Address  :", foundSalt.address);
    console.log("====================================");
  });
