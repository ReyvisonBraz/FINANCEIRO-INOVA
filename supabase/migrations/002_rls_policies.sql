-- Financeiro Inova - Row Level Security (RLS)
-- Execute este arquivo após o schema

-- =====================================================
-- ATIVAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA PROFILES
-- =====================================================

-- Usuários podem ver todos os profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Usuários podem atualizar apenas seu próprio profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- POLÍTICAS PARA SETTINGS
-- =====================================================

-- Apenas owner/admin podem ver settings
CREATE POLICY "Only admin can view settings"
  ON public.settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Apenas owner pode atualizar settings
CREATE POLICY "Only owner can update settings"
  ON public.settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'owner'
    )
  );

-- =====================================================
-- POLÍTICAS PARA CATEGORIES
-- =====================================================

-- Todos os usuários autenticados podem ver categorias
CREATE POLICY "Authenticated users can view categories"
  ON public.categories FOR SELECT
  USING (auth.role() = 'authenticated');

-- Apenas admin/owner pode criar categorias
CREATE POLICY "Only admin can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Apenas admin/owner pode deletar categorias
CREATE POLICY "Only admin can delete categories"
  ON public.categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- POLÍTICAS PARA CUSTOMERS
-- =====================================================

-- Todos os usuários autenticados podem ver clientes
CREATE POLICY "Authenticated users can view customers"
  ON public.customers FOR SELECT
  USING (auth.role() = 'authenticated');

-- Todos os usuários autenticados podem criar clientes
CREATE POLICY "Authenticated users can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Todos os usuários autenticados podem atualizar clientes
CREATE POLICY "Authenticated users can update customers"
  ON public.customers FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Apenas admin/owner pode deletar clientes
CREATE POLICY "Only admin can delete customers"
  ON public.customers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- POLÍTICAS PARA TRANSACTIONS
-- =====================================================

-- Todos os usuários autenticados podem ver transações
CREATE POLICY "Authenticated users can view transactions"
  ON public.transactions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Todos os usuários autenticados podem criar transações
CREATE POLICY "Authenticated users can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Todos os usuários autenticados podem atualizar transações
CREATE POLICY "Authenticated users can update transactions"
  ON public.transactions FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Apenas admin/owner pode deletar transações
CREATE POLICY "Only admin can delete transactions"
  ON public.transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- POLÍTICAS PARA CLIENT_PAYMENTS
-- =====================================================

-- Todos os usuários autenticados podem ver pagamentos
CREATE POLICY "Authenticated users can view client_payments"
  ON public.client_payments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Todos os usuários autenticados podem criar pagamentos
CREATE POLICY "Authenticated users can insert client_payments"
  ON public.client_payments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Todos os usuários autenticados podem atualizar pagamentos
CREATE POLICY "Authenticated users can update client_payments"
  ON public.client_payments FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Apenas admin/owner pode deletar pagamentos
CREATE POLICY "Only admin can delete client_payments"
  ON public.client_payments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- POLÍTICAS PARA RECEIPTS
-- =====================================================

CREATE POLICY "Authenticated users can view receipts"
  ON public.receipts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- POLÍTICAS PARA AUDIT_LOGS
-- =====================================================

-- Apenas admin/owner pode ver logs
CREATE POLICY "Only admin can view audit_logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Logs são inseridos automaticamente pelo sistema (sem user insert)

-- =====================================================
-- POLÍTICAS PARA INVENTORY_ITEMS
-- =====================================================

CREATE POLICY "Authenticated users can view inventory"
  ON public.inventory_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert inventory"
  ON public.inventory_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update inventory"
  ON public.inventory_items FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can delete inventory"
  ON public.inventory_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- POLÍTICAS PARA SERVICE_ORDER_STATUSES
-- =====================================================

CREATE POLICY "Authenticated users can view service_order_statuses"
  ON public.service_order_statuses FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can manage service_order_statuses"
  ON public.service_order_statuses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- POLÍTICAS PARA EQUIPMENT_TYPES
-- =====================================================

CREATE POLICY "Authenticated users can view equipment_types"
  ON public.equipment_types FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can manage equipment_types"
  ON public.equipment_types FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- POLÍTICAS PARA BRANDS
-- =====================================================

CREATE POLICY "Authenticated users can view brands"
  ON public.brands FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can manage brands"
  ON public.brands FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- POLÍTICAS PARA MODELS
-- =====================================================

CREATE POLICY "Authenticated users can view models"
  ON public.models FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can manage models"
  ON public.models FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- POLÍTICAS PARA SERVICE_ORDERS
-- =====================================================

CREATE POLICY "Authenticated users can view service_orders"
  ON public.service_orders FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert service_orders"
  ON public.service_orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update service_orders"
  ON public.service_orders FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can delete service_orders"
  ON public.service_orders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

PRINT 'RLS configurado com sucesso!';
