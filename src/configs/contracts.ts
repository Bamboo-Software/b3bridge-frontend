export const CONTRACT_ADDRESSES = {
  ethereum: {
    bridge: "0x08C386a6E0903B744a71d5d744209A5aeFac3f68",
  },
  sei: {
    bridge: "0x29B074Dd361179Ba1bF0B4a68b242A269C62B60b"
  },

} as const;
export type SupportedChain = keyof typeof CONTRACT_ADDRESSES;
