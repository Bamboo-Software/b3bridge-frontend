export const CONTRACT_ADDRESSES = {
  ethereum: {
    bridge: "0x3A4EC19d3B815680255797E1749a72aB32f12ed2",
  },
  sei: {
    bridge: "0xd66f4810c598e77b3954C013516aDa6ECd188b94"
  },

} as const;
export type SupportedChain = keyof typeof CONTRACT_ADDRESSES;
