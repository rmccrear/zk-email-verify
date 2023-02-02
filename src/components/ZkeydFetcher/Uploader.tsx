import React, { ChangeEventHandler } from "react";

type UploaderProps = {
  handleUpload: ChangeEventHandler 
}

const Uploader: React.FC<UploaderProps> = ({ handleUpload }) => {
  return (
    <div>
      <form>
        <label>
          Select a tarball to upload.
          <input type="file" onChange={handleUpload} />
        </label>
      </form>
    </div>
  );
}

export default Uploader;
