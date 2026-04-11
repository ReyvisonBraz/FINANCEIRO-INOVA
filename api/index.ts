import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function badRequest(error: string | { message: string }) {
  const message = typeof error === 'string' ? error : error.message;
  return json({ error: message }, 400);
}

function notFound(message = 'Not found') {
  return json({ error: message }, 404);
}

async function handleGET(path: string) {
  switch (path) {
    case 'transactions': {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (error) return badRequest(error);
      return json({ data: data || [], meta: { total: data?.length || 0 } });
    }

    case 'stats': {
      const { data: incomeData } = await supabase.from('transactions').select('amount').eq('type', 'income');
      const { data: expenseData } = await supabase.from('transactions').select('amount').eq('type', 'expense');
      const { data: pendingData } = await supabase.from('client_payments').select('id').neq('status', 'paid');
      const { data: osData } = await supabase.from('service_orders').select('id').not.eq('status', 'Concluído');

      const totalIncome = incomeData?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;
      const totalExpenses = expenseData?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

      return json({
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        pendingPayments: pendingData?.length || 0,
        activeOS: osData?.length || 0,
        chartData: [],
        sortedIncomeRanking: [],
        sortedExpenseRanking: []
      });
    }

    case 'settings': {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (error) return badRequest(error);
      return json(data);
    }

    case 'customers': {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('first_name', { ascending: true });
      if (error) return badRequest(error);
      return json({ data: data || [], meta: { total: data?.length || 0 } });
    }

    case 'client-payments': {
      const { data, error } = await supabase
        .from('client_payments')
        .select('*, customers(first_name, last_name)')
        .order('due_date', { ascending: true });
      if (error) return badRequest(error);
      return json({ data: data || [], meta: { total: data?.length || 0 } });
    }

    case 'categories': {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) return badRequest(error);
      return json(data || []);
    }

    case 'inventory': {
      const { data, error } = await supabase.from('inventory_items').select('*').order('name');
      if (error) return badRequest(error);
      return json(data || []);
    }

    case 'service-orders': {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*, customers(first_name, last_name, phone)')
        .order('created_at', { ascending: false });
      if (error) return badRequest(error);
      return json({ data: data || [], meta: { total: data?.length || 0 } });
    }

    case 'users': {
      const { data, error } = await supabase.from('profiles').select('*').order('name');
      if (error) return badRequest(error);
      return json(data || []);
    }

    case 'audit-logs': {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, profiles(name)')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (error) return badRequest(error);
      return json(data || []);
    }

    case 'notifications': {
      const today = new Date().toISOString().split('T')[0];
      const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [overduePayments, dueTodayPayments, upcomingPayments, overdueOrders, dueTodayOrders, upcomingOrders] = await Promise.all([
        supabase.from('client_payments').select('*').neq('status', 'paid').lt('due_date', today),
        supabase.from('client_payments').select('*').neq('status', 'paid').eq('due_date', today),
        supabase.from('client_payments').select('*').neq('status', 'paid').gt('due_date', today).lte('due_date', threeDaysLater),
        supabase.from('service_orders').select('*').not.eq('status', 'Concluído').lt('analysis_prediction', today).is('analysis_prediction', null),
        supabase.from('service_orders').select('*').not.eq('status', 'Concluído').eq('analysis_prediction', today),
        supabase.from('service_orders').select('*').not.eq('status', 'Concluído').gt('analysis_prediction', today).lte('analysis_prediction', threeDaysLater)
      ]);

      return json({
        payments: {
          overdue: overduePayments.data || [],
          dueToday: dueTodayPayments.data || [],
          upcoming: upcomingPayments.data || []
        },
        serviceOrders: {
          overdue: overdueOrders.data || [],
          dueToday: dueTodayOrders.data || [],
          upcoming: upcomingOrders.data || []
        }
      });
    }

    case 'service-order-statuses': {
      const { data, error } = await supabase.from('service_order_statuses').select('*').order('priority');
      if (error) return badRequest(error);
      return json(data || []);
    }

    case 'brands': {
      const { data, error } = await supabase.from('brands').select('*').order('name');
      if (error) return badRequest(error);
      return json(data || []);
    }

    case 'equipment-types': {
      const { data, error } = await supabase.from('equipment_types').select('*').order('name');
      if (error) return badRequest(error);
      return json(data || []);
    }

    case 'models': {
      const { data, error } = await supabase.from('models').select('*').order('name');
      if (error) return badRequest(error);
      return json(data || []);
    }

    default:
      return notFound('Route not found');
  }
}

async function handlePOST(path: string, body: any) {
  switch (path) {
    case 'transactions': {
      const { description, category, type, amount, date } = body;
      if (!description || !category || !type || !amount || !date) {
        return badRequest('Missing required fields');
      }
      const { data, error } = await supabase
        .from('transactions')
        .insert({ description, category, type, amount: parseFloat(amount), date, status: 'Concluído' })
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ id: data.id });
    }

    case 'customers': {
      const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit } = body;
      if (!firstName || !lastName || !phone) {
        return badRequest('Missing required fields');
      }
      const { data, error } = await supabase
        .from('customers')
        .insert({
          first_name: firstName,
          last_name: lastName,
          nickname: nickname || null,
          cpf: cpf || null,
          company_name: companyName || null,
          phone,
          observation: observation || null,
          credit_limit: creditLimit || 0
        })
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ id: data.id });
    }

    case 'client-payments': {
      const { customerId, description, totalAmount, paidAmount, purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, saleId, paymentHistory } = body;
      if (!customerId || !description || !totalAmount || !purchaseDate || !dueDate || !paymentMethod) {
        return badRequest('Missing required fields');
      }
      const { data, error } = await supabase
        .from('client_payments')
        .insert({
          customer_id: customerId,
          description,
          total_amount: parseFloat(totalAmount),
          paid_amount: paidAmount ? parseFloat(paidAmount) : 0,
          purchase_date: purchaseDate,
          due_date: dueDate,
          payment_method: paymentMethod,
          status: status || 'pending',
          installments_count: installmentsCount || 1,
          type: type || 'income',
          sale_id: saleId || null,
          payment_history: paymentHistory ? JSON.stringify(paymentHistory) : '[]'
        })
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ id: data.id });
    }

    case 'client-payments/pay': {
      const paymentId = body.paymentId || body.id;
      const { amount, date } = body;
      if (!paymentId || !amount) {
        return badRequest('Missing required fields');
      }

      const { data: payment, error: fetchError } = await supabase
        .from('client_payments')
        .select('*')
        .eq('id', paymentId)
        .single();
      if (fetchError) return badRequest(fetchError);

      const newPaidAmount = (payment.paid_amount || 0) + parseFloat(amount);
      const newStatus = newPaidAmount >= payment.total_amount ? 'paid' : 'partial';

      let history = [];
      try {
        history = JSON.parse(payment.payment_history || '[]');
      } catch (e) {}
      history.push({ amount: parseFloat(amount), date: date || new Date().toISOString() });

      const { error } = await supabase
        .from('client_payments')
        .update({
          paid_amount: newPaidAmount,
          status: newStatus,
          payment_history: JSON.stringify(history)
        })
        .eq('id', paymentId);
      if (error) return badRequest(error);

      return json({ success: true, newPaidAmount, newStatus });
    }

    case 'inventory': {
      const { name, category, sku, unitPrice, costPrice, salePrice, quantity, minQuantity } = body;
      if (!name || !category) {
        return badRequest('Missing required fields');
      }
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          name,
          category,
          sku: sku || null,
          unit_price: unitPrice ? parseFloat(unitPrice) : 0,
          cost_price: costPrice ? parseFloat(costPrice) : 0,
          sale_price: salePrice ? parseFloat(salePrice) : 0,
          quantity: quantity || 0,
          min_quantity: minQuantity || 5,
          stock_level: quantity || 0
        })
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ id: data.id });
    }

    case 'service-orders': {
      const { customerId, equipmentType, equipmentBrand, equipmentModel, equipmentColor, reportedProblem, status, priority, entryDate, services, partsUsed, serviceFee, totalAmount, technicalAnalysis } = body;
      if (!customerId || !reportedProblem) {
        return badRequest('Missing required fields');
      }
      const { data, error } = await supabase
        .from('service_orders')
        .insert({
          customer_id: customerId,
          equipment_type: equipmentType || null,
          equipment_brand: equipmentBrand || null,
          equipment_model: equipmentModel || null,
          equipment_color: equipmentColor || null,
          reported_problem: reportedProblem,
          status: status || 'Aguardando Análise',
          priority: priority || 'medium',
          entry_date: entryDate || new Date().toISOString().split('T')[0],
          services: services ? JSON.stringify(services) : '[]',
          parts_used: partsUsed ? JSON.stringify(partsUsed) : '[]',
          service_fee: serviceFee || 0,
          total_amount: totalAmount || 0,
          technical_analysis: technicalAnalysis || null
        })
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ id: data.id });
    }

    case 'categories': {
      const { name, type } = body;
      if (!name || !type) {
        return badRequest('Missing required fields');
      }
      const { data, error } = await supabase.from('categories').insert({ name, type }).select().single();
      if (error) return badRequest(error);
      return json({ id: data.id });
    }

    case 'settings': {
      const { data, error } = await supabase
        .from('settings')
        .update(body)
        .eq('id', 1)
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ success: true });
    }

    case 'audit-logs': {
      const { userId, action, entity, entityId, details } = body;
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId || null,
          action,
          entity,
          entity_id: entityId || null,
          details: details || null
        })
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ id: data.id });
    }

    case 'brands': {
      const { name, equipmentType } = body;
      if (!name) {
        return badRequest('Missing required fields');
      }
      const { data, error } = await supabase
        .from('brands')
        .insert({ name, equipment_type: equipmentType || null })
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ id: data.id });
    }

    case 'equipment-types': {
      const { name, icon } = body;
      if (!name) {
        return badRequest('Missing required fields');
      }
      const { data, error } = await supabase
        .from('equipment_types')
        .insert({ name, icon: icon || null })
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ id: data.id });
    }

    case 'models': {
      const { brandId, name } = body;
      if (!brandId || !name) {
        return badRequest('Missing required fields');
      }
      const { data, error } = await supabase
        .from('models')
        .insert({ brand_id: brandId, name })
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ id: data.id });
    }

    case 'service-order-statuses': {
      const { name, color, priority, isDefault } = body;
      if (!name || !color) {
        return badRequest('Missing required fields');
      }
      const { data, error } = await supabase
        .from('service_order_statuses')
        .insert({ name, color, priority: priority || 0, is_default: isDefault ? 1 : 0 })
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ id: data.id });
    }

    default:
      return notFound('Route not found');
  }
}

async function handlePUT(path: string, body: any) {
  const idMatch = path.match(/^(\w+)\/(\d+)$/);
  if (!idMatch) {
    if (path === 'settings') {
      const { data, error } = await supabase
        .from('settings')
        .update(body)
        .eq('id', 1)
        .select()
        .single();
      if (error) return badRequest(error);
      return json({ success: true });
    }
    return badRequest('Invalid route');
  }

  const [, resource, id] = idMatch;
  const numId = parseInt(id);

  switch (resource) {
    case 'transactions': {
      const { description, category, type, amount, date } = body;
      const { error } = await supabase
        .from('transactions')
        .update({ description, category, type, amount: parseFloat(amount), date })
        .eq('id', numId);
      if (error) return badRequest(error);
      return json({ success: true });
    }

    case 'customers': {
      const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit } = body;
      const { error } = await supabase
        .from('customers')
        .update({
          first_name: firstName,
          last_name: lastName,
          nickname: nickname || null,
          cpf: cpf || null,
          company_name: companyName || null,
          phone,
          observation: observation || null,
          credit_limit: creditLimit || 0
        })
        .eq('id', numId);
      if (error) return badRequest(error);
      return json({ success: true });
    }

    case 'client-payments': {
      const { paidAmount, status, paymentHistory } = body;
      const updateData: any = {};
      if (paidAmount !== undefined) updateData.paid_amount = parseFloat(paidAmount);
      if (status !== undefined) updateData.status = status;
      if (paymentHistory !== undefined) updateData.payment_history = JSON.stringify(paymentHistory);

      const { error } = await supabase
        .from('client_payments')
        .update(updateData)
        .eq('id', numId);
      if (error) return badRequest(error);
      return json({ success: true });
    }

    case 'inventory': {
      const { name, category, sku, unitPrice, costPrice, salePrice, quantity, minQuantity } = body;
      const { error } = await supabase
        .from('inventory_items')
        .update({
          name,
          category,
          sku: sku || null,
          unit_price: unitPrice ? parseFloat(unitPrice) : 0,
          cost_price: costPrice ? parseFloat(costPrice) : 0,
          sale_price: salePrice ? parseFloat(salePrice) : 0,
          quantity: quantity || 0,
          min_quantity: minQuantity || 5,
          stock_level: quantity || 0
        })
        .eq('id', numId);
      if (error) return badRequest(error);
      return json({ success: true });
    }

    case 'service-orders': {
      const { error } = await supabase
        .from('service_orders')
        .update(body)
        .eq('id', numId);
      if (error) return badRequest(error);
      return json({ success: true });
    }

    case 'categories': {
      const { name, type } = body;
      const { error } = await supabase
        .from('categories')
        .update({ name, type })
        .eq('id', numId);
      if (error) return badRequest(error);
      return json({ success: true });
    }

    case 'brands': {
      const { name, equipmentType } = body;
      const { error } = await supabase
        .from('brands')
        .update({ name, equipment_type: equipmentType || null })
        .eq('id', numId);
      if (error) return badRequest(error);
      return json({ success: true });
    }

    case 'equipment-types': {
      const { name, icon } = body;
      const { error } = await supabase
        .from('equipment_types')
        .update({ name, icon: icon || null })
        .eq('id', numId);
      if (error) return badRequest(error);
      return json({ success: true });
    }

    case 'models': {
      const { brandId, name } = body;
      const { error } = await supabase
        .from('models')
        .update({ brand_id: brandId, name })
        .eq('id', numId);
      if (error) return badRequest(error);
      return json({ success: true });
    }

    case 'service-order-statuses': {
      const { name, color, priority, isDefault } = body;
      const { error } = await supabase
        .from('service_order_statuses')
        .update({ name, color, priority: priority || 0, is_default: isDefault ? 1 : 0 })
        .eq('id', numId);
      if (error) return badRequest(error);
      return json({ success: true });
    }

    default:
      return notFound('Resource not found');
  }
}

async function handleDELETE(path: string) {
  const idMatch = path.match(/^(\w+)\/(\d+)$/);
  if (!idMatch) {
    return badRequest('Invalid ID');
  }

  const [, resource, id] = idMatch;
  const numId = parseInt(id);

  switch (resource) {
    case 'transactions':
    case 'customers':
    case 'client-payments':
    case 'inventory':
    case 'service-orders':
    case 'categories':
    case 'brands':
    case 'equipment-types':
    case 'models':
    case 'service-order-statuses': {
      const tableMap: Record<string, string> = {
        transactions: 'transactions',
        customers: 'customers',
        'client-payments': 'client_payments',
        inventory: 'inventory_items',
        'service-orders': 'service_orders',
        categories: 'categories',
        brands: 'brands',
        'equipment-types': 'equipment_types',
        models: 'models',
        'service-order-statuses': 'service_order_statuses'
      };
      const table = tableMap[resource];
      if (!table) return notFound('Resource not found');

      const { error } = await supabase.from(table).delete().eq('id', numId);
      if (error) return badRequest(error);
      return json({ success: true });
    }

    default:
      return notFound('Resource not found');
  }
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/', '');
  const method = req.method;

  let body: any = {};
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      body = await req.json();
    } catch {
      return badRequest('Invalid JSON');
    }
  }

  try {
    if (method === 'GET') {
      return handleGET(path);
    }

    if (method === 'POST') {
      return handlePOST(path, body);
    }

    if (method === 'PUT' || method === 'PATCH') {
      return handlePUT(path, body);
    }

    if (method === 'DELETE') {
      return handleDELETE(path);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('API Error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}
