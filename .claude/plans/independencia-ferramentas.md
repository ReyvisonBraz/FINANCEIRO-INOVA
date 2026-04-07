# Plano: Análise e Independência das Ferramentas — FINANCEIRO INOVA

## Context

O sistema FINANCEIRO INOVA é uma plataforma completa de gestão financeira para empresas de assistência técnica. Ele foi desenvolvido de forma modular mas algumas integrações entre módulos estão quebradas ou incompletas. O objetivo é:

1. **Documentar** todas as ferramentas disponíveis (o que cada uma faz, como funciona, como se comunicam)
2. **Identificar** o estado atual de cada ferramenta
3. **Planejar** o trabalho para deixar cada ferramenta funcional de forma independente

---

## Ferramentas Disponíveis no Sistema

### ✅ Funcionando Completamente

| # | Ferramenta | O que faz | Como se comunica |
|---|-----------|-----------|-----------------|
| 1 | **Dashboard** | KPIs financeiros + gráficos de fluxo de caixa | Lê de Transações e Pagamentos via `/api/stats` |
| 2 | **Transações** | Lançamentos de entrada/saída com categorias | Fonte para Dashboard e Relatórios |
| 3 | **Clientes** | Cadastro completo com busca e histórico | FK para Pagamentos e OS |
| 4 | **Inventário** | Catálogo de produtos/serviços com estoque | Consumido por OS (peças) — sem integração automática ainda |
| 5 | **Relatórios** | Gráficos e exportação CSV de dados financeiros | Lê Transações do store |
| 6 | **Configurações** | Config global: categorias, usuários, equipamentos, WhatsApp, impressão | Alimenta todos os módulos com metadados |
| 7 | **Auditoria** | Log de todas as ações dos usuários | Recebe eventos de todos os módulos via backend |
| 8 | **Notificações** | Alertas de vencimentos de pagamentos e OS | Lê Pagamentos e OS do store, calcula no frontend |
| 9 | **Export/Impressão** | CSV + recibos A4/térmica + formulários OS | Utiliza dados de qualquer módulo |
| 10 | **QR Code** | Gera QR para rastreamento de OS | Usa ID/número da OS |

### ⚠️ Parcialmente Funcionando

| # | Ferramenta | O que faz | Problema |
|---|-----------|-----------|---------|
| 11 | **Pagamentos de Clientes** | Vendas parceladas, recebíveis, controle de inadimplência | Registro de pagamento usa endpoint errado — não cria transação automática |
| 12 | **Ordens de Serviço** | OS completa: equipamento, diagnóstico, serviços, peças, status | Peças usadas não decrementam o inventário |
| 13 | **WhatsApp** | Envio de lembretes e notificações via WhatsApp | Link básico funciona; SendPulse API incompleto |
| 14 | **Autenticação** | Login com controle de permissões por usuário | Funciona mas senha em plain text (sem bcrypt); sem JWT no backend |

---

## Como as Ferramentas Se Comunicam

```
Dashboard ←── Transações (dados financeiros)
Dashboard ←── Pagamentos (recebíveis)

Pagamentos ──→ Transações (cria entrada ao receber)
Pagamentos ──→ Clientes (associa cliente à venda)

OS ──→ Clientes (cliente dono do equipamento)
OS ──→ Inventário (peças utilizadas) [NÃO IMPLEMENTADO]
OS ──→ WhatsApp (notificação de status)

Configurações ──→ OS (tipos de equipamento, marcas, modelos, status)
Configurações ──→ Transações (categorias)
Configurações ──→ Usuários (permissões por módulo)

Auditoria ←── TODOS (passivamente, via backend)
Notificações ←── Pagamentos + OS (datas de vencimento)
```

---

## Problemas Identificados (Ordem de Prioridade)

### 🔴 Crítico
1. **Pagamentos: Endpoint errado** — `App.tsx` chama `saveClientPaymentAPI` (PUT) mas deveria chamar `recordPaymentAPI` (POST `/api/client-payments/:id/pay`)
   - Arquivo: `src/App.tsx` ~linha 706
   - Fix: Trocar para `recordPaymentAPI(id, amount, date)`

2. **Senhas plain text** — SQLite armazena senhas sem hash
   - Arquivo: `server.ts` ~linha 357, 887
   - Fix: Implementar bcrypt

### 🟡 Médio
3. **OS não decrementa inventário** — código comentado em `server.ts` ~linha 1199
4. **Fotos base64 sem limite de tamanho** — pode degradar performance
5. **API endpoints sem validação Zod** — `/api/receipts` e outros

---

## Plano de Execução: Independência por Ferramenta

### Fase 1 — Corrigir Bloqueadores Críticos
**Foco:** Fazer cada ferramenta funcionar do zero ao fim sem erro

**1.1 — Corrigir Pagamentos**
- Arquivos: `src/App.tsx`, `src/hooks/useClientPayments.ts`
- Ação: Substituir chamada para usar `recordPaymentAPI`
- Verificar: Criar venda → registrar pagamento → confirmar transação criada automaticamente

**1.2 — Corrigir OS + Inventário**
- Arquivo: `server.ts` linha ~1199
- Ação: Descomentar e validar lógica de decremento de estoque
- Verificar: Criar OS com peça → confirmar redução do estoque no inventário

**1.3 — Validação de Fotos**
- Arquivo: `src/components/service-orders/ServiceOrderForm.tsx`
- Ação: Adicionar validação de tamanho máximo (ex: 2MB por foto)

### Fase 2 — Robustecer Cada Ferramenta (CRUD End-to-End)
Verificar e corrigir para cada módulo:
- [ ] Criar novo registro funciona
- [ ] Editar registro funciona e popula o form corretamente
- [ ] Deletar com cascata funciona
- [ ] Filtros/busca funcionam
- [ ] Exportação CSV funciona
- [ ] Feedback visual (toast, loading) funciona

### Fase 3 — Integrações entre Módulos
- OS → inventário (decremento automático)
- Pagamento → transação (já existe, corrigir bug)
- OS → WhatsApp (testar fluxo completo)

### Fase 4 — Segurança
- Hash de senhas (bcrypt)
- JWT no backend
- Validação Zod em todos endpoints

---

## Arquivos Críticos

| Arquivo | Papel |
|---------|-------|
| `server.ts` | Backend completo — todos os endpoints |
| `src/App.tsx` | Orquestrador — auth, routing, modais globais |
| `src/hooks/useClientPayments.ts` | Lógica de pagamentos (tem bug) |
| `src/hooks/useServiceOrders.ts` | Lógica de OS |
| `src/store/useModalStore.ts` | Estado de todos os modais |
| `src/store/useFilterStore.ts` | Filtros de todos os módulos |
| `src/lib/receiptTemplates.ts` | Templates de recibo |
| `src/lib/whatsappUtils.ts` | Utilitários WhatsApp |

---

## Verificação (Como Testar Cada Ferramenta)

1. **Dashboard:** Navegar para tela, ver KPIs não zerados, navegar meses anteriores
2. **Transações:** Criar, editar, filtrar por data/categoria, deletar — verificar toast em cada ação
3. **Clientes:** Cadastrar, buscar, editar, ver histórico, deletar
4. **Pagamentos:** Criar venda parcelada → registrar pagamento → confirmar transação criada
5. **OS:** Criar OS com cliente + equipamento + peça → mudar status → imprimir/QR Code
6. **Inventário:** Cadastrar produto, ver quantidade, confirmar que OS decrementa
7. **Relatórios:** Ver gráficos, exportar CSV com dados reais
8. **Configurações:** Alterar categoria, adicionar marca/modelo, salvar configurações da empresa
9. **WhatsApp:** Abrir modal de OS, verificar que mensagem é gerada com dados corretos
10. **Notificações:** Ter pagamento vencido e verificar badge no header
