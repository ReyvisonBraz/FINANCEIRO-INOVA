import React from 'react';
import Settings from '../components/settings/Settings';
import { useSettings } from '../hooks/useSettings';
import { useUsers } from '../hooks/useUsers';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { useToast } from '../components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { 
    settings, 
    saveSettingsAPI, 
    addCategory, 
    deleteCategory,
    categories
  } = useSettings();
  
  const { useUsersQuery, addUserMutation, updateUserMutation, deleteUserMutation } = useUsers();
  const { useAuditLogsQuery } = useAuditLogs();

  const usersQuery = useUsersQuery();
  const auditLogsQuery = useAuditLogsQuery();

  return (
    <Settings 
      settings={settings}
      onUpdateSettings={saveSettingsAPI}
      categories={categories}
      onAddCategory={(name, type) => addCategory({ name, type })}
      onDeleteCategory={deleteCategory}
      users={(usersQuery as any).data || []}
      onAddUser={(user: any) => addUserMutation.mutate(user)}
      onUpdateUser={(id: number, user: any) => updateUserMutation.mutate({ id, user })}
      onDeleteUser={(id: number) => deleteUserMutation.mutate(id)}
      auditLogs={(auditLogsQuery as any).data || []}
    />
  );
};

export default SettingsPage;
