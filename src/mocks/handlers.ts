// src/mocks/handlers.js
import { rest } from 'msw'
import { loadURL } from '../helpers/zkp'
import fs from 'fs';

const getCompressedTestFile = (): ArrayBuffer => {
  const buffer = fs.readFileSync(`${__dirname}/../__fixtures__/compressed-files/compressed.txt.gz`);
  return buffer;
}

const zkeyGzHandler = async (_, res, ctx) => {
    const mockGzArrayBuffer = getCompressedTestFile();
    return res(
      ctx.set('Content-Length', mockGzArrayBuffer.byteLength.toString()),
      ctx.set('Content-Type', 'application/x-gzip'),
      // Respond with the "ArrayBuffer".
      ctx.body(mockGzArrayBuffer),
    )
};

export const handlers = [
  // Handles this GET request
  rest.get("http://127.0.0.1:49639/", (_,res,ctx) => {
    return res(
      ctx.status(200),
      ctx.json({result: {}}),
    )
  }),
  // Handles a .gz request
  rest.get(loadURL + "email.zkeyb.gz", zkeyGzHandler),
  rest.get(loadURL + "email.zkeyc.gz", zkeyGzHandler),
  rest.get(loadURL + "email.zkeyd.gz", zkeyGzHandler),
  rest.get(loadURL + "email.zkeye.gz", zkeyGzHandler),
  rest.get(loadURL + "email.zkeyf.gz", zkeyGzHandler),
  rest.get(loadURL + "email.zkeyg.gz", zkeyGzHandler),
  rest.get(loadURL + "email.zkeyh.gz", zkeyGzHandler),
  rest.get(loadURL + "email.zkeyi.gz", zkeyGzHandler),
  rest.get(loadURL + "email.zkeyj.gz", zkeyGzHandler),
  rest.get(loadURL + "email.zkeyk.gz", zkeyGzHandler),
];
