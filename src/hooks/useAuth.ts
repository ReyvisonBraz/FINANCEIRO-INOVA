import { useCallback } from 'react';
import { User, AuditLog } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

export function useAuth(showToast: (message: string, type: 'success' | 'error') => void) {
  const { 
    isAuthenticated, 
    currentUser, 
    users, 
    auditLogs, 
    login, 
    logout, 
    hasPermission,
    setUsers,
    setAuditLogs
  } = useAuthStore();

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
      showToast('Erro ao carregar usuários.', 'error');
    }
  }, [showToast, setUsers]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, profiles(name)')
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      const mapped = (data || []).map((l: any) => ({
        id: l.id,
        userId: l.user_id,
        userName: l.profiles?.name,
        action: l.action,
        entity: l.entity,
        entityId: l.entity_id,
        details: l.details,
        timestamp: l.timestamp
      }));
      
      setAuditLogs(mapped);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
      showToast('Erro ao carregar logs de auditoria.', 'error');
    }
  }, [showToast, setAuditLogs]);

  const saveUserAPI = useCallback(async (user: Partial<User>, id?: number) => {
    const mapped = {
      username: user.username,
      name: user.name,
      role: user.role,
      permissions: user.permissions || []
    };
    
    if (id) {
      const { error } = await supabase
        .from('profiles')
        .update(mapped)
        .eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('profiles')
        .insert([mapped]);
      if (error) throw error;
    }
  }, []);

  const deleteUserAPI = useCallback(async (id: number) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }, []);

  return {
    isAuthenticated,
    currentUser,
    users,
    auditLogs,
    login,
    logout,
    hasPermission,
    fetchUsers,
    fetchAuditLogs,
    saveUserAPI,
    deleteUserAPI
  };
}
