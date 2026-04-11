import { useState, useCallback } from 'react';
import { AppSettings } from '../types';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

export const useAppSettings = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'Financeiro Pro',
    fiscalYear: '2024',
    primaryColor: '#1152d4',
    categories: 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
    incomeCategories: 'Salário,Vendas,Serviços,Investimentos,Outros',
    expenseCategories: 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
    profileName: 'Inova Informática',
    profileAvatar: 'https://picsum.photos/seed/inova/100/100',
    appVersion: 'Versão Empresarial',
    initialBalance: 0,
    showWarnings: true,
    currency: 'BRL',
    hiddenColumns: [],
    settingsPassword: '1234',
    receiptLayout: 'a4',
    receiptLogo: '',
    receiptCnpj: '',
    receiptAddress: '',
    receiptPixKey: '',
    receiptQrCode: ''
  });

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSettings({
          appName: data.app_name || 'Financeiro Inova',
          fiscalYear: data.fiscal_year || '2024',
          primaryColor: data.primary_color || '#1152d4',
          categories: data.categories || 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
          incomeCategories: data.income_categories || 'Salário,Vendas,Serviços,Investimentos,Outros',
          expenseCategories: data.expense_categories || 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
          profileName: data.profile_name || 'Minha Empresa',
          profileAvatar: data.profile_avatar || 'https://picsum.photos/seed/default/100/100',
          appVersion: data.app_version || 'Versão 1.0',
          initialBalance: data.initial_balance || 0,
          showWarnings: Boolean(data.show_warnings),
          currency: 'BRL',
          hiddenColumns: data.hidden_columns || [],
          settingsPassword: data.settings_password || '1234',
          receiptLayout: data.receipt_layout || 'a4',
          receiptLogo: data.receipt_logo || '',
          receiptCnpj: data.company_cnpj || '',
          receiptAddress: data.company_address || '',
          receiptPixKey: data.pix_key || '',
          receiptQrCode: data.pix_qr_code || '',
          whatsappBillingTemplate: data.whatsapp_billing_template || '',
          whatsappOSTemplate: data.whatsapp_os_template || '',
          sendPulseClientId: data.sendpulse_client_id || '',
          sendPulseClientSecret: data.sendpulse_client_secret || '',
          sendPulseTemplateId: data.sendpulse_template_id || ''
        });
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
      showToast("Erro ao carregar configurações.", "error");
    }
  }, [showToast]);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      const mapped = {
        app_name: newSettings.appName,
        fiscal_year: newSettings.fiscalYear,
        primary_color: newSettings.primaryColor,
        categories: newSettings.categories,
        income_categories: newSettings.incomeCategories,
        expense_categories: newSettings.expenseCategories,
        profile_name: newSettings.profileName,
        profile_avatar: newSettings.profileAvatar,
        app_version: newSettings.appVersion,
        initial_balance: newSettings.initialBalance,
        show_warnings: newSettings.showWarnings ? 1 : 0,
        hidden_columns: newSettings.hiddenColumns,
        settings_password: newSettings.settingsPassword,
        receipt_layout: newSettings.receiptLayout,
        receipt_logo: newSettings.receiptLogo,
        company_cnpj: newSettings.receiptCnpj,
        company_address: newSettings.receiptAddress,
        pix_key: newSettings.receiptPixKey,
        pix_qr_code: newSettings.receiptQrCode,
        whatsapp_billing_template: newSettings.whatsappBillingTemplate,
        whatsapp_os_template: newSettings.whatsappOSTemplate,
        sendpulse_client_id: newSettings.sendPulseClientId,
        sendpulse_client_secret: newSettings.sendPulseClientSecret,
        sendpulse_template_id: newSettings.sendPulseTemplateId
      };

      const { error } = await supabase
        .from('settings')
        .update(mapped)
        .eq('id', 1);
      
      if (error) throw error;
      
      setSettings(newSettings);
      return true;
    } catch (err) {
      console.error("Failed to update settings", err);
      showToast("Erro ao atualizar configurações.", "error");
      return false;
    }
  }, [showToast]);

  return { settings, setSettings, fetchSettings, updateSettings };
};
