export interface EquipmentType {
  id: number;
  name: string;
  icon?: string;
}

export interface Brand {
  id: number;
  name: string;
  equipmentType?: string;
}

export interface Model {
  id: number;
  brandId: number;
  name: string;
}
