import { downloadFromFilename } from '../../helpers/zkp';
import ZkeydFetcherDemo from './ZkeydFetcherDemo';
import styled from "styled-components";

export const ZkeydFetcher: React.FC<{}> = (props) => {
  return (
    <ZkeydFetcherDemo />
  )
};

const AWSBucketInput = styled.input.attrs({ 
  type: 'text'
})`
  background: #00aec9;
  color: #fff;
`