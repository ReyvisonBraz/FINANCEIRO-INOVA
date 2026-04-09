import React, { useState, useEffect } from 'react';
import { Inventory } from '../components/inventory/Inventory';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../components/ui/Toast';
import { useFilterStore } from '../store/useFilterStore';
import { useAppStore } from '../store/useAppStore';
import { useModalStore } from '../store/useModalStore';
import { useDebounce } from '../hooks/useDebounce';
import { InventoryItem } from '../types';

export const InventoryPage: React.FC = () => {
  const { showToast } = useToast();
  const { 
    inventorySearchTerm, setInventorySearchTerm,
    inventoryCategoryFilter, setInventoryCategoryFilter
  } = useFilterStore();
  const [localSearchTerm, setLocalSearchTerm] = useState(inventorySearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  useEffect(() => {
    setInventorySearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setInventorySearchTerm]);

  const { isAddingInventoryItem, setIsAddingInventoryItem } = useAppStore();
  const { openConfirm } = useModalStore();

  const {
    inventoryItems,
    saveInventoryItemAPI,
    deleteInventoryItemAPI,
    fetchInventoryItems
  } = useInventory(showToast);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'product' as 'product' | 'service',
    sku: '',
    unitPrice: '',
    stockLevel: ''
  });

  const handleAddItem = async (item: any) => {
    try {
      await saveInventoryItemAPI(item);
      await fetchInventoryItems();
      showToast('Item adicionado com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao adicionar item.', 'error');
    }
  };

  const handleUpdateItem = async (id: number, item: any) => {
    try {
      await saveInventoryItemAPI(item, id);
      await fetchInventoryItems();
      showToast('Item atualizado com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao atualizar item.', 'error');
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteInventoryItemAPI(id);
      await fetchInventoryItems();
      showToast('Item excluído com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao excluir item.', 'error');
    }
  };

  return (
    <Inventory
      items={inventoryItems}
      onAddItem={handleAddItem}
      onUpdateItem={handleUpdateItem}
      onDeleteItem={handleDeleteItem}
      searchTerm={localSearchTerm}
      onSearchChange={setLocalSearchTerm}
      categoryFilter={inventoryCategoryFilter}
      onCategoryFilterChange={setInventoryCategoryFilter}
      isAdding={isAddingInventoryItem}
      setIsAdding={setIsAddingInventoryItem}
      onOpenConfirm={openConfirm}
      editingItem={editingItem}
      setEditingItem={setEditingItem}
      newItem={newItem}
      setNewItem={setNewItem}
      showToast={showToast}
    />
  );
};

export default InventoryPage;
