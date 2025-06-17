export const CONTRACT_ADDRESSES = {
  ethereum: {
    bridge: "0x9493a27756cBD6D63E2d700b322dA2A031e86687",
  },
  sei: {
    bridge: "0x29B074Dd361179Ba1bF0B4a68b242A269C62B60b"
  },

} as const;
export type SupportedChain = keyof typeof CONTRACT_ADDRESSES;
