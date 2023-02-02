
import pako from 'pako';
// @ts-ignore
import untar from 'js-untar';

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

  if (zkeydFiles.length === 0) {
    // find one file from the tar file.
    const file = zkeydFiles[0];
    return file;
  } else if (zkeydFiles.length > 1) {
    throw new Error("More than one .zkeyd files found in tarball");
  } {
    throw new Error("No .zkeyd files found in tarball.");
  }
}

export {uncompressZkeydTarball, type TarFile};