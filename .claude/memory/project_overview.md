---
name: Project Overview - FINANCEIRO INOVA
description: Visão geral do sistema financeiro, tech stack, estado atual e objetivo
type: project
---

# FINANCEIRO INOVA — Project Overview

**Sistema:** Gestão financeira completa para empresas de tecnologia/assistência técnica
**Status:** ~90% completo, fase de refinamento e funcionalidade independente por módulo

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, Zustand, React Router v6
- **Backend:** Express.js, SQLite (better-sqlite3), Zod (validação)
- **Libs:** date-fns, lucide-react, recharts, motion, qrcode.react
- **Pronto para:** Supabase (PostgreSQL) + Render.com hosting

## Estrutura Principal

- `server.ts` — Backend Express + SQLite, todos os endpoints `/api/*`
- `src/App.tsx` — Orquestrador: auth, layout, routing, modais globais
- `src/pages/` — Containers de página (8 páginas)
- `src/components/` — Componentes UI por módulo
- `src/hooks/` — Lógica de negócio, chamadas de API
- `src/store/` — Estado global Zustand (11 stores independentes)
- `src/lib/` — Utilitários (print, receipt, whatsapp, logger)
- `docs/` — Documentação completa (10 arquivos)

## Objetivo Atual

Deixar cada ferramenta/módulo funcional de forma independente — cada um deve funcionar end-to-end sem depender de outro módulo para operar.

**Why:** O sistema foi construído modular mas algumas integrações entre módulos estão quebradas (ex: gravação de pagamentos, decremento de inventário) — precisamos garantir que cada ferramenta funcione isoladamente primeiro.

**How to apply:** Ao sugerir mudanças, sempre verificar se a mudança impacta outros módulos e documentar as dependências explicitamente.
