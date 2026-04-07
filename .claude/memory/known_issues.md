---
name: Known Issues - Bugs e Problemas por Módulo
description: Todos os bugs e problemas identificados na análise completa do sistema
type: project
---

# Known Issues — FINANCEIRO INOVA

## 🔴 CRÍTICO

### 1. Registro de Pagamento — Endpoint Errado
**Módulo:** Pagamentos de Clientes  
**Arquivo:** `src/App.tsx` linha ~706 vs `src/hooks/useClientPayments.ts` linha 46  
**Problema:** App.tsx chama `saveClientPaymentAPI` (PUT) para registrar pagamento, mas o servidor espera `POST /api/client-payments/:id/pay` com `{amount, date}`. Hook `recordPaymentAPI` existe mas não é chamado.  
**Impacto:** Registro de pagamento não cria transação automática, status pode não atualizar corretamente.  
**Fix:** Substituir chamada em App.tsx para usar `recordPaymentAPI(id, amount, date)`.

### 2. Senha em Plain Text
**Módulo:** Autenticação  
**Arquivo:** `server.ts` linha ~357, ~887  
**Problema:** Senhas armazenadas sem hash (plain text no SQLite).  
**Impacto:** Vulnerabilidade de segurança crítica.  
**Fix:** Implementar bcrypt para hash de senhas.

## 🟡 MÉDIO

### 3. Inventário Não Decrementa com OS
**Módulo:** Ordens de Serviço → Inventário  
**Arquivo:** `server.ts` linha ~1199 (código comentado)  
**Problema:** Ao adicionar peças em uma OS, o estoque do inventário não é reduzido.  
**Fix:** Descomentar e corrigir a lógica de decremento.

### 4. Fotos Base64 Sem Validação de Tamanho
**Módulo:** Ordens de Serviço  
**Arquivo:** `server.ts`, `src/components/service-orders/ServiceOrderForm.tsx`  
**Problema:** Fotos de chegada armazenadas como Base64 sem limite de tamanho — pode causar problemas de performance com muitas OS.  
**Fix:** Validar tamanho máximo no frontend antes do upload.

### 5. Formulários de Edição com Preenchimento Inconsistente
**Módulo:** Clientes, Inventário  
**Arquivo:** `src/App.tsx` linha ~292-300, stores  
**Problema:** Apenas `editingTransaction` auto-popula o form store. Outros módulos precisam fazer manualmente.  
**Fix:** Padronizar auto-population no App.tsx useEffect.

### 6. API sem Validação Zod em Alguns Endpoints
**Módulo:** Backend  
**Arquivo:** `server.ts`  
**Problema:** Endpoint `/api/receipts` e outros não validam body com Zod.  
**Fix:** Adicionar Zod schema para todos os endpoints POST/PUT.

## 🟠 MINOR

### 7. Sem Sync em Tempo Real
**Problema:** Sem WebSockets — múltiplos usuários veem dados desatualizados até recarregar.  
**Fix:** Implementar polling ou WebSockets.

### 8. Autenticação Sem JWT/Session
**Problema:** Sessão só no frontend — API não valida se o usuário está autenticado.  
**Fix:** Implementar JWT ou session tokens no backend.

### 9. SendPulse WhatsApp Incompleto
**Problema:** Config existe mas integração não salva mensagens enviadas.  
**Fix:** Completar fluxo SendPulse API.
