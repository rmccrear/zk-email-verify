import { useState, useEffect } from 'react';
import KeyLister from './KeyLister';
import Uploader from './Uploader';
import Fetcher from './Fetcher';
import { uncompressAndStore, downloadFromFilename } from './uncompress-and-store';
import {
  updateIndexForLocalFiles,
  getIndexForLocalFiles,
  StoredFile
} from './storage';

export default function ZkeydFetcherDemo() {
  const [keyList, setKeyList] = useState<Record<string, StoredFile>| undefined>();
  useEffect(() => {
    const effect = async () => {
      const localFileListing = await getIndexForLocalFiles();
      setKeyList(localFileListing);
    }
    effect();
  }, []);
  const handleUpload = async (e: any) => {
    e.preventDefault();
    const file = e.target.files[0];
    console.log(file);
    const filename = file.name;
    console.log(filename)
    if (!filename.match(/tar.gz$/)) {
      throw new Error("Wrong file type, expected tar.gz file.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const fName = await uncompressAndStore(filename, arrayBuffer);

    console.log("update index for ", fName);
    await updateIndexForLocalFiles(fName, "uploaded file " + filename);
    const localFileListing = await getIndexForLocalFiles();
    setKeyList(localFileListing);
  };
  const handleFetch = async (filename: string) => {
    const fName = await downloadFromFilename(filename, true);

    await updateIndexForLocalFiles(fName, "fetched file " + filename);
    const localFileListing = await getIndexForLocalFiles();
    setKeyList(localFileListing);
  }

  return (
    <main>
      <h1>Localforage storage for .zkeyd files</h1>
      <p>
        Instructions: Select a tarball (*.tar.gz) containing a .zkeyd file. Upload it using the file uploader. It will be stored in local IndexedDB as uncompressed bytes. You can also download the tarball from a remote server, by entering the file name (without the .tar.gz extension) into the text input. The ungziped files files will be available for download from your local IndexedDB as a blob.
      </p>
      <hr />
      <div>
        {keyList!==undefined ? <KeyLister keyList={keyList} /> : ""}
      </div>
      <div>
        <Uploader handleUpload={handleUpload} />
      </div>
      <hr />
      <div>or</div>
      <div>
        <Fetcher handleFetch={handleFetch} />
      </div>
    </main>
  )
}