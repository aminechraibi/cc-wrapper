import { z } from "zod";

export const ProfileSchema = z.object({
  env: z.record(z.string(), z.string()),
  args: z.array(z.string()),
});

export const ConfigSchema = z.object({
  default: z.string().nullable(),
  configs: z.record(z.string(), ProfileSchema),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
export type ConfigInput = z.infer<typeof ConfigSchema>;
