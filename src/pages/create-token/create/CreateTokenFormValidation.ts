import { z } from "zod";

export const CreateTokenFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  decimals: z.coerce.number().positive("Decimals must be a positive number"),

  description: z.string().optional(),
  website: z.string().url().optional(),
  whitepaper: z.string().url().optional(),
  telegram: z.string().url().optional(),
  twitter: z.string().url().optional(),
  discord: z.string().url().optional(),
  github: z.string().url().optional(),
  systemWalletAddress: z.string().optional(),
  id: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),

  targetChains: z.array(z.string()).min(1, "Select at least one chain"),
  tokenType: z.enum(["OFT"]),
  totalSupply: z.string().optional(),
  logoUrl: z.string().url({ message: "Invalid logo URL" }),
  targetChainOptions: z
    .array(
      z.object({
        chainId: z.string(),
        totalSupply: z.string().min(1, "Total supply is required"),
        decimals: z.number().positive().optional(),
      })
    )
    .optional(),
  chainFields: z.record(
    z.object({
      totalSupply: z.string().min(1, "Total supply is required"),
      id: z.string().optional(),
      systemWalletAddress: z.string().optional(),
      paymentTokenAddress: z.string().optional(),
      deployFee: z.string().optional(),
      platformFee: z.string().optional(),
      tokenAddress: z.string().optional(),
      transactions: z
        .object({
          native: z
            .object({
              payStatus: z.string().optional(),
              payError: z.string().optional(),
              payHash: z.string().optional(),
              amount: z.string().optional(),
              gasEstimate: z.string().optional(),
              isVerify: z.boolean().optional(),
            })
            .optional(),
        })
        .optional(),
    })
  ),

}).refine(
  (data) => {
    if (data.targetChains.length === 1) {
      return data.totalSupply && data.totalSupply !== "0";
    }
    if (data.targetChains.length > 1) {
      return (
        data.targetChainOptions &&
        data.targetChainOptions.length === data.targetChains.length &&
        data.targetChainOptions.every((opt) => opt.totalSupply && opt.totalSupply !== "0")
      );
    }
    return true;
  },
  {
    message: "Total supply is required for the selected chain or chain options",
    path: ["totalSupply"],
  }
);

export type CreateTokenFormValues = z.infer<typeof CreateTokenFormSchema>;