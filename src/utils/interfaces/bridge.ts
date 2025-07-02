import type { IChainInfo } from './chain';
import type { ITokenInfo } from './token';

export interface IBridgeParams {
  fromChain: IChainInfo;
  toChain: IChainInfo;
  fromToken: ITokenInfo;
  toToken: ITokenInfo;
  amount: string;
  receiver: string;
};