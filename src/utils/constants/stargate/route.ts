import  { StargateRouteName } from '@/utils/enums/bridge';

export const ROUTE_NAME_MAP: Record<string, StargateRouteName> = {
  "stargate/v2/taxi": StargateRouteName.Taxi,
  "stargate/v2/bus": StargateRouteName.Bus,
};

export function getStargateRouteNameFromUrl(url: string): StargateRouteName | undefined {
  return ROUTE_NAME_MAP[url];
}