import localforage from "localforage";
import { arrayBuffer } from "stream/consumers";

type StoredFile = {
    name: string,
    description: string
    idx: string,
    date: Date
}


const updateIndexForLocalFiles = async (filename: string, description: string) => {
  let fileListing: Record<string, StoredFile>;
  const resp = await localforage.getItem("__app_fileListing__") as Record<string, StoredFile>;
  if(resp !== null){
    fileListing = resp;
  } else {
    fileListing = {}
  }
  fileListing = fileListing || {};
  fileListing[filename] = {
    name: filename,
    idx: filename,
    description: description,
    date: new Date()
  }
  await localforage.setItem("__app_fileListing__", fileListing);
  console.log("saved new listing", filename);
}

const getIndexForLocalFiles = async (): Promise<Record<string, StoredFile>> => {
  const fileListing = await localforage.getItem("__app_fileListing__");
  console.log(fileListing);
  return fileListing as Record<string, StoredFile>;
}

const getBlobFromKey = async (key: string) => {
  console.log(`getting file from localforage '${key}'`);
  const file = await localforage.getItem(key) as StoredFile;
  console.log(key, file)
  const blobPart = file as unknown;
  const blob = new Blob([blobPart as BlobPart], {
    type: "application/octet-stream",
  });
  return blob;
}

// Be sure to revoke url with `revokeObjectURL(objectURL)`
// to avoid a memory leak!
const blobUrlForLocalFile = async (key: string) => {
  const blob = await getBlobFromKey(key);
  console.log(blob)
  const url = URL.createObjectURL(blob);
  return url;
}

const storeArrayBuffer = async (filename: string, arrayBuffer: ArrayBuffer) => {
  await localforage.setItem(filename, arrayBuffer)
}

export { updateIndexForLocalFiles, getIndexForLocalFiles, blobUrlForLocalFile, storeArrayBuffer, type StoredFile };