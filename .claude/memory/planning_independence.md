---
name: Plano de Independência por Ferramenta
description: Estratégia para deixar cada ferramenta funcional de forma independente
type: project
---

# Plano: Independência por Ferramenta

## Objetivo
Garantir que cada módulo/ferramenta do sistema funcione end-to-end de forma independente, sem depender de outro módulo para operar corretamente.

## Estado Atual por Módulo

| Módulo | Status | Independente? | Bloqueadores |
|--------|--------|---------------|--------------|
| Dashboard | ✅ | Sim (lê de outros) | Nenhum |
| Transações | ✅ | Sim | Nenhum |
| Clientes | ✅ | Sim | Nenhum |
| Pagamentos | ⚠️ | Não | Endpoint errado para registrar pagamento |
| Ordens de Serviço | ⚠️ | Parcialmente | Inventário não decrementa |
| Inventário | ✅ | Sim | Nenhum |
| Relatórios | ✅ | Sim | Nenhum |
| Configurações | ✅ | Sim | Nenhum |
| Auditoria | ✅ | Sim | Nenhum |
| Notificações | ✅ | Sim (frontend) | Nenhum |
| Autenticação | ⚠️ | Sim | Segurança (plain text) |
| WhatsApp | ⚠️ | Parcialmente | SendPulse incompleto |
| Export/Print | ✅ | Sim | Nenhum |
| QR Code | ✅ | Sim | Nenhum |

## Ordem de Trabalho Proposta

### Fase 1: Corrigir Bugs Críticos (Prioridade Máxima)
1. **Pagamentos** — Corrigir endpoint de registro de pagamento
2. **OS + Inventário** — Implementar decremento automático de estoque
3. **Validação de Fotos** — Limitar tamanho de imagens na OS

### Fase 2: Robustecer cada Ferramenta Individualmente
Para cada módulo: garantir que CRUD completo funciona, filtros funcionam, exportação funciona, e feedbacks visuais estão corretos.

### Fase 3: Integrações entre Módulos
Com cada módulo funcionando isoladamente, conectar as integrações:
- OS → Inventário (decremento ao usar peça)
- Pagamento → Transação (criação automática)
- OS → WhatsApp (notificação ao cliente)

### Fase 4: Segurança & Produção
- Hash de senhas com bcrypt
- JWT/session no backend
- Validação Zod em todos os endpoints
