import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSettingsStore } from '../store/useSettingsStore';

export function useSettings(showToast: (message: string, type: 'success' | 'error') => void) {
  const { 
    settings, setSettings, 
    categories, setCategories,
    fetchSettings: fetchSettingsStore,
    fetchCategories: fetchCategoriesStore,
    saveSettingsAPI: saveSettingsStore
  } = useSettingsStore();

  const fetchSettings = useCallback(async () => {
    await fetchSettingsStore();
  }, [fetchSettingsStore]);

  const fetchCategories = useCallback(async () => {
    await fetchCategoriesStore();
  }, [fetchCategoriesStore]);

  const saveSettingsAPI = useCallback(async (newSettings: any) => {
    try {
      await saveSettingsStore(newSettings);
      showToast('Configurações salvas com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao salvar configurações.', 'error');
    }
  }, [saveSettingsStore, showToast]);

  const addCategory = useCallback(async (category: any) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: category.name, type: category.type }]);
      
      if (error) throw error;
      fetchCategoriesStore();
    } catch (err) {
      console.error("Failed to add category", err);
    }
  }, [fetchCategoriesStore]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchCategoriesStore();
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  }, [fetchCategoriesStore]);

  return {
    settings,
    setSettings,
    categories,
    setCategories,
    fetchSettings,
    fetchCategories,
    saveSettingsAPI,
    addCategory,
    deleteCategory
  };
}
