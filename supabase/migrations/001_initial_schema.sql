-- Financeiro Inova - Schema de Migração
-- Execute este arquivo no SQL Editor do Supabase

-- =====================================================
-- 1. USERS (já existe no Supabase Auth, mas precisamos de uma tabela de perfil)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('owner', 'admin', 'employee')),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  app_name TEXT DEFAULT 'Financeiro Inova',
  app_version TEXT DEFAULT 'Versão 1.0',
  fiscal_year TEXT DEFAULT '2024',
  primary_color TEXT DEFAULT '#1152d4',
  categories TEXT DEFAULT 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
  income_categories TEXT DEFAULT 'Salário,Vendas,Serviços,Investimentos,Outros',
  expense_categories TEXT DEFAULT 'Alimentação,Trabalho,Utilidades,Viagem,Lazer,Outros',
  profile_name TEXT DEFAULT 'Minha Empresa',
  profile_avatar TEXT DEFAULT 'https://picsum.photos/seed/default/100/100',
  initial_balance REAL DEFAULT 0,
  show_warnings INTEGER DEFAULT 1,
  hidden_columns JSONB DEFAULT '[]',
  settings_password TEXT DEFAULT '1234',
  receipt_layout TEXT DEFAULT 'a4',
  receipt_logo TEXT,
  company_cnpj TEXT,
  company_address TEXT,
  pix_key TEXT,
  pix_qr_code TEXT,
  whatsapp_billing_template TEXT DEFAULT 'Olá {nome_cliente}, gostaríamos de lembrar sobre o débito pendente de {valor_divida}. Podemos ajudar com algo?',
  whatsapp_os_template TEXT DEFAULT 'Olá {nome_cliente}, sua Ordem de Serviço #{os_id} ({equipamento}) está com o status: {status}.',
  sendpulse_client_id TEXT,
  sendpulse_client_secret TEXT,
  sendpulse_template_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. CUSTOMERS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nickname TEXT,
  cpf TEXT,
  company_name TEXT,
  phone TEXT NOT NULL,
  observation TEXT,
  credit_limit REAL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. TRANSACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'Concluído',
  payment_id INTEGER,
  sale_id TEXT,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. CLIENT_PAYMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.client_payments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  total_amount REAL NOT NULL,
  paid_amount REAL DEFAULT 0,
  purchase_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
  installments_count INTEGER DEFAULT 1,
  type TEXT DEFAULT 'income',
  sale_id TEXT,
  payment_history JSONB DEFAULT '[]',
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. RECEIPTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.receipts (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER NOT NULL REFERENCES public.client_payments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. AUDIT_LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id INTEGER,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. INVENTORY_ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('product', 'service')),
  sku TEXT,
  cost_price REAL DEFAULT 0,
  sale_price REAL DEFAULT 0,
  unit_price REAL NOT NULL,
  quantity INTEGER DEFAULT 0,
  stock_level INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 5,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. SERVICE_ORDER_STATUSES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.service_order_statuses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_default INTEGER DEFAULT 0
);

-- =====================================================
-- 11. EQUIPMENT_TYPES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.equipment_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT
);

-- =====================================================
-- 12. BRANDS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  equipment_type TEXT
);

-- =====================================================
-- 13. MODELS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.models (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE(brand_id, name)
);

-- =====================================================
-- 14. SERVICE_ORDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.service_orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  equipment_brand TEXT,
  equipment_model TEXT,
  equipment_type TEXT,
  equipment_color TEXT,
  equipment_serial TEXT,
  reported_problem TEXT NOT NULL,
  arrival_photo_url TEXT,
  arrival_photo_base64 TEXT,
  status TEXT DEFAULT 'Aguardando Análise',
  technical_analysis TEXT,
  services_performed TEXT,
  services JSONB DEFAULT '[]',
  parts_used JSONB DEFAULT '[]',
  service_fee REAL DEFAULT 0,
  total_amount REAL DEFAULT 0,
  final_observations TEXT,
  entry_date TEXT,
  analysis_prediction TEXT,
  customer_password TEXT,
  accessories TEXT,
  ram_info TEXT,
  ssd_info TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 15. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_client_payments_customer ON public.client_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_client_payments_due_date ON public.client_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_client_payments_status ON public.client_payments(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_customer ON public.service_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON public.service_orders(status);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- =====================================================
-- 16. ATUALIZAR updated_at AUTOMATICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger às tabelas com updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_client_payments_updated_at ON public.client_payments;
CREATE TRIGGER update_client_payments_updated_at BEFORE UPDATE ON public.client_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON public.inventory_items;
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_service_orders_updated_at ON public.service_orders;
CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- 17. INSERIR DADOS PADRÃO
-- =====================================================

-- Settings (apenas 1 linha)
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Categorias de entrada
INSERT INTO public.categories (name, type) VALUES
  ('Salário', 'income'),
  ('Vendas', 'income'),
  ('Serviços', 'income'),
  ('Investimentos', 'income'),
  ('Outros', 'income')
ON CONFLICT DO NOTHING;

-- Categorias de despesa
INSERT INTO public.categories (name, type) VALUES
  ('Alimentação', 'expense'),
  ('Trabalho', 'expense'),
  ('Utilidades', 'expense'),
  ('Viagem', 'expense'),
  ('Lazer', 'expense'),
  ('Outros', 'expense')
ON CONFLICT DO NOTHING;

-- Status de OS
INSERT INTO public.service_order_statuses (name, color, priority, is_default) VALUES
  ('Aguardando Análise', '#f59e0b', 1, 1),
  ('Em Manutenção', '#3b82f6', 2, 1),
  ('Urgente', '#f43f5e', 3, 1),
  ('Aguardando Peças', '#f97316', 4, 1),
  ('Pronto para Retirada', '#10b981', 5, 1),
  ('Concluído', '#64748b', 6, 1),
  ('Sem Conserto', '#ef4444', 7, 1)
ON CONFLICT DO NOTHING;

-- Tipos de equipamento
INSERT INTO public.equipment_types (name) VALUES
  ('Notebook'),
  ('Desktop'),
  ('Smartphone'),
  ('Tablet'),
  ('Monitor'),
  ('Impressora'),
  ('Console')
ON CONFLICT (name) DO NOTHING;

-- Marcas
INSERT INTO public.brands (name) VALUES
  ('Dell'),
  ('HP'),
  ('Lenovo'),
  ('Samsung'),
  ('Apple'),
  ('Asus'),
  ('Acer'),
  ('Motorola'),
  ('LG')
ON CONFLICT (name) DO NOTHING;

PRINT 'Schema criado com sucesso!';
