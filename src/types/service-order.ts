export type ServiceOrderPriority = 'low' | 'medium' | 'high';

export interface ServiceOrderPart {
  id?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ServiceOrderItem {
  name: string;
  price: number;
}

export interface ServiceOrderStatus {
  id: number;
  name: string;
  color: string;
  priority: number;
  isDefault?: boolean;
}

export interface ServiceOrder {
  id: number;
  customerId: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  equipmentType?: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  equipmentColor?: string;
  equipmentSerial?: string;
  reportedProblem?: string;
  arrivalPhotoUrl?: string;
  arrivalPhotoBase64?: string;
  status: string;
  technicalAnalysis?: string;
  servicesPerformed?: string;
  services?: ServiceOrderItem[];
  partsUsed: ServiceOrderPart[];
  serviceFee: number;
  totalAmount: number;
  finalObservations?: string;
  entryDate?: string;
  analysisPrediction?: string;
  customerPassword?: string;
  accessories?: string;
  ramInfo?: string;
  ssdInfo?: string;
  priority?: ServiceOrderPriority;
  createdAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface ServiceOrderFormData {
  customerId: number;
  equipmentType?: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  equipmentColor?: string;
  equipmentSerial?: string;
  reportedProblem?: string;
  arrivalPhotoUrl?: string;
  arrivalPhotoBase64?: string;
  status?: string;
  entryDate?: string;
  customerPassword?: string;
  accessories?: string;
  ramInfo?: string;
  ssdInfo?: string;
  priority?: ServiceOrderPriority;
  technicalAnalysis?: string;
  servicesPerformed?: string;
  services?: ServiceOrderItem[];
  partsUsed?: ServiceOrderPart[];
  serviceFee?: number;
  totalAmount?: number;
  finalObservations?: string;
}
