import type { IBridgeParams } from '@/utils/interfaces/bridge';

export const useLocalBridge = () => {
  const bridge = async (params: IBridgeParams) => {
    return { status: 'success', type: 'local', params };
  };
  return bridge;
};