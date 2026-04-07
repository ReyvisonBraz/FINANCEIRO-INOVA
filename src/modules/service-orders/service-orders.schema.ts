import { z } from "zod";

export const CreateServiceOrderSchema = z.object({
  customerId: z.number().int().positive(),
  equipmentType: z.string().optional().nullable(),
  equipmentBrand: z.string().optional().nullable(),
  equipmentModel: z.string().optional().nullable(),
  equipmentColor: z.string().optional().nullable(),
  equipmentSerial: z.string().optional().nullable(),
  reportedProblem: z.string().min(1, "Problema relatado obrigatório"),
  arrivalPhotoUrl: z.string().optional().nullable(),
  arrivalPhotoBase64: z.string().optional().nullable(),
  status: z.string().optional(),
  entryDate: z.string().optional().nullable(),
  analysisPrediction: z.string().optional().nullable(),
  customerPassword: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  ramInfo: z.string().optional().nullable(),
  ssdInfo: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const UpdateServiceOrderSchema = z.object({
  equipmentType: z.string().optional().nullable(),
  equipmentBrand: z.string().optional().nullable(),
  equipmentModel: z.string().optional().nullable(),
  equipmentColor: z.string().optional().nullable(),
  equipmentSerial: z.string().optional().nullable(),
  reportedProblem: z.string().optional(),
  arrivalPhotoUrl: z.string().optional().nullable(),
  arrivalPhotoBase64: z.string().optional().nullable(),
  status: z.string().optional(),
  technicalAnalysis: z.string().optional().nullable(),
  servicesPerformed: z.string().optional().nullable(),
  partsUsed: z.string().optional(),      // JSON string
  serviceFee: z.number().nonnegative().optional().nullable(),
  totalAmount: z.number().nonnegative().optional().nullable(),
  finalObservations: z.string().optional().nullable(),
  entryDate: z.string().optional().nullable(),
  analysisPrediction: z.string().optional().nullable(),
  customerPassword: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  ramInfo: z.string().optional().nullable(),
  ssdInfo: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const ServiceOrderFilterSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateServiceOrderInput = z.infer<typeof CreateServiceOrderSchema>;
export type UpdateServiceOrderInput = z.infer<typeof UpdateServiceOrderSchema>;
export type ServiceOrderFilter = z.infer<typeof ServiceOrderFilterSchema>;
