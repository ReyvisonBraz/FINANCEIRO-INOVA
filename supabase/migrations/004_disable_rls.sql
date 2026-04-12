-- URGENT: Disable RLS temporarily for Financeiro Inova
-- The app uses custom authentication (username/password in profiles table)
-- NOT Supabase Auth, so auth.role() always returns NULL

-- Disable RLS on all tables (temporarily - for debugging)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_statuses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.models DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (they won't work without Supabase Auth)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Only admin can view settings" ON public.settings;
DROP POLICY IF EXISTS "Only owner can update settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Only admin can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Only admin can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;
DROP POLICY IF EXISTS "Only admin can delete customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Only admin can delete transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can view client_payments" ON public.client_payments;
DROP POLICY IF EXISTS "Authenticated users can insert client_payments" ON public.client_payments;
DROP POLICY IF EXISTS "Authenticated users can update client_payments" ON public.client_payments;
DROP POLICY IF EXISTS "Only admin can delete client_payments" ON public.client_payments;
DROP POLICY IF EXISTS "Authenticated users can view receipts" ON public.receipts;
DROP POLICY IF EXISTS "Authenticated users can insert receipts" ON public.receipts;
DROP POLICY IF EXISTS "Only admin can view audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can insert inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can update inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Only admin can delete inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can view service_order_statuses" ON public.service_order_statuses;
DROP POLICY IF EXISTS "Only admin can manage service_order_statuses" ON public.service_order_statuses;
DROP POLICY IF EXISTS "Authenticated users can view equipment_types" ON public.equipment_types;
DROP POLICY IF EXISTS "Only admin can manage equipment_types" ON public.equipment_types;
DROP POLICY IF EXISTS "Authenticated users can view brands" ON public.brands;
DROP POLICY IF EXISTS "Only admin can manage brands" ON public.brands;
DROP POLICY IF EXISTS "Authenticated users can view models" ON public.models;
DROP POLICY IF EXISTS "Only admin can manage models" ON public.models;
DROP POLICY IF EXISTS "Authenticated users can view service_orders" ON public.service_orders;
DROP POLICY IF EXISTS "Authenticated users can insert service_orders" ON public.service_orders;
DROP POLICY IF EXISTS "Authenticated users can update service_orders" ON public.service_orders;
DROP POLICY IF EXISTS "Only admin can delete service_orders" ON public.service_orders;

PRINT 'RLS disabled - app uses custom authentication, not Supabase Auth';
