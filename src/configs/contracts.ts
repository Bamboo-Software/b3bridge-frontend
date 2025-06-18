export const CONTRACT_ADDRESSES = {
  ethereum: {
    bridge: "0x44E44963dd3933D70453F457D772A81Eb2F55fcf",
  },
  sei: {
    bridge: "0xf3Ed274027eDE779A86C4aA118dD7b36DbE8ea7F"
  },

} as const;
export type SupportedChain = keyof typeof CONTRACT_ADDRESSES;
