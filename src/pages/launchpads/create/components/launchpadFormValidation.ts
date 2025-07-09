import { z } from "zod";

export const launchpadFormSchema = z.object({
  token: z.any().refine(val => val != null, { message: "Token is required" }),
  chain: z.array(z.string()).min(1, "At least one chain is required"),
  chainFields: z.record(
    z.object({
      address: z.string().min(1, "Contract address is required"),
      totalFee: z.string().optional(),
      transactions: z.object({
        native: z.object({
          payStatus: z.string().optional(),
          payError: z.string().optional(),
          payHash: z.string().optional(),
          amount: z.string().optional(),
          gasEstimate: z.string().optional(),
        }).optional(),
        oft: z.object({
          payStatus: z.string().optional(),
          payError: z.string().optional(),
          payHash: z.string().optional(),
          amount: z.string().optional(),
          tokenAddress: z.string().optional(),
        }).optional()
      }).optional(),
      presaleRate: z.string().min(1, "Presale Rate is required"),
      numberOfTokens: z.string().min(1, "Number of tokens is required"),
      softcap: z.string().min(1, "Softcap is required"),
      hardcap: z.string().min(1, "Hardcap is required"),
      minBuy: z.string().min(1, "Minimum Buy is required"),
      maxBuy: z.string().min(1, "Maximum Buy is required"),
    })
  ),
  startTime: z.date({ required_error: "Start time is required" }).nullable(),
  endTime: z.date({ required_error: "End time is required" }).nullable(),
  logoUrl: z.string().url("Logo must be a valid URL").min(1, "Logo is required"),
  website: z.string().url("Website must be a valid URL").min(1, "Website is required"),
  facebook: z.string().url("Facebook must be a valid URL").optional().or(z.literal("")),
  x: z.string().url("X must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Github must be a valid URL").optional().or(z.literal("")),
  telegram: z.string().url("Telegram must be a valid URL").optional().or(z.literal("")),
  instagram: z.string().url("Instagram must be a valid URL").optional().or(z.literal("")),
  discord: z.string().url("Discord must be a valid URL").optional().or(z.literal("")),
  reddit: z.string().url("Reddit must be a valid URL").optional().or(z.literal("")),
  youtube: z.string().url("Youtube must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate time
  if (data.startTime && data.endTime && data.endTime <= data.startTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
      path: ["endTime"],
    });
  }

  // Validate chain fields
  if (data.chain && data.chain.length > 0) {
    for (const chainId of data.chain) {
      const field = data.chainFields?.[chainId];
      if (
        !field ||
        !field.presaleRate ||
        !field.numberOfTokens ||
        !field.softcap ||
        !field.hardcap ||
        !field.minBuy ||
        !field.maxBuy ||
        !field.address
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please fill all required fields for each chain.",
          path: ["chainFields"],
        });
        break;
      }
    }
  }
});

export type LaunchpadFormValues = z.infer<typeof launchpadFormSchema>;