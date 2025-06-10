export const CONTRACT_ADDRESSES = {
  ethereum: {
    bridge: "0xCC5CC512b245a2FAe83B570605c3A9145C679829",
  },
  sei: {
    bridge: "0x17bce35395D53A4607d915C19e6Df5902bB8d96A"
  },

} as const;
export type SupportedChain = keyof typeof CONTRACT_ADDRESSES;
