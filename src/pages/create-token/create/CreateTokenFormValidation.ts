import { z } from "zod";

export const CreateTokenFormSchema = z.object({
  chains: z.array(z.string()).min(1, "Select at least one chain"),
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  decimals: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Decimals must be a positive number",
    }),
  tokenType: z.enum(["OFT"]),
  totalSupply: z.record(z.string()),
  logo: z.any().refine((file) => file instanceof File || file === null, {
    message: "Invalid file",
  }),
});