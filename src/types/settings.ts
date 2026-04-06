export type CategoryType = 'income' | 'expense';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  limit?: number;
}

export interface AppSettings {
  appName: string;
  fiscalYear: string;
  primaryColor: string;
  categories: string;
  incomeCategories: string;
  expenseCategories: string;
  profileName: string;
  profileAvatar: string;
  appVersion: string;
  initialBalance: number;
  showWarnings: boolean;
  currency: string;
  hiddenColumns: string[];
  settingsPassword?: string;
  receiptLayout: 'simple' | 'a4';
  receiptLogo?: string;
  receiptCnpj?: string;
  receiptAddress?: string;
  receiptPixKey?: string;
  receiptQrCode?: string;
  receiptTerms?: string;
  whatsappBillingTemplate?: string;
  whatsappOSTemplate?: string;
  sendPulseClientId?: string;
  sendPulseClientSecret?: string;
  sendPulseTemplateId?: string;
}
