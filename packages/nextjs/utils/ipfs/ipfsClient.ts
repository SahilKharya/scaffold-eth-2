// utils/ipfsClient.js
import { create } from 'ipfs-http-client';

// Connect to an IPFS node provider, Infura in this case
const projectId = process.env.NEXT_PUBLIC_INFURA_API_KEY ;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_API_KEY_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  }
});

export default ipfsClient;