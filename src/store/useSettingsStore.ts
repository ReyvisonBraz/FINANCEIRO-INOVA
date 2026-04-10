import { create } from 'zustand';
import { AppSettings, Category } from '../types';
import { supabase } from '../lib/supabase';

interface SettingsState {
  settings: AppSettings;
  setSettings: (newSettings: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  fetchSettings: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  saveSettingsAPI: (newSettings: Partial<AppSettings>) => Promise<void>;
}

const defaultSettings: AppSettings = {
  appName: 'Financeiro Pro',
  fiscalYear: '2024',
  primaryColor: '#1152d4',
  categories: 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
  incomeCategories: 'Salário,Vendas,Serviços,Investimentos,Outros',
  expenseCategories: 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
  profileName: 'Inova Informática',
  profileAvatar: 'https://picsum.photos/seed/inova/100/100',
  appVersion: 'Versão 1.0',
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
  receiptQrCode: '',
  receiptTerms: '',
  whatsappBillingTemplate: '',
  whatsappOSTemplate: '',
  sendPulseClientId: '',
  sendPulseClientSecret: '',
  sendPulseTemplateId: ''
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  setSettings: (newSettings) => set((state) => ({
    settings: typeof newSettings === 'function' 
      ? newSettings(state.settings) 
      : { ...state.settings, ...newSettings }
  })),
  categories: [],
  setCategories: (categories) => set({ categories }),
  fetchSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        const mapped: AppSettings = {
          appName: data.app_name || data.appName || defaultSettings.appName,
          fiscalYear: data.fiscal_year || data.fiscalYear || defaultSettings.fiscalYear,
          primaryColor: data.primary_color || data.primaryColor || defaultSettings.primaryColor,
          categories: data.categories || defaultSettings.categories,
          incomeCategories: data.income_categories || data.incomeCategories || defaultSettings.incomeCategories,
          expenseCategories: data.expense_categories || data.expenseCategories || defaultSettings.expenseCategories,
          profileName: data.profile_name || data.profileName || defaultSettings.profileName,
          profileAvatar: data.profile_avatar || data.profileAvatar || defaultSettings.profileAvatar,
          appVersion: data.app_version || data.appVersion || defaultSettings.appVersion,
          initialBalance: data.initial_balance ?? data.initialBalance ?? defaultSettings.initialBalance,
          showWarnings: data.show_warnings ?? data.showWarnings ?? defaultSettings.showWarnings,
          currency: data.currency || defaultSettings.currency,
          hiddenColumns: typeof data.hidden_columns === 'string' ? JSON.parse(data.hidden_columns) : (data.hiddenColumns || defaultSettings.hiddenColumns),
          settingsPassword: data.settings_password || data.settingsPassword || defaultSettings.settingsPassword,
          receiptLayout: data.receipt_layout || data.receiptLayout || defaultSettings.receiptLayout,
          receiptLogo: data.receipt_logo || data.receiptLogo || defaultSettings.receiptLogo,
          receiptCnpj: data.company_cnpj || data.receiptCnpj || defaultSettings.receiptCnpj,
          receiptAddress: data.company_address || data.receiptAddress || defaultSettings.receiptAddress,
          receiptPixKey: data.pix_key || data.receiptPixKey || defaultSettings.receiptPixKey,
          receiptQrCode: data.pix_qr_code || data.receiptQrCode || defaultSettings.receiptQrCode,
          receiptTerms: data.receipt_terms || data.receiptTerms || defaultSettings.receiptTerms,
          whatsappBillingTemplate: data.whatsapp_billing_template || data.whatsappBillingTemplate || defaultSettings.whatsappBillingTemplate,
          whatsappOSTemplate: data.whatsapp_os_template || data.whatsappOSTemplate || defaultSettings.whatsappOSTemplate,
          sendPulseClientId: data.sendpulse_client_id || data.sendPulseClientId || defaultSettings.sendPulseClientId,
          sendPulseClientSecret: data.sendpulse_client_secret || data.sendPulseClientSecret || defaultSettings.sendPulseClientSecret,
          sendPulseTemplateId: data.sendpulse_template_id || data.sendPulseTemplateId || defaultSettings.sendPulseTemplateId
        };
        set({ settings: mapped });
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  },
  fetchCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      const mapped: Category[] = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        type: c.type
      }));
      
      set({ categories: mapped });
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  },
  saveSettingsAPI: async (newSettings) => {
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
      hidden_columns: JSON.stringify(newSettings.hiddenColumns || []),
      settings_password: newSettings.settingsPassword,
      receipt_layout: newSettings.receiptLayout,
      receipt_logo: newSettings.receiptLogo,
      company_cnpj: newSettings.receiptCnpj,
      company_address: newSettings.receiptAddress,
      pix_key: newSettings.receiptPixKey,
      pix_qr_code: newSettings.receiptQrCode,
      receipt_terms: newSettings.receiptTerms,
      whatsapp_billing_template: newSettings.whatsappBillingTemplate,
      whatsapp_os_template: newSettings.whatsappOSTemplate,
      sendpulse_client_id: newSettings.sendPulseClientId,
      sendpulse_client_secret: newSettings.sendPulseClientSecret,
      sendpulse_template_id: newSettings.sendPulseTemplateId
    };
    
    try {
      const { error } = await supabase
        .from('settings')
        .update(mapped)
        .eq('id', 1);
      
      if (error) throw error;
      
      set((state) => ({
        settings: { ...state.settings, ...newSettings }
      }));
    } catch (err) {
      console.error("Failed to save settings", err);
      throw err;
    }
  },
}));
