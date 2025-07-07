import type { IChainInfo } from './chain';
import type { IQuote } from './quote';
import type { ITokenInfo } from './token';

export interface IBridgeParams {
  fromChain: IChainInfo;
  toChain: IChainInfo;
  fromToken: ITokenInfo;
  toToken: ITokenInfo;
  amount: string;
  toAmount: string;
  receiver: string;
  ccipFee?: bigint;
  quote?: IQuote
  tokenList?: ITokenInfo[]
};
export interface BridgeState {
  isBridging: boolean;
  error: string | null;
  nativeLockHash?: `0x${string}`;
  erc20LockHash?: `0x${string}`;
  burnWrappedHash?: `0x${string}`;
  burnHash?: `0x${string}`;
}
