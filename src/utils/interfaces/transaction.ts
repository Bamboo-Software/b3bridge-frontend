import type { ChainTokenSource } from '../enums/chain';
import type { StargateTransactionStatus } from '../enums/transaction';
import type { IChainInfo } from './chain';
import type { IQuote } from './quote';
import type { ITokenInfo } from './token';

export interface ITransaction {
  userAddress: string;
  txHash: string;
  status: StargateTransactionStatus;
  fromChain: IChainInfo;
  toChain: IChainInfo;
  fromToken: ITokenInfo;
  toToken: ITokenInfo;
  source: ChainTokenSource
  quote?: IQuote
  fromAmount: string
  toAmount: string
}