import { useCallback } from 'react';
import { User, AuditLog } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';

export function useAuth(showToast?: (message: string, type: 'success' | 'error') => void) {
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
      console.log('[useAuth] fetchUsers called');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });
      
      console.log('[useAuth] fetchUsers result:', { error });
      
      if (error) {
        console.error('[useAuth] fetchUsers error:', error);
        throw error;
      }
      
      const mapped = (data || []).map((p: any) => ({
        id: p.id,
        username: p.username || '',
        name: p.name || '',
        role: p.role || 'employee',
        permissions: Array.isArray(p.permissions) ? p.permissions : (typeof p.permissions === 'string' ? JSON.parse(p.permissions) : []),
        createdAt: p.created_at || new Date().toISOString()
      }));
      
      setUsers(mapped);
      console.log('[useAuth] fetchUsers success, count:', mapped.length);
    } catch (err) {
      console.error("[useAuth] Failed to fetch users:", err);
      if (showToast) {
        showToast('Erro ao carregar usuários.', 'error');
      }
    }
  }, [showToast, setUsers]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      console.log('[useAuth] fetchAuditLogs called');
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, profiles(name)')
        .order('timestamp', { ascending: false })
        .limit(100);
      
      console.log('[useAuth] fetchAuditLogs result:', { error });
      
      if (error) {
        console.error('[useAuth] fetchAuditLogs error:', error);
        throw error;
      }
      
      const mapped = (data || []).map((l: any) => ({
        id: l.id,
        userId: l.user_id,
        userName: l.profiles?.name,
        action: l.action || '',
        entity: l.entity || '',
        entityId: l.entity_id,
        details: l.details,
        timestamp: l.timestamp || new Date().toISOString()
      }));
      
      setAuditLogs(mapped);
      console.log('[useAuth] fetchAuditLogs success, count:', mapped.length);
    } catch (err) {
      console.error("[useAuth] Failed to fetch audit logs:", err);
      if (showToast) {
        showToast('Erro ao carregar logs de auditoria.', 'error');
      }
    }
  }, [showToast, setAuditLogs]);

  const saveUserAPI = useCallback(async (user: Partial<User>, id?: string | number) => {
    try {
      const mapped = {
        username: user.username,
        name: user.name,
        role: user.role || 'employee',
        permissions: Array.isArray(user.permissions) ? user.permissions : []
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
    } catch (err) {
      console.error('[useAuth] saveUserAPI error:', err);
      throw err;
    }
  }, []);

  const deleteUserAPI = useCallback(async (id: string | number) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('[useAuth] deleteUserAPI error:', err);
      throw err;
    }
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
