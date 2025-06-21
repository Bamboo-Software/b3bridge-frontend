import { z } from "zod";

export const bridgeFormSchema = z.object({
  fromChain: z.object({
    name: z.string(),
    avatar: z.string(),
    id: z.string(),
    chainSelector: z.string(),
  }),
  toChain: z.object({
    name: z.string(),
    avatar: z.string(),
    id: z.string(),
    chainSelector: z.string(),
  }),
  fromWalletAddress: z.string()
    .min(1, "Wallet address is required")
    .regex(/^(0x)?[0-9a-fA-F]{40}$|^[a-z0-9]{65,90}$/, "Invalid wallet address format")
    ,
  toWalletAddress: z.string()
    .min(1, "Wallet address is required")
    .regex(/^(0x)?[0-9a-fA-F]{40}$|^[a-z0-9]{65,90}$/, "Invalid wallet address format")
    ,
  tokenAddress: z.string()
    .min(1, "Token address is required")
    .regex(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid token address format")
    ,
  tokenSymbol: z.string()
    .min(1, "Token symbol is required"),
  amount: z.string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Amount must be a positive number"
    ),
});

export type BridgeFormValues = z.infer<typeof bridgeFormSchema>;