import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const JWT_SECRET = 'test-secret-key';
const BCRYPT_ROUNDS = 10;

const TransactionSchema = z.object({
  description: z.string().min(1),
  category: z.string().min(1),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional()
});

const CustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nickname: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
  creditLimit: z.number().nonnegative().optional(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional()
});

const ClientPaymentSchema = z.object({
  customerId: z.number(),
  description: z.string().min(1),
  totalAmount: z.number().positive(),
  paidAmount: z.number().nonnegative().optional(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  paymentMethod: z.string().min(1),
  status: z.enum(['pending', 'partial', 'paid']).optional(),
  installmentsCount: z.number().int().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  saleId: z.string().optional().nullable(),
  paymentHistory: z.string().optional(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional()
});

const ServiceOrderSchema = z.object({
  customerId: z.number(),
  equipmentType: z.string().optional().nullable(),
  equipmentBrand: z.string().optional().nullable(),
  equipmentModel: z.string().optional().nullable(),
  equipmentColor: z.string().optional().nullable(),
  equipmentSerial: z.string().optional().nullable(),
  reportedProblem: z.string().min(1),
  arrivalPhotoUrl: z.string().optional().nullable(),
  arrivalPhotoBase64: z.string().optional().nullable(),
  status: z.string().optional(),
  entryDate: z.string().optional().nullable(),
  analysisPrediction: z.string().optional().nullable(),
  customerPassword: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  ramInfo: z.string().optional().nullable(),
  ssdInfo: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  technicalAnalysis: z.string().optional().nullable(),
  servicesPerformed: z.string().optional().nullable(),
  services: z.any().optional(),
  partsUsed: z.any().optional(),
  serviceFee: z.number().nonnegative().optional().nullable(),
  totalAmount: z.number().nonnegative().optional().nullable(),
  finalObservations: z.string().optional().nullable(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional()
});

const InventoryItemSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['product', 'service']),
  sku: z.string().optional().nullable(),
  costPrice: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  unitPrice: z.number().nonnegative().optional(),
  quantity: z.number().int().nonnegative().optional(),
  stockLevel: z.number().int().nonnegative().optional(),
  minQuantity: z.number().int().nonnegative().optional(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional()
});

const UserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(4),
  role: z.enum(['owner', 'admin', 'employee']),
  name: z.string().min(1),
  permissions: z.array(z.string()).optional()
});

export function createTestApp(db: Database.Database) {
  const app = express();
  app.use(express.json());

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Credenciais obrigatórias' });

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const passwordMatch = user.password.startsWith('$2')
      ? bcrypt.compareSync(password, user.password)
      : password === user.password;

    if (!passwordMatch) return res.status(401).json({ error: 'Credenciais inválidas' });

    if (!user.password.startsWith('$2')) {
      const hashed = bcrypt.hashSync(password, BCRYPT_ROUNDS);
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, user.id);
    }

    try {
      user.permissions = JSON.parse(user.permissions || '[]');
    } catch (e) {
      user.permissions = [];
    }

    if (user.role === 'owner') {
      user.permissions = ['view_dashboard', 'manage_transactions', 'view_reports', 'manage_customers', 'manage_payments', 'manage_settings', 'manage_users'];
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    const { password: _pw, ...userWithoutPassword } = user;
    res.json({ ...userWithoutPassword, token });
  });

  app.get('/api/transactions', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC').all();
    res.json({ data: transactions, meta: { total: transactions.length } });
  });

  app.post('/api/transactions', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    try {
      const validatedData = TransactionSchema.parse(req.body);
      const { description, category, type, amount, date, createdBy } = validatedData;
      const info = db.prepare(
        'INSERT INTO transactions (description, category, type, amount, date, createdBy) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(description, category, type, amount, date, createdBy || 1);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/transactions/:id', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/customers', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    const customers = db.prepare('SELECT * FROM customers ORDER BY firstName ASC').all();
    res.json({ data: customers, meta: { total: customers.length } });
  });

  app.post('/api/customers', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    try {
      const validatedData = CustomerSchema.parse(req.body);
      const { firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, createdBy } = validatedData;
      const result = db.prepare(`
        INSERT INTO customers (firstName, lastName, nickname, cpf, companyName, phone, observation, creditLimit, createdBy) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(firstName, lastName, nickname || null, cpf || null, companyName || null, phone || '', observation || null, creditLimit || 0, createdBy || 1);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/customers/:id', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/client-payments', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    const payments = db.prepare('SELECT * FROM client_payments ORDER BY dueDate ASC').all();
    res.json({ data: payments, meta: { total: payments.length } });
  });

  app.post('/api/client-payments', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    try {
      const validatedData = ClientPaymentSchema.parse(req.body);
      const { customerId, description, totalAmount, paidAmount, purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, saleId, createdBy } = validatedData;
      
      const initialPaymentHistory = paidAmount && paidAmount > 0 ? JSON.stringify([{ amount: paidAmount, date: new Date().toISOString() }]) : '[]';

      const result = db.prepare(`
        INSERT INTO client_payments 
        (customerId, description, totalAmount, paidAmount, purchaseDate, dueDate, paymentMethod, status, installmentsCount, type, paymentHistory, saleId, createdBy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        customerId, description, totalAmount, paidAmount || 0, 
        purchaseDate, dueDate, paymentMethod, status || 'pending', 
        installmentsCount || 1, type || 'income', initialPaymentHistory, saleId || null, createdBy || 1
      );
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/client-payments/:id', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    db.prepare('DELETE FROM client_payments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/service-orders', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    const orders = db.prepare('SELECT * FROM service_orders ORDER BY createdAt DESC').all();
    res.json({ data: orders, meta: { total: orders.length } });
  });

  app.post('/api/service-orders', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    try {
      const validatedData = ServiceOrderSchema.parse(req.body);
      const { customerId, equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, reportedProblem, status, priority, createdBy } = validatedData;
      
      const result = db.prepare(`
        INSERT INTO service_orders (
          customerId, equipmentType, equipmentBrand, equipmentModel, equipmentColor, equipmentSerial, 
          reportedProblem, status, priority, createdBy
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        customerId, equipmentType || null, equipmentBrand || null, equipmentModel || null, equipmentColor || null, equipmentSerial || null, 
        reportedProblem, status || 'Aguardando Análise', priority || 'medium', createdBy || 1
      );
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/service-orders/:id', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    db.prepare('DELETE FROM service_orders WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/inventory', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    const items = db.prepare('SELECT * FROM inventory_items ORDER BY name ASC').all();
    res.json(items);
  });

  app.post('/api/inventory', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    try {
      const validatedData = InventoryItemSchema.parse(req.body);
      const { name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel, createdBy } = validatedData;
      const finalUnitPrice = unitPrice !== undefined ? unitPrice : (salePrice || 0);
      const finalStockLevel = stockLevel !== undefined ? stockLevel : (quantity || 0);
      
      const result = db.prepare('INSERT INTO inventory_items (name, category, sku, costPrice, salePrice, quantity, minQuantity, unitPrice, stockLevel, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        name, category, sku, costPrice || 0, finalUnitPrice, finalStockLevel, minQuantity || 5, finalUnitPrice, finalStockLevel, createdBy || 1
      );
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/inventory/:id', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    db.prepare('DELETE FROM inventory_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/users', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    const users = db.prepare('SELECT id, username, role, name, permissions, createdAt FROM users ORDER BY name ASC').all();
    res.json(users);
  });

  app.post('/api/users', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    try {
      const { username, password, role, name, permissions } = UserSchema.parse(req.body);
      const permsString = JSON.stringify(permissions || []);
      const hashedPassword = bcrypt.hashSync(password, BCRYPT_ROUNDS);
      const result = db.prepare('INSERT INTO users (username, password, role, name, permissions) VALUES (?, ?, ?, ?, ?)').run(username, hashedPassword, role, name, permsString);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.issues });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/settings', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json(settings);
  });

  app.get('/api/categories', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token de autenticação requerido' });

    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    res.json(categories);
  });

  return app;
}

export function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'Concluído',
      createdBy INTEGER,
      updatedBy INTEGER
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      appName TEXT DEFAULT 'Financeiro Pro'
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      nickname TEXT,
      cpf TEXT,
      companyName TEXT,
      phone TEXT NOT NULL,
      observation TEXT,
      creditLimit REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdBy INTEGER,
      updatedBy INTEGER
    );

    CREATE TABLE IF NOT EXISTS client_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      description TEXT NOT NULL,
      totalAmount REAL NOT NULL,
      paidAmount REAL DEFAULT 0,
      purchaseDate TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      installmentsCount INTEGER DEFAULT 1,
      type TEXT DEFAULT 'income',
      saleId TEXT,
      paymentHistory TEXT DEFAULT '[]',
      createdBy INTEGER,
      updatedBy INTEGER,
      FOREIGN KEY (customerId) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('owner', 'manager', 'employee')) NOT NULL DEFAULT 'employee',
      name TEXT NOT NULL,
      permissions TEXT DEFAULT '[]',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT CHECK(category IN ('product', 'service')) NOT NULL,
      sku TEXT,
      unitPrice REAL NOT NULL,
      stockLevel INTEGER DEFAULT 0,
      costPrice REAL DEFAULT 0,
      salePrice REAL DEFAULT 0,
      quantity INTEGER DEFAULT 0,
      minQuantity INTEGER DEFAULT 5,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdBy INTEGER,
      updatedBy INTEGER,
      FOREIGN KEY (createdBy) REFERENCES users(id),
      FOREIGN KEY (updatedBy) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS service_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER NOT NULL,
      equipmentBrand TEXT,
      equipmentModel TEXT,
      equipmentType TEXT,
      equipmentColor TEXT,
      equipmentSerial TEXT,
      reportedProblem TEXT,
      arrivalPhotoUrl TEXT,
      arrivalPhotoBase64 TEXT,
      status TEXT DEFAULT 'Aguardando Análise',
      technicalAnalysis TEXT,
      servicesPerformed TEXT,
      services TEXT DEFAULT '[]',
      partsUsed TEXT DEFAULT '[]',
      serviceFee REAL DEFAULT 0,
      totalAmount REAL DEFAULT 0,
      finalObservations TEXT,
      entryDate TEXT,
      analysisPrediction TEXT,
      customerPassword TEXT,
      accessories TEXT,
      ramInfo TEXT,
      ssdInfo TEXT,
      priority TEXT DEFAULT 'medium',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdBy INTEGER,
      updatedBy INTEGER,
      FOREIGN KEY (customerId) REFERENCES customers(id),
      FOREIGN KEY (createdBy) REFERENCES users(id),
      FOREIGN KEY (updatedBy) REFERENCES users(id)
    );
  `);

  const adminHash = bcrypt.hashSync('admin', BCRYPT_ROUNDS);
  db.prepare('INSERT INTO users (username, password, role, name, permissions) VALUES (?, ?, ?, ?, ?)').run(
    'admin', adminHash, 'owner', 'Administrador', JSON.stringify(['view_dashboard', 'manage_transactions'])
  );

  db.prepare('INSERT INTO settings (id) VALUES (1)').run();

  return db;
}
