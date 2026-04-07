---
name: Tools Catalog - Ferramentas do Sistema
description: Catálogo completo de cada ferramenta/módulo, o que faz, como funciona, como se comunicam
type: project
---

# Catálogo de Ferramentas — FINANCEIRO INOVA

## 1. DASHBOARD
**O que faz:** Visão geral financeira em tempo real  
**Como funciona:** Agrega dados de transações para KPIs + gráficos  
**Componentes:** `src/components/dashboard/Dashboard.tsx`  
**Hook:** `src/hooks/useDashboardStats.ts`, `src/hooks/useStats.ts`  
**API:** `GET /api/stats` (endpoint de agregação)  
**Comunica com:** Transactions (lê dados), Payments (lê dados)  
**Estado:** `useTransactionStore`, `useSettingsStore`

## 2. TRANSAÇÕES
**O que faz:** Lançamentos financeiros (entrada/saída)  
**Como funciona:** CRUD completo, filtros por tipo/categoria/data/valor  
**Componentes:** `src/components/transactions/`  
**Hook:** `src/hooks/useTransactions.ts`  
**Store:** `src/store/useTransactionStore.ts`  
**API:** `GET/POST/PUT/DELETE /api/transactions`  
**Comunica com:** Dashboard (fornece dados), Payments (cria transações ao registrar pagamento), Customers (associa cliente)  
**Status:** ✅ Funcional

## 3. CLIENTES
**O que faz:** Cadastro e gestão de clientes  
**Como funciona:** CRUD com busca, detecção de duplicatas, histórico  
**Componentes:** `src/components/customers/`  
**Hook:** `src/hooks/useCustomers.ts`  
**Store:** `src/store/useCustomerStore.ts`  
**API:** `GET/POST/PUT/DELETE /api/customers`, `GET /api/customers/:id/payments`  
**Comunica com:** Pagamentos (FK), Ordens de Serviço (FK), Transações (FK)  
**Status:** ✅ Funcional

## 4. PAGAMENTOS DE CLIENTES (Vendas/Recebíveis)
**O que faz:** Controle de vendas a prazo, parcelamento, recebimento  
**Como funciona:** Cria venda com parcelas, registra recebimentos, gera transações automáticas  
**Componentes:** `src/components/payments/`  
**Hook:** `src/hooks/useClientPayments.ts`  
**Store:** `src/store/useClientPaymentStore.ts`  
**API:** `GET/POST/PUT/DELETE /api/client-payments`, `POST /api/client-payments/:id/pay`  
**Comunica com:** Clientes (FK obrigatória), Transações (cria automaticamente ao receber), Recibos  
**Status:** ⚠️ Parcialmente funcional — registro de pagamento usa endpoint errado no App.tsx

## 5. ORDENS DE SERVIÇO (OS)
**O que faz:** Gestão completa de ordens de serviço de assistência técnica  
**Como funciona:** CRUD de OS com equipamento, status, serviços realizados, peças usadas  
**Componentes:** `src/components/service-orders/`  
**Hook:** `src/hooks/useServiceOrders.ts`  
**Store:** `src/store/useServiceOrderStore.ts`  
**API:** `GET/POST/PUT/DELETE /api/service-orders`, + endpoints de equipamentos  
**Sub-recursos:** `/api/service-order-statuses`, `/api/equipment-types`, `/api/brands`, `/api/models`  
**Comunica com:** Clientes (FK), Inventário (peças usadas), WhatsApp (notificações)  
**Status:** ⚠️ Maioria funcional — decremento de inventário não implementado, fotos sem validação de tamanho

## 6. INVENTÁRIO
**O que faz:** Catálogo de produtos e serviços com controle de estoque  
**Como funciona:** CRUD de itens com SKU, preço, quantidade  
**Componentes:** `src/components/inventory/Inventory.tsx`  
**Hook:** `src/hooks/useInventory.ts`  
**Store:** `src/store/useInventoryStore.ts`  
**API:** `GET/POST/PUT/DELETE /api/inventory`  
**Comunica com:** Ordens de Serviço (peças usadas são vinculadas ao inventário)  
**Status:** ✅ Funcional (sem integração automática com OS)

## 7. RELATÓRIOS
**O que faz:** Análise financeira com gráficos e exportação  
**Como funciona:** Agrega dados de transações, filtra por período, exporta CSV  
**Componentes:** `src/components/reports/Reports.tsx`  
**Hook:** `src/hooks/useExportData.ts`  
**API:** Usa dados já carregados no store  
**Comunica com:** Transactions (fonte de dados)  
**Status:** ✅ Funcional

## 8. CONFIGURAÇÕES
**O que faz:** Configuração global do sistema  
**Sub-módulos:**
- Categorias (CRUD de categorias de transação)
- Equipamentos (tipos, marcas, modelos para OS)
- Usuários (CRUD com permissões)
- WhatsApp (config SendPulse)
- Recibo/Print (logo, dados da empresa)
- Interface (tema, fontes)
- Senha de acesso
**Componentes:** `src/components/settings/`  
**Hook:** `src/hooks/useSettings.ts`  
**Store:** `src/store/useSettingsStore.ts`  
**API:** `GET/PUT /api/settings`, `/api/categories`, `/api/users`, + equipamentos  
**Status:** ✅ Funcional

## 9. LOGS DE AUDITORIA
**O que faz:** Rastreamento de todas as ações dos usuários  
**Como funciona:** Toda operação CRUD cria um registro de auditoria automaticamente no backend  
**Componentes:** `src/components/audit/AuditLogs.tsx`  
**Store:** `src/store/useAuthStore.ts`  
**API:** `GET /api/audit-logs`  
**Comunica com:** Todos os módulos (passivamente — recebe eventos)  
**Status:** ✅ Funcional

## 10. NOTIFICAÇÕES
**O que faz:** Alertas de pagamentos vencidos e OS atrasadas  
**Como funciona:** Calculado no frontend comparando datas com hoje  
**Componentes:** `src/components/layout/NotificationCenter.tsx`  
**Hook:** `src/hooks/useNotifications.ts`  
**Comunica com:** Pagamentos (prazo), OS (prazo de análise)  
**Status:** ✅ Funcional (cálculo frontend apenas)

## 11. AUTENTICAÇÃO
**O que faz:** Login e controle de sessão  
**Como funciona:** Login simples username/password, sessão em Zustand  
**Componentes:** `src/components/auth/Login.tsx`  
**Hook:** `src/hooks/useAuth.ts`  
**Store:** `src/store/useAuthStore.ts`  
**API:** `POST /api/login`  
**Status:** ⚠️ Funcional mas inseguro — senha em plain text, sem JWT

## 12. INTEGRAÇÃO WHATSAPP
**O que faz:** Envio de mensagens/lembretes via WhatsApp  
**Como funciona:** Gera link WhatsApp Web ou usa SendPulse API  
**Lib:** `src/lib/whatsappUtils.ts`  
**Componentes:** Modais em customers/ e service-orders/  
**Comunica com:** Clientes (telefone), OS (detalhes), Pagamentos (lembretes)  
**Status:** ⚠️ Funcional básico (link WhatsApp Web), SendPulse não totalmente integrado

## 13. EXPORTAÇÃO & IMPRESSÃO
**O que faz:** Export CSV e impressão de recibos/formulários  
**Como funciona:** Frontend gera CSV via hook, templates HTML para impressão  
**Hook:** `src/hooks/useExportData.ts`, `src/hooks/useReceipt.ts`  
**Lib:** `src/lib/printUtils.ts`, `src/lib/receiptTemplates.ts`  
**Comunica com:** Todos os módulos (exporta dados de qualquer um)  
**Status:** ✅ Funcional

## 14. QR CODE (OS)
**O que faz:** Gera QR Code para rastreamento de OS  
**Como funciona:** qrcode.react gera QR a partir do ID/número da OS  
**Componentes:** `src/components/service-orders/modals/QRCodeModal.tsx`  
**Status:** ✅ Funcional
