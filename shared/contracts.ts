import { SorobanRpc } from '@stellar/stellar-sdk';

const rpcUrl = process.env.SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org';

export const rpc = new SorobanRpc.Server(rpcUrl);
export const streamContractId = process.env.STREAM_CONTRACT_ID ?? '';
