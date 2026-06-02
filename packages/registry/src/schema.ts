import { z } from "zod";

export const IntegrationCategory = z.enum([
  "auth",
  "billing",
  "payments",
  "subscriptions",
  "email",
  "database",
  "vector",
  "storage",
  "hosting",
  "ai",
  "framework",
  "monitoring",
]);

export const IntegrationPattern = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export const IntegrationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  categories: z.array(IntegrationCategory).min(1),
  docs: z.array(z.string().url()).min(1),
  env: z.array(z.string()).min(0),
  security: z.array(z.string()).min(1),
  patterns: z.array(IntegrationPattern).min(1),
  sdk: z
    .object({
      npm: z.string().optional(),
      ruby: z.string().optional(),
      python: z.string().optional(),
    })
    .partial()
    .optional(),
  pairings: z.array(z.string()).optional(),
});

export type Integration = z.infer<typeof IntegrationSchema>;
export type IntegrationCategory = z.infer<typeof IntegrationCategory>;
