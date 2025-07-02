import { ChainTokenSource } from '@/utils/enums/chain';
import { useLocalBridge } from './useBridgeLocalToken';
import { useStargateBridge } from './useBridgeStargateToken';
import type { IBridgeParams } from '@/utils/interfaces/bridge';

export const useBridgeTokens = (params: IBridgeParams) => {
  const {
  fromChain
} = params
  const localBridge = useLocalBridge();
  const stargateBridge = useStargateBridge();

  const bridge =
    fromChain.source === ChainTokenSource.Stargate
      ? () => stargateBridge(params)
      : () => localBridge(params);

  return bridge;
};