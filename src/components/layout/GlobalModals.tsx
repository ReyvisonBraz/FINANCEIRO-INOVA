import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '../../store/useModalStore';
import { useAppStore } from '../../store/useAppStore';
import { useFormStore } from '../../store/useFormStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToast } from '../ui/Toast';
import { formatCurrency } from '../../lib/utils';

// Modals
import { CustomerModal } from '../customers/modals/CustomerModal';
import { CustomerWarningModal } from '../customers/modals/CustomerWarningModal';
import { CustomerSuccessModal } from '../customers/modals/CustomerSuccessModal';
import { CustomerDeleteWarningModal } from '../customers/modals/CustomerDeleteWarningModal';
import { PasswordModal } from '../ui/modals/PasswordModal';
import { WarningModal } from '../ui/modals/WarningModal';
import { AddTransactionModal } from '../transactions/modals/AddTransactionModal';
import { DeleteConfirmationModal } from '../ui/modals/DeleteConfirmationModal';
import { CustomerHistoryModal } from '../customers/modals/CustomerHistoryModal';
import { ConfirmModal } from '../ui/modals/ConfirmModal';
import { DirectOsSearchModal } from '../service-orders/modals/DirectOsSearchModal';

interface GlobalModalsProps {
  // Handlers that need logic from App.tsx or specific hooks
  handleAddCustomer: (force?: boolean) => Promise<void>;
  confirmDeleteCustomerWithPayments: () => Promise<void>;
  handleUnlockSettings: () => void;
  handleAddTransaction: (e?: React.FormEvent, force?: boolean) => Promise<void>;
  handleDeleteTransaction: (tx: any) => Promise<void>;
  confirmDeleteClientPayment: () => Promise<void>;
  categories: any[];
  clientPayments: any[];
  serviceOrders: any[];
}

export const GlobalModals: React.FC<GlobalModalsProps> = ({
  handleAddCustomer,
  confirmDeleteCustomerWithPayments,
  handleUnlockSettings,
  handleAddTransaction,
  handleDeleteTransaction,
  confirmDeleteClientPayment,
  categories,
  clientPayments,
  serviceOrders
}) => {
  const navigate = useNavigate();
  const { settings, saveSettingsAPI: updateSettings } = useSettingsStore();
  const { showToast } = useToast();
  
  const {
    activeScreen,
    isAdding, setIsAdding,
    isAddingCustomer, setIsAddingCustomer,
    isSaving,
    customerRegistrationSource,
    isSearchingOS, setIsSearchingOS,
    setDirectOsId, setDirectMode
  } = useAppStore();

  const {
    confirmModal, closeConfirm,
    showPasswordModal, setShowPasswordModal,
    passwordInput, setPasswordInput,
    showWarningModal, setShowWarningModal,
    warningType,
    showCustomerWarningModal, setShowCustomerWarningModal,
    customerWarningType,
    showCustomerSuccessModal, setShowCustomerSuccessModal,
    lastAddedCustomerId,
    editingTransaction, setEditingTransaction,
    transactionToDelete, setTransactionToDelete,
    editingCustomer, setEditingCustomer,
    customerToDelete, setCustomerToDelete,
    customerPaymentsWarning,
    clientPaymentToDelete, setClientPaymentToDelete,
    showHistoryModal, setShowHistoryModal,
    historyCustomer
  } = useModalStore();

  const {
    newCustomer, setNewCustomer,
    newTx, setNewTx
  } = useFormStore();

  return (
    <>
      {/* Global Customer Modals */}
      <CustomerModal 
        isOpen={isAddingCustomer}
        onClose={() => {
          setIsAddingCustomer(false);
          setEditingCustomer(null);
        }}
        editingCustomer={editingCustomer}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        onSave={handleAddCustomer}
        isSaving={isSaving}
      />

      <CustomerWarningModal 
        isOpen={showCustomerWarningModal}
        onClose={() => setShowCustomerWarningModal(false)}
        type={customerWarningType}
        onConfirm={() => handleAddCustomer(true)}
      />

      <CustomerSuccessModal
        isOpen={showCustomerSuccessModal}
        onClose={() => setShowCustomerSuccessModal(false)}
        customerId={lastAddedCustomerId}
        source={customerRegistrationSource}
      />

      <CustomerDeleteWarningModal 
        customer={customerToDelete}
        paymentsWarning={customerPaymentsWarning}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={confirmDeleteCustomerWithPayments}
        onGoToPayments={() => {
          setCustomerToDelete(null);
          navigate('/vendas');
        }}
        formatCurrency={formatCurrency}
      />

      <PasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
        onUnlock={handleUnlockSettings}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
      />

      <WarningModal 
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        type={warningType}
        onConfirm={() => handleAddTransaction(undefined, true)}
        showWarnings={settings.showWarnings}
        setShowWarnings={(val: boolean) => updateSettings({ ...settings, showWarnings: val })}
      />

      <AddTransactionModal 
        isOpen={isAdding}
        onClose={() => {
          setIsAdding(false);
          setEditingTransaction(null);
          setNewTx({
            description: '',
            category: '',
            type: 'expense',
            amount: '',
            date: format(new Date(), 'yyyy-MM-dd')
          });
        }}
        editingTransaction={editingTransaction}
        newTx={newTx}
        setNewTx={setNewTx}
        categories={categories}
        onSubmit={handleAddTransaction}
        isSaving={isSaving}
      />

      <DeleteConfirmationModal 
        isOpen={transactionToDelete !== null}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={() => {
          if (transactionToDelete !== null) {
            handleDeleteTransaction(transactionToDelete);
            setTransactionToDelete(null);
          }
        }}
      />

      <DeleteConfirmationModal 
        isOpen={clientPaymentToDelete !== null}
        onClose={() => setClientPaymentToDelete(null)}
        onConfirm={confirmDeleteClientPayment}
        title="Excluir Venda/Pagamento"
        message="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita e afetará o saldo do cliente."
      />

      <CustomerHistoryModal 
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        customer={historyCustomer}
        clientPayments={clientPayments}
        serviceOrders={serviceOrders}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      <DirectOsSearchModal 
        show={isSearchingOS}
        onClose={() => setIsSearchingOS(false)}
        orders={serviceOrders}
        handleEdit={(order) => {
          setDirectOsId(order.id);
          setDirectMode('edit');
          navigate('/ordens');
        }}
      />
    </>
  );
};
