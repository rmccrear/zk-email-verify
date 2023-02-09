import { StringDecoder } from "string_decoder";
import localforage from "localforage";
import { downloadFromFilename, downloadProofFiles } from "./zkp";

// this is mocked in __mocks__/localforage.ts
jest.mock("localforage");

// localforage should be storing ArrayBuffers.
// We can use this function to simplify checking the mocked value of the ArrayBuffer.
const decodeArrayBufferToString = (buffer: ArrayBuffer): string =>  {
  const decoder = new StringDecoder('utf8');
  const str = decoder.write(Buffer.from(buffer));
  return str;
}

describe('Test zkp fetch and store', () => {

  afterEach(()=>{
    jest.resetAllMocks();
  });

  test('should fetch a gz file, uncompress it, and store it in indexeddb', async () => {
    const filename = "email.zkeyb.gz";
    // downloadFileFromFilename requests the file from the server, which we mocked with msw.
    // The server returns a gz file of a file containing "not compressed 👍", 
    // which is defined in __fixtures__/compressed-files/compressed.txt.gz
    await downloadFromFilename(filename, true);
    // check that localforage.setItem was called once to save the zkey file.
    expect(localforage.setItem).toBeCalledTimes(1);
    const filenameRaw = localforage.setItem.mock.calls[0][0];
    const decompressedBuffer = localforage.setItem.mock.calls[0][1];

    // expect to be called with...
    const str = decodeArrayBufferToString(decompressedBuffer);
    expect(filenameRaw).toBe("email.zkeyb");
    // check that it decompressed the file correctly.
    expect(str).toBe("not compressed 👍");
  });

  test('should should download all the zkeys and save them in local storage for snarkjs to access.', async () => {
    // downloadProofFiles calls downloadFromFilename 10 times, one for each zkey, b-k.
    await downloadProofFiles("email");
    expect(localforage.setItem).toBeCalledTimes(10);

    // check the first one
    const filenameRawB = localforage.setItem.mock.calls[0][0];
    const decompressedBufferB = localforage.setItem.mock.calls[0][1];
    expect(filenameRawB).toBe("email.zkeyb");
    expect(decodeArrayBufferToString(decompressedBufferB)).toBe("not compressed 👍");
    // ... c d e f g h i j ... assume these are fine too.
    // check the last one
    const filenameRawK = localforage.setItem.mock.calls[9][0];
    const decompressedBufferK = localforage.setItem.mock.calls[9][1];
    expect(filenameRawK).toBe("email.zkeyk");
    expect(decodeArrayBufferToString(decompressedBufferK)).toBe("not compressed 👍");
  });
});