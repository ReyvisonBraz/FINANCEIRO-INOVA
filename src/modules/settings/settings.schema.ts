import { z } from "zod";

export const UpdateSettingsSchema = z.object({
  appName: z.string().optional(),
  appVersion: z.string().optional(),
  fiscalYear: z.string().optional(),
  primaryColor: z.string().optional(),
  categories: z.string().optional(),
  incomeCategories: z.string().optional(),
  expenseCategories: z.string().optional(),
  profileName: z.string().optional(),
  profileAvatar: z.string().optional().nullable(),
  initialBalance: z.number().optional(),
  showWarnings: z.number().int().min(0).max(1).optional(),
  hiddenColumns: z.string().optional(),
  settingsPassword: z.string().optional(),
  receiptLayout: z.enum(["simple", "a4"]).optional(),
  receiptLogo: z.string().optional().nullable(),
  companyCnpj: z.string().optional().nullable(),
  companyAddress: z.string().optional().nullable(),
  pixKey: z.string().optional().nullable(),
  pixQrCode: z.string().optional().nullable(),
  whatsappBillingTemplate: z.string().optional().nullable(),
  whatsappOSTemplate: z.string().optional().nullable(),
  sendPulseClientId: z.string().optional().nullable(),
  sendPulseClientSecret: z.string().optional().nullable(),
  sendPulseTemplateId: z.string().optional().nullable(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
