import { prisma } from "../../shared/lib/prisma.js";
import { createAuditLog } from "../../shared/lib/audit.js";
import type {
  CreateBrandInput,
  UpdateBrandInput,
  CreateModelInput,
  UpdateModelInput,
  CreateEquipmentTypeInput,
  UpdateEquipmentTypeInput,
} from "./catalog.schema.js";

// ─── Marcas ───────────────────────────────────────────────────────────────────

export async function listBrands(equipmentType?: string) {
  return prisma.brand.findMany({
    where: equipmentType ? { equipmentType } : {},
    orderBy: { name: "asc" },
    include: { Models: { orderBy: { name: "asc" } } },
  });
}

export async function createBrand(input: CreateBrandInput, userId?: number) {
  const brand = await prisma.brand.create({ data: input });
  await createAuditLog("CREATE", "Brand", brand.id, brand.name, userId);
  return brand;
}

export async function updateBrand(id: number, input: UpdateBrandInput, userId?: number) {
  const brand = await prisma.brand.update({ where: { id }, data: input });
  await createAuditLog("UPDATE", "Brand", id, brand.name, userId);
  return brand;
}

export async function deleteBrand(id: number, userId?: number) {
  await prisma.brand.delete({ where: { id } });
  await createAuditLog("DELETE", "Brand", id, `Marca #${id} removida`, userId);
}

// ─── Modelos ──────────────────────────────────────────────────────────────────

export async function listModels(brandId?: number) {
  return prisma.model.findMany({
    where: brandId ? { brandId } : {},
    orderBy: { name: "asc" },
    include: { brand: { select: { id: true, name: true } } },
  });
}

export async function createModel(input: CreateModelInput, userId?: number) {
  const model = await prisma.model.create({
    data: input,
    include: { brand: { select: { id: true, name: true } } },
  });
  await createAuditLog("CREATE", "Model", model.id, model.name, userId);
  return model;
}

export async function updateModel(id: number, input: UpdateModelInput, userId?: number) {
  const model = await prisma.model.update({
    where: { id },
    data: input,
    include: { brand: { select: { id: true, name: true } } },
  });
  await createAuditLog("UPDATE", "Model", id, model.name, userId);
  return model;
}

export async function deleteModel(id: number, userId?: number) {
  await prisma.model.delete({ where: { id } });
  await createAuditLog("DELETE", "Model", id, `Modelo #${id} removido`, userId);
}

// ─── Tipos de Equipamento ─────────────────────────────────────────────────────

export async function listEquipmentTypes() {
  return prisma.equipmentType.findMany({ orderBy: { name: "asc" } });
}

export async function createEquipmentType(input: CreateEquipmentTypeInput, userId?: number) {
  const type = await prisma.equipmentType.create({ data: input });
  await createAuditLog("CREATE", "EquipmentType", type.id, type.name, userId);
  return type;
}

export async function updateEquipmentType(id: number, input: UpdateEquipmentTypeInput, userId?: number) {
  const type = await prisma.equipmentType.update({ where: { id }, data: input });
  await createAuditLog("UPDATE", "EquipmentType", id, type.name, userId);
  return type;
}

export async function deleteEquipmentType(id: number, userId?: number) {
  await prisma.equipmentType.delete({ where: { id } });
  await createAuditLog("DELETE", "EquipmentType", id, `Tipo #${id} removido`, userId);
}
