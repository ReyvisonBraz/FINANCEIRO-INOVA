# Supabase Setup - Financeiro Inova

## Passo a Passo

### 1. Acesse o Supabase Dashboard

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione ou crie um projeto

### 2. Configure as Variáveis de Ambiente

No Supabase Dashboard:
1. Vá em **Settings** > **API**
2. Copie as seguintes variáveis:
   - `SUPABASE_URL` - URL do projeto
   - `SUPABASE_ANON_KEY` - Chave anônima
   - `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (para admin)

### 3. Execute os Scripts de Migração

Vá em **SQL Editor** no menu lateral e execute nesta ordem:

#### 3.1 Execute o Schema Principal
```sql
-- Copie o conteúdo de supabase/migrations/001_initial_schema.sql
-- Cole no SQL Editor e execute
```

#### 3.2 Configure RLS (Row Level Security)
```sql
-- Copie o conteúdo de supabase/migrations/002_rls_policies.sql
-- Cole no SQL Editor e execute
```

#### 3.3 Configure Triggers
```sql
-- Copie o conteúdo de supabase/migrations/003_triggers.sql
-- Cole no SQL Editor e execute
```

### 4. Configure o Auth (opcional)

Se quiser usar autenticação do Supabase:

1. Vá em **Authentication** > **Providers**
2. Ative **Email** se não estiver ativo
3. Configure URLs de redirect se necessário

### 5. Crie seu Primeiro Usuário

1. Vá em **Authentication** > **Users**
2. Clique em **Add User**
3. Ou use o sistema de cadastro normal

### 6. Atualize o Frontend

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## Estrutura dos Arquivos

```
supabase/
  migrations/
    001_initial_schema.sql  - Tabelas e dados iniciais
    002_rls_policies.sql    - Segurança (RLS)
    003_triggers.sql         - Triggers e funções
```

## Tabelas Criadas

| Tabela | Descrição |
|--------|-----------|
| profiles | Perfis de usuário |
| settings | Configurações do sistema |
| categories | Categorias de transação |
| customers | Clientes |
| transactions | Transações financeiras |
| client_payments | Pagamentos de clientes |
| receipts | Recibos |
| audit_logs | Logs de auditoria |
| inventory_items | Itens de inventário |
| service_order_statuses | Status de OS |
| equipment_types | Tipos de equipamento |
| brands | Marcas |
| models | Modelos |
| service_orders | Ordens de serviço |

## Notas Importantes

1. **RLS**: Row Level Security está habilitado em todas as tabelas
2. **Auth**: Os perfis são criados automaticamente quando um usuário faz login
3. **Triggers**: Auditoria é registrada automaticamente

## Troubleshooting

### Erro de permissão
Verifique se está usando a conexão correta (não a de anon/key pública)

### Tabelas não aparecem
Execute os scripts na ordem correta

### RLS bloqueando acesso
Os triggers de auditoria usam `SECURITY DEFINER` para funcionar com RLS
