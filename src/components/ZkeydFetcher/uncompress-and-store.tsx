import pako from 'pako';
import localforage from 'localforage';
// @ts-ignore
import untar from 'js-untar';

//const pako = require('pako');
//const localforage = require('localforage');
//const untar = require('js-untar');

const loadURL = "https://zkemail-zkey-chunks.s3.amazonaws.com/";
const zkeyExtension = ".tar.gz"
// Downloads and uncompresses if compressed
async function downloadFromFilename(filenameRaw: string, compressed = false) {
  let filename = filenameRaw;
  if (compressed) {
    filename = filenameRaw + zkeyExtension; // ".gz.tar"
  }
  const link = loadURL + filename;
  const uncompressFilePromises = [];
  try {
    const zkeyResp = await fetch(link, {
      method: "GET",
    });
    const zkeyBuff = await zkeyResp.arrayBuffer();
    console.log(zkeyBuff);
    if (!compressed) {
      await localforage.setItem(filename, zkeyBuff);
    } else {
      const file = await uncompressZkeydTarball(zkeyBuff);
      await localforage.setItem(filenameRaw, file.buffer);
    }
    console.log(`Storage of ${filename} successful!`);
  } catch (e) {
    console.log(`Storage of ${filename} unsuccessful, make sure IndexedDB is enabled in your browser. Full error: `, e);
  }
}

// js-tar doesn't have a type.d so we add a type here.
type TarFile = {
  name: string,
  buffer: ArrayBuffer
}

// uncompresses a tarball containing a single .zkeyd file.
// returns the contents of that file as an ArrayBuffer
const uncompressZkeydTarball = async (arrayBuffer:ArrayBuffer): Promise<TarFile> => {
  console.log(`Started to uncompress tarball...!`);

  // ungzip file
  const output = pako.ungzip(arrayBuffer);
  const buff = output.buffer;

  // extract file(s) from tar
  const files = await untar(buff);
  console.log("files in tar file:", files.map((file: TarFile) => file.name));
  // check for files ending in .zkeyd.
  const zkeydFiles = files.filter((file: TarFile) => file.name.endsWith(".zkeyd"));
  const fileNames = zkeydFiles.map((file: TarFile) => file.name);
  console.log(fileNames.length, ".zkeyd files in tar file:", fileNames);

  // store one file from the tar file using the passed in name
  if (zkeydFiles.length > 0) {
    const file = zkeydFiles[0];
    // use the name from the tar file if no filename specified in fn call.
    return file;
  } else {
    throw new Error("Unsuccessful in uncompressing tarball.");
  }
}


// Un-targz the arrayBuffer into the filename without the .tar.gz on the end
const uncompressAndStore = async function(filename: string, arrayBuffer: ArrayBuffer) {
  console.log(`Started to uncompress ${filename}...!`);
  let rawFilename = null;
  console.log(filename);
  console.log(arrayBuffer);

  // ungzip file
  const output = pako.ungzip(arrayBuffer);
  const buff = output.buffer;

  // extract file(s) from tar
  const files = await untar(buff);
  console.log("files in tar file:", files.map((file: TarFile) => file.name));
  // check for files ending in .zkeyd.
  const zkeydFiles = files.filter((file: TarFile) => file.name.endsWith(".zkeyd"));
  const fileNames = zkeydFiles.map((file: TarFile) => file.name);
  console.log(".zkeyd files in tar file:", fileNames);

  // store one file from the tar file using the passed in name
  if (zkeydFiles.length > 0) {
    const file = zkeydFiles[0];
    // use the name from the tar file if no filename specified in fn call.
    if (filename) {
      rawFilename = filename.replace(/.tar.gz$/, "");
    } else {
      rawFilename = file.name;
    }
    console.log("Saving file with localforage as:", rawFilename);
    console.log(file)
    await localforage.setItem(rawFilename, file.buffer);
  }
  return rawFilename;
}

export { downloadFromFilename, uncompressAndStore, uncompressZkeydTarball};
