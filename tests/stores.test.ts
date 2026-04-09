import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../src/store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start unauthenticated', () => {
    const { isAuthenticated } = useAuthStore.getState();
    expect(isAuthenticated).toBe(false);
  });

  it('should login user and set token', () => {
    const { login } = useAuthStore.getState();
    
    login({ id: 1, username: 'test', role: 'manager', name: 'Test', createdAt: '2024-01-01', permissions: [], token: 'test-token' });
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.currentUser?.username).toBe('test');
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
  });

  it('should logout user and clear token', () => {
    const { login, logout } = useAuthStore.getState();
    
    login({ id: 1, username: 'test', role: 'manager', name: 'Test', createdAt: '2024-01-01', permissions: [], token: 'test-token' });
    logout();
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.currentUser).toBe(null);
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('should check permissions correctly for owner', () => {
    const { login } = useAuthStore.getState();
    
    login({ id: 1, username: 'owner', role: 'owner', name: 'Owner', createdAt: '2024-01-01', permissions: [] });
    
    const { hasPermission } = useAuthStore.getState();
    expect(hasPermission('anything')).toBe(true);
  });

  it('should check permissions for non-owner', () => {
    const { login } = useAuthStore.getState();
    
    login({ id: 2, username: 'employee', role: 'employee', name: 'Employee', createdAt: '2024-01-01', permissions: ['view_dashboard'] });
    
    const { hasPermission } = useAuthStore.getState();
    expect(hasPermission('view_dashboard')).toBe(true);
    expect(hasPermission('manage_settings')).toBe(false);
  });
});
