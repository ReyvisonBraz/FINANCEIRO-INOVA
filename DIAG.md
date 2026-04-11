# PROMPT — Diagnóstico e Correção: FINANCEIRO-INOVA (Vercel + Supabase)

## Contexto

Tenho um projeto chamado **FINANCEIRO-INOVA** que funciona perfeitamente em ambiente local, mas está completamente bugado quando deployado na Vercel conversando com o Supabase. Preciso que você analise o código, identifique TODOS os problemas e corrija cada um deles.

**Repositório:** https://github.com/ReyvisonBraz/FINANCEIRO-INOVA (branch: main1)

**Stack atual:**
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS 4
- Backend: Express.js (server.ts — arquivo único com 1500+ linhas)
- Banco LOCAL: SQLite via `better-sqlite3`
- Banco PRODUÇÃO (deveria ser): Supabase (PostgreSQL)
- Auth: JWT manual com bcrypt
- Deploy: Vercel
- Validação: Zod
- Estado: Zustand
- Gráficos: Recharts

---

## Problemas Críticos Identificados

Analise o projeto procurando TODOS estes problemas e qualquer outro que encontrar:

### 1. CRÍTICO — SQLite incompatível com Vercel

O `server.ts` usa `better-sqlite3`, que é um binding C++ nativo. A Vercel roda em ambiente serverless (AWS Lambda) que **não suporta binários nativos do SQLite**. Isso significa que o banco simplesmente não funciona em produção.

**O que verificar:**
- `better-sqlite3` está sendo importado e usado diretamente no server.ts
- O arquivo `finance.db` é criado localmente e não existe na Vercel
- Serverless functions são stateless — mesmo que o SQLite funcionasse, dados seriam perdidos entre invocações

**O que corrigir:**
- Migrar TODAS as queries de `better-sqlite3` para o **client do Supabase** (`@supabase/supabase-js` — já está no package.json)
- Substituir `db.prepare("...").run()` / `.get()` / `.all()` por chamadas `supabase.from('tabela').select()` / `.insert()` / `.update()` / `.delete()`
- Criar as tabelas equivalentes no Supabase (SQL de migração)
- Remover `better-sqlite3` do package.json
- Remover o arquivo `finance.db`

### 2. CRÍTICO — Arquitetura Express incompatível com Vercel

O projeto usa um `server.ts` Express monolítico com `app.listen(3000)`. A Vercel não roda servidores persistentes — ela espera **serverless functions** ou **API routes**.

**O que verificar:**
- `server.ts` inicia um servidor Express com `app.listen()`
- Vite dev server está acoplado ao Express
- Rotas como `app.get("/api/transactions")` não são acessíveis como serverless functions na Vercel

**O que corrigir:**
- Opção A (mais simples): Criar um `api/` folder com serverless functions da Vercel, uma por rota, que usam Supabase client
- Opção B: Usar `vercel.json` para rotear para o Express como serverless function (menos ideal mas mais rápido)
- Separar o Vite frontend build do backend
- Configurar `vercel.json` corretamente com `builds` e `routes`

### 3. CRÍTICO — Migrações via ALTER TABLE em try/catch

O server.ts tem um array `migrations` com ~40 entradas que fazem `ALTER TABLE ... ADD COLUMN` dentro de try/catch (ignorando erros silenciosamente). Isso:
- Não funciona em PostgreSQL (sintaxe diferente do SQLite em vários casos)
- Não é rastreável (não se sabe quais migrações já rodaram)
- Pode falhar silenciosamente e deixar o banco em estado inconsistente

**O que corrigir:**
- Criar as tabelas com schema completo desde o início no Supabase (sem ALTER TABLE)
- Usar o SQL editor do Supabase ou um arquivo de migration `.sql`
- Gerar o script SQL completo baseado no schema final (com todas as colunas que hoje são adicionadas via migrations)

### 4. ALTO — Queries SQLite vs PostgreSQL

Mesmo que migre para Supabase, há queries com sintaxe específica do SQLite que não funcionam em PostgreSQL:

**O que verificar:**
- `LIKE ?` — funciona em ambos, mas PostgreSQL é case-sensitive por padrão (usar `ILIKE`)
- `INTEGER PRIMARY KEY AUTOINCREMENT` — PostgreSQL usa `SERIAL` ou `GENERATED ALWAYS AS IDENTITY`
- `DATETIME DEFAULT CURRENT_TIMESTAMP` — PostgreSQL usa `TIMESTAMPTZ DEFAULT NOW()`
- `TEXT CHECK(type IN ('income', 'expense'))` — funciona mas seria melhor usar ENUMs do PostgreSQL
- String concatenation `||` — funciona em ambos
- `date LIKE '2024-10%'` para filtrar por mês — PostgreSQL tem `DATE_TRUNC` e `EXTRACT` nativos

**O que corrigir:**
- Revisar TODAS as queries e adaptar para PostgreSQL/Supabase client
- Substituir `LIKE` por `ILIKE` onde for busca case-insensitive
- Usar tipos nativos do PostgreSQL (TIMESTAMP, NUMERIC, etc)

### 5. ALTO — JWT Secret hardcoded

```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'financeiro-inova-secret-key-2024';
```

O fallback é um secret fixo no código. Se `JWT_SECRET` não estiver configurado nas env vars da Vercel, qualquer pessoa pode forjar tokens.

**O que corrigir:**
- Remover o fallback hardcoded
- Fazer o app falhar com erro explícito se `JWT_SECRET` não estiver definido
- Verificar se as variáveis de ambiente estão configuradas na Vercel

### 6. ALTO — Variáveis de ambiente do Supabase

**O que verificar:**
- Existem `SUPABASE_URL` e `SUPABASE_ANON_KEY` (ou `SUPABASE_SERVICE_ROLE_KEY`) configurados?
- O `.env.example` menciona as variáveis necessárias?
- O frontend está tentando acessar variáveis server-only?

**O que corrigir:**
- Garantir que todas as env vars necessárias estão no `.env.example`
- Garantir que estão configuradas no painel da Vercel (Settings > Environment Variables)
- Usar `NEXT_PUBLIC_` prefix apenas para variáveis que o frontend precisa

### 7. MÉDIO — Pasta `prisma/` não utilizada

O projeto tem uma pasta `prisma/` no repositório mas usa `better-sqlite3` diretamente. Isso indica uma migração incompleta ou abandonada.

**O que verificar:**
- O que tem no `prisma/schema.prisma`? Está atualizado com o schema real?
- Prisma client está sendo usado em algum lugar?

**O que corrigir:**
- Decidir: ou remove o Prisma e usa Supabase client direto, ou migra tudo para Prisma
- Se usar Supabase client direto (mais simples para este fix): remover pasta prisma/
- Se usar Prisma: configurar para PostgreSQL e migrar queries

### 8. MÉDIO — Body parser com limite alto

```typescript
app.use(express.json({ limit: '50mb' }));
```

50MB de JSON é excessivo e pode causar timeout em serverless functions (que tem limite de payload e tempo de execução).

**O que corrigir:**
- Reduzir para `10mb` ou menos
- Para upload de fotos (OS), usar Supabase Storage em vez de base64 no JSON

### 9. MÉDIO — Fotos como Base64 no banco

`arrivalPhotoBase64` armazena imagens diretamente na tabela como strings base64. Isso:
- Infla o tamanho do banco de dados
- Torna queries lentas
- Pode exceder limites de payload

**O que corrigir:**
- Migrar para Supabase Storage
- Armazenar apenas a URL no banco (`arrivalPhotoUrl`)
- Criar um endpoint de upload que envia para o Supabase Storage e retorna a URL

---

## Tarefas em Ordem de Execução

Siga esta ordem para minimizar quebras:

### Etapa 1 — Preparar o Supabase
1. Gere o SQL completo para criar TODAS as tabelas no Supabase (baseado no schema final do server.ts, incluindo todas as colunas das migrations)
2. Inclua os INSERTs de dados padrão (categorias, status de OS, tipos de equipamento, usuário admin)
3. Configure Row Level Security básico (opcional neste momento)

### Etapa 2 — Criar camada de acesso ao Supabase
1. Crie um arquivo `src/lib/supabase.ts` com o client configurado
2. Crie um `src/lib/supabase-server.ts` para uso server-side (com service_role_key)
3. Defina os types das tabelas

### Etapa 3 — Migrar as rotas
1. Para cada rota em server.ts, crie uma serverless function equivalente em `api/`
2. Substitua queries SQLite por chamadas Supabase
3. Mantenha a mesma interface de API (mesmos endpoints, mesmos payloads) para não quebrar o frontend
4. Migre a autenticação JWT para funcionar com as serverless functions

### Etapa 4 — Configurar Vercel
1. Crie/atualize `vercel.json` com a configuração correta de builds e routes
2. Configure todas as env vars necessárias
3. Separe o build do frontend (Vite) do backend (serverless functions)

### Etapa 5 — Limpar
1. Remova `better-sqlite3` do package.json
2. Remova `finance.db`
3. Remova ou atualize a pasta `prisma/` conforme a decisão
4. Remova o array de migrations do server.ts
5. Atualize o README com as novas instruções

### Etapa 6 — Testar
1. Teste cada endpoint da API individualmente
2. Verifique se o frontend consome os dados corretamente
3. Teste o fluxo de autenticação completo
4. Verifique se as env vars estão funcionando na Vercel

---

## Regras importantes

- **Não mude a interface da API** — os endpoints devem retornar os mesmos formatos que o frontend espera
- **Não mude o frontend** a menos que seja estritamente necessário para corrigir um bug
- **Teste cada migração de rota** antes de passar para a próxima
- **Mantenha o JWT auth** funcionando — não troque para Supabase Auth neste momento
- **Documente** cada mudança significativa com comentários no código
- **Se encontrar outros problemas** além dos listados, liste-os e corrija também

---

## Resultado Esperado

Ao final, o projeto deve:
1. ✅ Fazer deploy na Vercel sem erros de build
2. ✅ Conectar corretamente ao Supabase PostgreSQL
3. ✅ Todas as rotas da API funcionando (CRUD transactions, customers, payments, OS, inventory, settings, auth)
4. ✅ Login/logout funcionando com JWT
5. ✅ Dashboard com dados reais do Supabase
6. ✅ Zero referências ao better-sqlite3 ou finance.db
7. ✅ Variáveis de ambiente seguras (sem secrets hardcoded)

Comece analisando o server.ts completo e me mostre o plano de ação antes de começar a implementar.