---
name: Architecture Map - Fluxo de Dados e Estrutura
description: Mapa completo da arquitetura, stores Zustand, endpoints API, data flow
type: project
---

# Architecture Map — FINANCEIRO INOVA

## Data Flow Global
```
User Action
  → Component
    → Custom Hook (src/hooks/)
      → API call (src/services/api.ts → fetch /api/*)
        → server.ts (Express)
          → SQLite (better-sqlite3)
        → Response JSON
      → Zustand Store update (src/store/)
    → Component re-render
```

## 11 Zustand Stores

| Store | Responsabilidade |
|-------|-----------------|
| useAppStore | UI: tela ativa, sidebar, fontes, flags de modal |
| useAuthStore | Auth: usuário logado, lista de users, audit logs |
| useFilterStore | Filtros e busca de todos os módulos |
| useFormStore | Dados de formulários (antes de salvar) |
| useModalStore | Estado de modais (o que está editando/deletando) |
| useTransactionStore | Lista de transações + paginação |
| useCustomerStore | Lista de clientes + paginação |
| useClientPaymentStore | Lista de pagamentos + paginação |
| useServiceOrderStore | OS + equipamentos (tipos/marcas/modelos) |
| useInventoryStore | Itens do inventário |
| useSettingsStore | Configurações do app + categorias |

## Endpoints API (server.ts)

### Transações
- GET /api/transactions — lista com filtros e paginação
- POST /api/transactions — criar (Zod validado)
- PUT /api/transactions/:id — atualizar
- DELETE /api/transactions/:id — deletar

### Clientes
- GET /api/customers — lista com paginação
- POST /api/customers — criar (Zod validado)
- PUT /api/customers/:id — atualizar
- DELETE /api/customers/:id — deletar (cascata em pagamentos)
- GET /api/customers/:id/payments — verificar pagamentos vinculados

### Pagamentos
- GET /api/client-payments — lista (JOIN com customers)
- POST /api/client-payments — criar (cria parcelas + transação entrada)
- PUT /api/client-payments/:id — atualizar
- POST /api/client-payments/:id/pay — registrar pagamento (cria transação)
- DELETE /api/client-payments/:id — deletar
- DELETE /api/client-payments/group/:saleId — deletar grupo de parcelas

### Ordens de Serviço
- GET /api/service-orders — lista com filtros
- POST /api/service-orders — criar (Zod validado)
- PUT /api/service-orders/:id — atualizar
- DELETE /api/service-orders/:id — deletar

### Sub-recursos de OS
- GET/POST/PUT/DELETE /api/service-order-statuses
- GET/POST/PUT/DELETE /api/equipment-types
- GET/POST/PUT/DELETE /api/brands
- GET/POST/PUT/DELETE /api/models

### Inventário
- GET /api/inventory — listar tudo
- POST /api/inventory — criar (Zod validado)
- PUT /api/inventory/:id — atualizar
- DELETE /api/inventory/:id — deletar

### Configurações
- GET /api/settings — buscar configurações
- PUT /api/settings — atualizar

### Categorias
- GET /api/categories — listar
- POST /api/categories — criar
- DELETE /api/categories/:id — deletar

### Usuários & Auditoria
- GET /api/users — listar
- POST /api/users — criar
- PUT /api/users/:id — atualizar
- DELETE /api/users/:id — deletar
- GET /api/audit-logs — ver logs

### Auth & Misc
- POST /api/login — autenticar
- POST /api/receipts — salvar recibo
- GET /api/stats — estatísticas do dashboard

## Padrão de Comunicação entre Módulos

- **Pagamentos → Transações:** POST /api/client-payments/:id/pay cria automaticamente uma transação de entrada
- **OS → Inventário:** deveria decrementar estoque ao usar peça (NÃO IMPLEMENTADO ainda)
- **OS/Pagamentos → WhatsApp:** frontend gera link WhatsApp Web com dados formatados
- **Dashboard → Todos:** lê dados agregados dos outros módulos via /api/stats
- **Notificações → Pagamentos/OS:** frontend compara datas de vencimento com hoje
