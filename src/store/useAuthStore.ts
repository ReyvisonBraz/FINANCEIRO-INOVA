import { create } from 'zustand';
import { User, AuditLog } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  auditLogs: AuditLog[];

  login: (user: User & { token?: string }) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  getToken: () => string | null;

  setUsers: (users: User[]) => void;
  setAuditLogs: (logs: AuditLog[]) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('auth_token'),
  currentUser: localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null,
  users: [],
  auditLogs: [],

  login: (user) => {
    const { token, ...userWithoutToken } = user as any;
    if (token) localStorage.setItem('auth_token', token);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(userWithoutToken));
    set({ isAuthenticated: true, currentUser: userWithoutToken });
  },

  logout: () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    set({ isAuthenticated: false, currentUser: null });
  },

  getToken: () => localStorage.getItem('auth_token'),
  
  hasPermission: (permission) => {
    const { currentUser } = get();
    if (!currentUser) return false;
    if (currentUser.role === 'owner') return true;
    return currentUser.permissions?.includes(permission) || false;
  },
  
  setUsers: (users) => set({ users }),
  setAuditLogs: (logs) => set({ auditLogs: logs }),
}));
