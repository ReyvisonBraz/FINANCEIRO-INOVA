import { useCallback } from 'react';
import { ClientPayment, Customer, AppSettings } from '../types';
import { getA4ReceiptTemplate, getThermalReceiptTemplate } from '../lib/receiptTemplates';
import { formatCurrency } from '../lib/utils';

export function useReceipt(settings: AppSettings, customers: Customer[]) {
  const generateReceipt = useCallback(async (payment: ClientPayment, layoutOverride?: 'simple' | 'a4') => {
    const customer = customers.find(c => c.id === payment.customerId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const layout = layoutOverride || settings.receiptLayout;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Recibo #${payment.id} - ${customer?.firstName} - ${formatCurrency(payment.totalAmount)}`)}`;

    const content = layout === 'a4' 
      ? getA4ReceiptTemplate(settings, payment, customer, qrCodeUrl)
      : getThermalReceiptTemplate(settings, payment, customer, qrCodeUrl);

    printWindow.document.write(content);
    printWindow.document.close();
  }, [settings, customers]);

  return { generateReceipt };
}
