import { useEffect, useState } from 'react';
import { blobUrlForLocalFile, StoredFile } from './storage';

type KeyListingProps = {
  file: StoredFile
}

const KeyListing: React.FC<KeyListingProps> = ({ file }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let u: string | null = null
    const effect = async () => {
      const u = await blobUrlForLocalFile(file.idx);
      setUrl(u);
      console.log(u);
    }
    effect();
    return () => {
      if (u !== null) URL.revokeObjectURL(u);
    }
  }, [file])
  if (url) {
    return (
      <li key={file.idx}>
        <a href={url} download={file.name}> {file.name} </a>
        <span>  {file.description} </span>
        <span> {file.date.toLocaleString()} </span>
      </li>
    );

  }
  else {
    return (<li key={file.idx}> {file.name} </li>);
  }

}

type KeyListerProps = {
  keyList: Record<string, StoredFile>
};

const KeyLister: React.FC<KeyListerProps> = ({ keyList }) => {

  return (
    <>
      {
        (keyList && Object.values(keyList).length > 0 ?
          <h3> Locally Stored Files: </h3>
          : "")
      }
      <ul>
        {keyList ? Object.values(keyList).map((k: any) => (
          <KeyListing key={k.idx} file={k} />
        )) : ''}
      </ul>
    </>
  )
}

export default KeyLister;