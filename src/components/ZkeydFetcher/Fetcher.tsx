import { useState } from 'react';

type UploaderProps = {
  handleFetch: Function
}

const Uploader:React.FC<UploaderProps> = ({ handleFetch }) => {
  const [inputs, setInputs] = useState({ filename: "email.zkeyd" });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const name = e.target.name;
    const value = e.target.value;
    setInputs((state) => {
      return { ...state, [name]: value };
    });
  }
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleFetch(inputs['filename']);
  }
  return (
    <div>
      <p>Enter a filename to fetch from remote server</p>
      <form>
        <input type="text" name="filename" onChange={handleInputChange} value={inputs.filename} />

        <button onClick={handleClick}>
          fetch file
        </button>
        <br />
        <label>
          compressed
          <input type="checkbox" name="compressed" checked={true} disabled={true} />
        </label>
      </form>

    </div>
  );
}

export default Uploader;