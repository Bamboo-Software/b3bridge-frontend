/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StargateStepName } from '../enums/bridge';

export interface IQuoteFee {
  token: string;
  chainKey: string;
  amount: string;
  type: string;
}

export interface IQuoteStep {
  type: StargateStepName;
  sender: string;
  chainKey: string;
  transaction: {
    data: string;
    to: string;
    value: string;
    from: string;
  };
}

export interface IQuoteDuration {
  estimated: number;
}

export interface IQuote {
  route: string;
  error: any;
  srcAmount: string;
  dstAmount: string;
  srcAmountMax: string;
  dstAmountMin: string;
  srcToken: string;
  dstToken: string;
  srcAddress: string;
  dstAddress: string;
  srcChainKey: string;
  dstChainKey: string;
  dstNativeAmount: string;
  duration: IQuoteDuration;
  fees: IQuoteFee[];
  steps: IQuoteStep[];
}