import { z } from "zod";

export const bridgeFormSchema = z.object({
  fromChain: z
    .any()
    .refine((val) => !!val, { message: "From chain is required" }),

  toChain: z
    .any()
    .refine((val) => !!val, { message: "To chain is required" }),

  token: z
    .any()
    .refine((val) => !!val, { message: "Token is required" }),

  fromWalletAddress: z
    .string()
    .min(1, "Wallet address is required")
    .regex(/^(0x)?[0-9a-fA-F]{40}$|^[a-z0-9]{65,90}$/, "Invalid wallet address format"),

  toWalletAddress: z
    .string()
    .min(1, "Wallet address is required")
    .regex(/^(0x)?[0-9a-fA-F]{40}$|^[a-z0-9]{65,90}$/, "Invalid wallet address format"),

  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Amount must be a positive number"
    ),
});

export type BridgeFormValues = z.infer<typeof bridgeFormSchema>;
