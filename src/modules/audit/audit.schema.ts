import { z } from "zod";

export const AuditFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  entity: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type AuditFilter = z.infer<typeof AuditFilterSchema>;
