export const CONTRACT_ADDRESSES = {
  ethereum: {
    bridge: "0x740edCEcACf42130f3f72e9ae86202b05D725adE",
  },
  sei: {
    bridge: "0xAb2A4D46982E2a511443324368A0777C7f41faF6"
  },

} as const;
export type SupportedChain = keyof typeof CONTRACT_ADDRESSES;
