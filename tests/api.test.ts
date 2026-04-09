import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp, createTestDb } from './api-helpers';

describe('API Authentication', () => {
  const db = createTestDb();
  const app = createTestApp(db);

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token de autenticação requerido');
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'admin' });
    
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.username).toBe('admin');
    expect(res.body.role).toBe('owner');
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'wrongpassword' });
    
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciais inválidas');
  });

  it('should reject missing credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({});
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Credenciais obrigatórias');
  });
});

describe('API Transactions', () => {
  const db = createTestDb();
  const app = createTestApp(db);
  let token: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'admin' });
    token = loginRes.body.token;
  });

  it('should list transactions', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.meta).toBeDefined();
  });

  it('should create transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Test Transaction',
        category: 'Alimentação',
        type: 'expense',
        amount: 100.50,
        date: '2024-10-24',
        createdBy: 1
      });
    
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
  });

  it('should reject invalid transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: '',
        category: 'Alimentação',
        type: 'expense',
        amount: -100,
        date: 'invalid-date'
      });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('should delete transaction', async () => {
    const createRes = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'To Delete',
        category: 'Test',
        type: 'income',
        amount: 50,
        date: '2024-10-24'
      });
    
    const deleteRes = await request(app)
      .delete(`/api/transactions/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});

describe('API Customers', () => {
  const db = createTestDb();
  const app = createTestApp(db);
  let token: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'admin' });
    token = loginRes.body.token;
  });

  it('should list customers', async () => {
    const res = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('should create customer', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'João',
        lastName: 'Silva',
        phone: '+55 11 99999-9999',
        createdBy: 1
      });
    
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
  });

  it('should reject customer without firstName', async () => {
    const res = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: '',
        lastName: 'Silva',
        phone: '+55 11 99999-9999'
      });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('should delete customer', async () => {
    const createRes = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Delete',
        lastName: 'Me',
        phone: '+55 11 99999-9999'
      });
    
    const deleteRes = await request(app)
      .delete(`/api/customers/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});

describe('API Client Payments', () => {
  const db = createTestDb();
  const app = createTestApp(db);
  let token: string;
  let customerId: number;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'admin' });
    token = loginRes.body.token;

    const customerRes = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Cliente',
        lastName: 'Teste',
        phone: '+55 11 99999-9999'
      });
    customerId = customerRes.body.id;
  });

  it('should list client payments', async () => {
    const res = await request(app)
      .get('/api/client-payments')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('should create client payment', async () => {
    const res = await request(app)
      .post('/api/client-payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        description: 'Test Payment',
        totalAmount: 500,
        paidAmount: 100,
        purchaseDate: '2024-10-01',
        dueDate: '2024-10-30',
        paymentMethod: 'Dinheiro',
        type: 'income',
        createdBy: 1
      });
    
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
  });

  it('should delete client payment', async () => {
    const createRes = await request(app)
      .post('/api/client-payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        description: 'To Delete',
        totalAmount: 200,
        purchaseDate: '2024-10-01',
        dueDate: '2024-10-30',
        paymentMethod: 'PIX'
      });
    
    const deleteRes = await request(app)
      .delete(`/api/client-payments/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});

describe('API Service Orders', () => {
  const db = createTestDb();
  const app = createTestApp(db);
  let token: string;
  let customerId: number;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'admin' });
    token = loginRes.body.token;

    const customerRes = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Cliente',
        lastName: 'OS',
        phone: '+55 11 99999-9999'
      });
    customerId = customerRes.body.id;
  });

  it('should list service orders', async () => {
    const res = await request(app)
      .get('/api/service-orders')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('should create service order', async () => {
    const res = await request(app)
      .post('/api/service-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        reportedProblem: 'Tela quebrada',
        equipmentType: 'Smartphone',
        equipmentBrand: 'Samsung',
        equipmentModel: 'Galaxy S21',
        createdBy: 1
      });
    
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
  });

  it('should delete service order', async () => {
    const createRes = await request(app)
      .post('/api/service-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId,
        reportedProblem: 'To Delete',
        status: 'Aguardando Análise'
      });
    
    const deleteRes = await request(app)
      .delete(`/api/service-orders/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});

describe('API Inventory', () => {
  const db = createTestDb();
  const app = createTestApp(db);
  let token: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'admin' });
    token = loginRes.body.token;
  });

  it('should list inventory items', async () => {
    const res = await request(app)
      .get('/api/inventory')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create inventory item', async () => {
    const res = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Película',
        category: 'product',
        unitPrice: 25,
        stockLevel: 50
      });
    
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
  });

  it('should delete inventory item', async () => {
    const createRes = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'To Delete',
        category: 'service',
        unitPrice: 100
      });
    
    const deleteRes = await request(app)
      .delete(`/api/inventory/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});

describe('API Users', () => {
  const db = createTestDb();
  const app = createTestApp(db);
  let token: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'admin' });
    token = loginRes.body.token;
  });

  it('should list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].username).toBe('admin');
  });

  it('should create new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'newuser',
        password: 'password123',
        role: 'employee',
        name: 'Novo Usuário',
        permissions: ['view_dashboard']
      });
    
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
  });
});

describe('API Settings & Categories', () => {
  const db = createTestDb();
  const app = createTestApp(db);
  let token: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'admin' });
    token = loginRes.body.token;
  });

  it('should get settings', async () => {
    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.appName).toBeDefined();
  });

  it('should get categories', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
