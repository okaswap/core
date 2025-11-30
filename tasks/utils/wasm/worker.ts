import { parentPort, workerData } from "worker_threads";
import { computeCreate2Address, hashSalt } from "../create2Utils";

const { factory, initHash, prefix, start, end } = workerData;

for (let i = start; i < end; i++) {
  const rawSalt = "salt_" + i;
  const saltHex = hashSalt(rawSalt);
  const addr = computeCreate2Address(factory, saltHex, initHash);

  if (addr.startsWith("0x" + prefix)) {
    parentPort?.postMessage({
      found: true,
      rawSalt,
      saltHex,
      address: addr
    });
    process.exit(0);
  }

  if (i % 250000 === 0) {
    parentPort?.postMessage({ progress: i });
  }
}

parentPort?.postMessage({ found: false });