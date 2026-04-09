-- Financeiro Inova - Triggers para Audit Logs
-- Execute este arquivo após o schema e RLS

-- =====================================================
-- FUNÇÃO PARA LOG DE AUDITORIA
-- =====================================================
CREATE OR REPLACE FUNCTION public.log_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, details)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    json_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'record_id', COALESCE(NEW.id, OLD.id)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS PARA CADA TABELA
-- =====================================================

-- Transactions
DROP TRIGGER IF EXISTS audit_transactions ON public.transactions;
CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.log_action();

-- Customers
DROP TRIGGER IF EXISTS audit_customers ON public.customers;
CREATE TRIGGER audit_customers
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.log_action();

-- Client Payments
DROP TRIGGER IF EXISTS audit_client_payments ON public.client_payments;
CREATE TRIGGER audit_client_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.client_payments
  FOR EACH ROW EXECUTE FUNCTION public.log_action();

-- Inventory Items
DROP TRIGGER IF EXISTS audit_inventory_items ON public.inventory_items;
CREATE TRIGGER audit_inventory_items
  AFTER INSERT OR UPDATE OR DELETE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.log_action();

-- Service Orders
DROP TRIGGER IF EXISTS audit_service_orders ON public.service_orders;
CREATE TRIGGER audit_service_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.log_action();

-- =====================================================
-- FUNÇÃO PARA CRIAR PROFILE AUTOMATICAMENTE
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, permissions)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'employee',
    ARRAY['view_dashboard']
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile quando usuário é criado no Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FUNÇÃO PARA AUTO-COMPLETAR STOCK_LEVEL NO INVENTORY
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Se stock_level não foi especificado, usar quantity
    IF NEW.stock_level IS NULL AND NEW.quantity IS NOT NULL THEN
      NEW.stock_level = NEW.quantity;
    END IF;
    -- Se unit_price não foi especificado, usar sale_price
    IF NEW.unit_price IS NULL AND NEW.sale_price IS NOT NULL THEN
      NEW.unit_price = NEW.sale_price;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_inventory_defaults ON public.inventory_items;
CREATE TRIGGER set_inventory_defaults
  BEFORE INSERT OR UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_inventory_stock();

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR PAID_AMOUNT QUANDO TRANSAÇÃO É VINCULADA
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_payment_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.payment_id IS NOT NULL THEN
    -- Atualizar paid_amount no client_payment
    UPDATE public.client_payments
    SET paid_amount = paid_amount + NEW.amount,
        status = CASE
          WHEN paid_amount + NEW.amount >= total_amount THEN 'paid'
          ELSE 'partial'
        END
    WHERE id = NEW.payment_id;
  ELSIF TG_OP = 'DELETE' AND OLD.payment_id IS NOT NULL THEN
    -- Diminuir paid_amount quando transação é deletada
    UPDATE public.client_payments
    SET paid_amount = GREATEST(0, paid_amount - OLD.amount),
        status = CASE
          WHEN paid_amount - OLD.amount <= 0 THEN 'pending'
          WHEN paid_amount - OLD.amount < total_amount THEN 'partial'
          ELSE status
        END
    WHERE id = OLD.payment_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payment_on_transaction ON public.transactions;
CREATE TRIGGER update_payment_on_transaction
  AFTER INSERT OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_payment_on_transaction();

-- =====================================================
-- FUNÇÃO PARA VALIDAR CPF
-- =====================================================
CREATE OR REPLACE FUNCTION public.validate_cpf()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cpf IS NOT NULL AND NEW.cpf != '' THEN
    -- Remove non-digits
    NEW.cpf = regexp_replace(NEW.cpf, '[^0-9]', '', 'g');
    
    -- Check length
    IF length(NEW.cpf) != 11 THEN
      RAISE EXCEPTION 'CPF deve ter 11 dígitos';
    END IF;
    
    -- Check all same digits
    IF NEW.cpf = repeat(substring(NEW.cpf, 1, 1), 11) THEN
      RAISE EXCEPTION 'CPF inválido';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_customer_cpf ON public.customers;
CREATE TRIGGER validate_customer_cpf
  BEFORE INSERT OR UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.validate_cpf();

PRINT 'Triggers configurados com sucesso!';
