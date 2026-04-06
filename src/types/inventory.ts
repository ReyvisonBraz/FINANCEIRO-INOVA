export interface InventoryItem {
  id: number;
  name: string;
  category: 'product' | 'service';
  sku?: string;
  unitPrice: number;
  stockLevel: number;
  createdAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export type InventoryItemFormData = {
  name: string;
  category: 'product' | 'service';
  sku?: string;
  unitPrice: number;
  stockLevel: number;
};
