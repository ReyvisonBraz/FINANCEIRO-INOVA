# Próximos Passos (Plano de Ação Imediato)

Após a refatoração bem-sucedida da estrutura de componentes e a centralização dos modais globais, o projeto está pronto para as seguintes melhorias de qualidade e performance:

## 1. Implementação de Error Boundaries (Curto Prazo)
*   **Objetivo:** Evitar que falhas em componentes específicos derrubem a aplicação inteira.
*   **Ação:** Criar um componente `<ErrorBoundary />` genérico em `src/components/ui/` e envolvê-lo em torno das rotas principais no `App.tsx`.
*   **Benefício:** Melhora a resiliência e a experiência do usuário em caso de erros inesperados.

## 2. Migração para Roteamento Real e Code Splitting (Curto Prazo)
*   **Objetivo:** Melhorar o tempo de carregamento inicial e a SEO (se aplicável).
*   **Ação:** Substituir o controle de tela baseado em estado (`activeScreen`) por rotas reais do `react-router-dom`. Usar `React.lazy()` e `<Suspense>` para carregar as páginas (`DashboardPage`, `CustomersPage`, etc.) sob demanda.
*   **Benefício:** Bundle inicial menor e navegação mais fluida.

## 3. Adoção do TanStack Query (Médio Prazo)
*   **Objetivo:** Simplificar o gerenciamento de estado do servidor e implementar cache automático.
*   **Ação:** Migrar as chamadas de API dos hooks customizados (`useCustomers`, `useTransactions`) para o React Query.
*   **Benefício:** Sincronização automática de dados, redução de requisições redundantes e melhor feedback visual de carregamento.

## 4. Refinamento do RBAC (Médio Prazo)
*   **Objetivo:** Garantir que usuários com diferentes níveis de acesso vejam apenas o que lhes é permitido.
*   **Ação:** Criar um componente `<ProtectedRoute />` ou `<Can />` para envolver rotas e botões sensíveis, baseando-se no papel do usuário (`role`) vindo do `useAuth`.
*   **Benefício:** Segurança robusta e interface personalizada por perfil.

## 5. Testes Unitários Críticos (Médio Prazo)
*   **Objetivo:** Garantir que lógicas de cálculo e exportação não quebrem em futuras mudanças.
*   **Ação:** Implementar testes para os hooks `useDashboardStats` e `useExportData`.
*   **Benefício:** Confiança total em refatorações futuras.

---

**Status Atual:**
*   [x] Refatoração de Componentes (Concluído)
*   [x] Centralização de Modais Globais (Concluído)
*   [x] Limpeza de App.tsx (Concluído)
*   [x] Error Boundaries (Concluído)
*   [x] Lazy Loading (Concluído)
*   [x] Debounce para Buscas (Concluído)
*   [x] Centralização de Recibos (Concluído)
