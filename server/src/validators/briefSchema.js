import { z } from "zod";

export const briefSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  company: z.string().max(160).optional().or(z.literal("")),
  focus: z
    .string()
    .min(4)
    .refine(
      (value) =>
        [
          "Platform architecture & migration",
          "Search & personalization",
          "AI/ML product build",
          "Full-stack web experience",
          "Automation & DevOps",
          "Something else"
        ].includes(value),
      "Focus must be one of the predefined options"
    ),
  budget: z.string().max(80).optional().or(z.literal("")),
  timeline: z.string().max(80).optional().or(z.literal("")),
  overview: z.string().min(20).max(2000),
  deliverables: z.string().max(2000).optional().or(z.literal("")),
  references: z.string().max(2000).optional().or(z.literal("")),
  consent: z.boolean().refine((val) => val, "Consent is required")
});
