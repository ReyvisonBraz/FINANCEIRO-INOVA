import { z } from 'zod';

export const serviceOrderSchema = z.object({
  customerId: z.number().min(1, 'Cliente é obrigatório'),
  equipmentType: z.string().min(1, 'Tipo de equipamento é obrigatório'),
  equipmentBrand: z.string().min(1, 'Marca é obrigatória'),
  equipmentModel: z.string().min(1, 'Modelo é obrigatório'),
  serialNumber: z.string().optional(),
  equipmentSerial: z.string().optional(),
  problemDescription: z.string().min(1, 'Descrição do problema é obrigatória'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.string().min(1, 'Status é obrigatório'),
  entryDate: z.string().min(1, 'Data de entrada é obrigatória'),
  estimatedDate: z.string().optional(),
  totalAmount: z.number().optional().default(0),
  observation: z.string().optional(),
  equipmentColor: z.string().optional(),
  customerPassword: z.string().optional(),
  accessories: z.string().optional(),
  ramInfo: z.string().optional(),
  ssdInfo: z.string().optional(),
  reportedProblem: z.string().optional(),
  technicalAnalysis: z.string().optional(),
  servicesPerformed: z.string().optional(),
  services: z.any().optional(),
  partsUsed: z.any().optional(),
  arrivalPhotoBase64: z.string().optional(),
  serviceFee: z.number().optional().default(0),
  finalObservations: z.string().optional(),
});

export type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;