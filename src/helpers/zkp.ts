import { vkey } from "./vkey";
import localforage from 'localforage';
import { uncompressZkeydTarball } from "./uncompress";

const snarkjs = require("snarkjs");

const loadURL = "https://zkemail-zkey-chunks.s3.amazonaws.com/";
const zkeyExtension = ".tar.gz";
const useCompressedFiles = true;

// Downloads and uncompresses if compressed
export async function downloadFromFilename(filenameRaw: string, compressed = false) {
  let filename = filenameRaw;
  if (compressed) {
    filename = filenameRaw + zkeyExtension;
  }
  const link = loadURL + filename;
  const uncompressFilePromises = [];
  try {
    const zkeyResp = await fetch(link, {
      method: "GET",
    });
    const zkeyBuff = await zkeyResp.arrayBuffer();
    if (!compressed) {
      await localforage.setItem(filename, zkeyBuff);
    } else {
      const tarFile = await uncompressZkeydTarball(zkeyBuff);
      await localforage.setItem(filenameRaw, tarFile.buffer); // store uncompressed locally.
      // await localforage.setItem(tarFile.name, tarFile.buffer); // could also store it by its compressed name
    }
    console.log(`Storage of ${filename} successful!`);
  } catch (e) {
    console.log(`Storage of ${filename} unsuccessful, make sure IndexedDB is enabled in your browser. Full error: `, e);
  }
}

// Un-targz the arrayBuffer into the filename without the .tar.gz on the end
const uncompressAndStore = async function (arrayBuffer: ArrayBuffer, filename: string) {
  const tarFile = await uncompressZkeydTarball(arrayBuffer);
  await localforage.setItem(filename, tarFile.buffer); // store uncompressed locally.
}

const zkeySuffix = ["b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];

export const downloadProofFiles = async function (filename: string, onFileDownloaded: () => void) {
  const filePromises = [];
  for (const c of zkeySuffix) {
    const itemCompressed = await localforage.getItem(`${filename}.zkey${c}${zkeyExtension}`);
    const item = await localforage.getItem(`${filename}.zkey${c}`);
    if (item) {
      console.log(`${filename}.zkey${c} already found in localstorage!`);
      onFileDownloaded();
      continue;
    } else if (itemCompressed) {
      console.log(`Only compressed ${filename}.zkey${c}${zkeyExtension} already found in localstorage, decompressing!`);
      const zkeyBuff: ArrayBuffer | null = await localforage.getItem(filename);
      if(zkeyBuff !== null){
        filePromises.push(uncompressAndStore(zkeyBuff, filename));
      }
      onFileDownloaded();
      continue;
    } else {
      filePromises.push(
        // downloadFromFilename(`${filename}.zkey${c}${zkeyExtension}`, true).then(
        downloadFromFilename(`${filename}.zkey${c}`, useCompressedFiles).then(() => onFileDownloaded())
      );
    }
  }
  console.log(filePromises);
  await Promise.all(filePromises);
};

export const uncompressProofFiles = async function (filename: string) {
  const filePromises = [];
  for (const c of zkeySuffix) {
    const targzFilename = `${filename}.zkey${c}${zkeyExtension}`;
    const item = await localforage.getItem(`${filename}.zkey${c}`);
    const itemCompressed = await localforage.getItem(targzFilename);
    if (!itemCompressed) {
      console.error(`Error downloading file ${targzFilename}`);
    } else {
      console.log(`${filename}.zkey${c}${item ? "" : zkeyExtension} already found in localstorage!`);
      continue;
    }
    filePromises.push(downloadFromFilename(targzFilename));
  }
  console.log(filePromises);
  await Promise.all(filePromises);
};

export async function generateProof(input: any, filename: string) {
  // TODO: figure out how to generate this s.t. it passes build
  console.log("generating proof for input");
  console.log(input);
  // Test code
  const filePromises = [];
  for (const c of zkeySuffix) {
    const targzFilename = `${filename}.zkey${c}${zkeyExtension}`;
    const item: ArrayBuffer | null = await localforage.getItem(`${filename}.zkey${c}`);
    if(item !== null)
      console.log(c, item.byteLength);
    else 
      console.log(c, "not found in localforage");
  }
  // End test code
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, `https://zkemail-zkey-chunks.s3.amazonaws.com/${filename}.wasm`, `${filename}.zkey`);
  console.log(`Generated proof ${JSON.stringify(proof)}`);

  return {
    proof,
    publicSignals,
  };
}

export async function verifyProof(proof: any, publicSignals: any) {
  console.log("PROOF", proof);
  console.log("PUBLIC SIGNALS", publicSignals);
  console.log("VK", vkey);
  const proofVerified = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  console.log("proofV", proofVerified);

  return proofVerified;
}

function bigIntToArray(n: number, k: number, x: bigint) {
  let divisor = 1n;
  for (var idx = 0; idx < n; idx++) {
    divisor = divisor * 2n;
  }

  let ret = [];
  var x_temp = BigInt(x);
  for (var idx = 0; idx < k; idx++) {
    ret.push(x_temp % divisor);
    x_temp = x_temp / divisor;
  }
  return ret;
}

// taken from generation code in dizkus-circuits tests
function pubkeyToXYArrays(pk: string) {
  const XArr = bigIntToArray(64, 4, BigInt("0x" + pk.slice(4, 4 + 64))).map((el) => el.toString());
  const YArr = bigIntToArray(64, 4, BigInt("0x" + pk.slice(68, 68 + 64))).map((el) => el.toString());

  return [XArr, YArr];
}

// taken from generation code in dizkus-circuits tests
function sigToRSArrays(sig: string) {
  const rArr = bigIntToArray(64, 4, BigInt("0x" + sig.slice(2, 2 + 64))).map((el) => el.toString());
  const sArr = bigIntToArray(64, 4, BigInt("0x" + sig.slice(66, 66 + 64))).map((el) => el.toString());

  return [rArr, sArr];
}

export function buildInput(pubkey: string, msghash: string, sig: string) {
  const [r, s] = sigToRSArrays(sig);

  return {
    r: r,
    s: s,
    msghash: bigIntToArray(64, 4, BigInt(msghash)),
    pubkey: pubkeyToXYArrays(pubkey),
  };
}
