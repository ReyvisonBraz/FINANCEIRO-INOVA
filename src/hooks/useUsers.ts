import { useCallback } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import { useAuthStore } from '../store/useAuthStore';

export const useUsers = () => {
  const { showToast } = useToast();
  const { users, setUsers } = useAuthStore();

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      const mapped = (data || []).map((p: any) => ({
        id: p.id,
        username: p.username,
        name: p.name,
        role: p.role,
        permissions: p.permissions || [],
        createdAt: p.created_at
      }));
      
      setUsers(mapped);
    } catch (err) {
      console.error("Failed to fetch users", err);
      showToast("Erro ao carregar usuários. Verifique sua conexão.", "error");
    }
  }, [showToast, setUsers]);

  const addUser = useCallback(async (user: Omit<User, 'id'>) => {
    try {
      const mapped = {
        username: user.username,
        name: user.name,
        role: user.role,
        permissions: user.permissions || []
      };
      
      const { error } = await supabase
        .from('profiles')
        .insert([mapped]);
      
      if (error) throw error;
      
      fetchUsers();
      return true;
    } catch (err) {
      console.error("Failed to add user", err);
      showToast("Erro ao adicionar usuário.", "error");
      return false;
    }
  }, [fetchUsers, showToast]);

  const updateUser = useCallback(async (id: number, user: Partial<User>) => {
    try {
      const mapped = {
        username: user.username,
        name: user.name,
        role: user.role,
        permissions: user.permissions || []
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(mapped)
        .eq('id', id);
      
      if (error) throw error;
      
      fetchUsers();
      return true;
    } catch (err) {
      console.error("Failed to update user", err);
      showToast("Erro ao atualizar usuário.", "error");
      return false;
    }
  }, [fetchUsers, showToast]);

  const deleteUser = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchUsers();
      return true;
    } catch (err) {
      console.error("Failed to delete user", err);
      showToast("Erro ao excluir usuário.", "error");
      return false;
    }
  }, [fetchUsers, showToast]);

  return { users, fetchUsers, addUser, updateUser, deleteUser };
};
