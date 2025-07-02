import { ChainTokenSource } from '@/utils/enums/chain';
import { useLocalBridge } from './useBridgeLocalToken';
import { useStargateBridge } from './useBridgeStargateToken';
import type { IBridgeParams } from '@/utils/interfaces/bridge';

export const useBridgeTokens = (params: IBridgeParams) => {
  const { fromChain } = params || {};
  const localBridge = useLocalBridge();
  const stargateBridge = useStargateBridge(params);

  if (!params || !fromChain || !fromChain.source) {
    return () => Promise.resolve();
  }

  const bridge =
    fromChain.source === ChainTokenSource.Stargate
      ? () => stargateBridge()
      : () => localBridge(params);

  return bridge;
};