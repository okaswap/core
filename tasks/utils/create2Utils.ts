import { ethers } from "ethers";

export function computeCreate2Address(factory: string, salt: string, initHash: string) {
  return "0x" + ethers.utils.keccak256(
    ethers.utils.solidityPack(
      ["bytes1", "address", "bytes32", "bytes32"],
      ["0xff", factory, salt, initHash]
    )
  ).slice(26);
}

export function hashSalt(input: string): string {
  return ethers.utils.id(input);
}