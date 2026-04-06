export type UserRole = 'owner' | 'manager' | 'employee';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  permissions: string[];
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName?: string;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
  timestamp: string;
}
