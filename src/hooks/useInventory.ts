import { useCallback } from 'react';
import { InventoryItem } from '../types';
import { useInventoryStore } from '../store/useInventoryStore';
import { supabase } from '../lib/supabase';

export function useInventory(showToast: (message: string, type: 'success' | 'error') => void) {
  const { inventoryItems, setInventoryItems } = useInventoryStore();

  const fetchInventoryItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      const mapped = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        sku: item.sku,
        unitPrice: item.unit_price,
        stockLevel: item.stock_level,
        createdAt: item.created_at,
        createdBy: item.created_by,
        updatedBy: item.updated_by
      }));
      
      setInventoryItems(mapped);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
      showToast('Erro ao carregar estoque.', 'error');
    }
  }, [showToast, setInventoryItems]);

  const saveInventoryItemAPI = useCallback(async (item: Partial<InventoryItem>, id?: number) => {
    const mapped: any = {
      name: item.name,
      category: item.category,
      sku: item.sku,
      unit_price: item.unitPrice,
      stock_level: item.stockLevel,
      created_by: item.createdBy,
      updated_by: item.updatedBy
    };
    
    if (id) {
      const { error } = await supabase
        .from('inventory_items')
        .update(mapped)
        .eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('inventory_items')
        .insert([mapped]);
      if (error) throw error;
    }
  }, []);

  const deleteInventoryItemAPI = useCallback(async (id: number) => {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  return {
    inventoryItems,
    fetchInventoryItems,
    saveInventoryItemAPI,
    deleteInventoryItemAPI
  };
}
