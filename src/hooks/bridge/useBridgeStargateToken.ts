import type { IBridgeParams } from '@/utils/interfaces/bridge';

export const useStargateBridge = () => {
  const bridge = async (params: IBridgeParams) => {
    return { status: 'success', type: 'stargate', params };
  };
  return bridge;
};