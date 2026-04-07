import { z } from "zod";

export const CreateBrandSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  equipmentType: z.string().optional().nullable(),
});

export const UpdateBrandSchema = CreateBrandSchema.partial();

export const CreateModelSchema = z.object({
  brandId: z.number().int().positive(),
  name: z.string().min(1, "Nome obrigatório"),
});

export const UpdateModelSchema = z.object({
  name: z.string().min(1),
});

export const CreateEquipmentTypeSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  icon: z.string().optional().nullable(),
});

export const UpdateEquipmentTypeSchema = CreateEquipmentTypeSchema.partial();

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>;
export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>;
export type CreateModelInput = z.infer<typeof CreateModelSchema>;
export type UpdateModelInput = z.infer<typeof UpdateModelSchema>;
export type CreateEquipmentTypeInput = z.infer<typeof CreateEquipmentTypeSchema>;
export type UpdateEquipmentTypeInput = z.infer<typeof UpdateEquipmentTypeSchema>;
