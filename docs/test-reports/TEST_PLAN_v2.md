# PLANO DE TESTES REFINADO - Financeiro Inova

## LIÇÕES APRENDIDAS (v1)

1. **Navegação funciona** quando clicamos nos botões do sidebar
2. **Modais de feedback ficam abertos** e bloqueiam a UI
3. **O botão "Novo Cliente"** está no Header, não na lista
4. **É necessário esperar** que modais fechem antes de prosseguir

---

## NOVA ESTRATÉGIA DE TESTES

### Regras para Testes v2:

1. **Sempre usar clique no sidebar** para navegar, nunca `page.goto()`
2. **Esperar por backdrop/modais** antes de qualquer ação
3. **Fechar modais explicitamente** antes de navegar
4. **Capturar screenshot** em cada etapa se necessário
5. **Usar waitForSelector** com timeout adequado

---

## CHECKLIST DETALHADO DE TESTES v2

### BLOCO 1: AUTENTICAÇÃO
- [ ] Login com credenciais válidas
- [ ] Login com email inválido → mostra erro
- [ ] Login com senha errada → mostra erro
- [ ] Logout retorna para página de login

### BLOCO 2: DASHBOARD
- [ ] Cards de estatísticas carregam
- [ ] Gráficos renderizam (se houver)
- [ ] Navegação para outras páginas funciona

### BLOCO 3: CLIENTES (CRUD Completo)
- [ ] Navegar para Clientes via sidebar
- [ ] Ver lista de clientes (paginada)
- [ ] Buscar cliente por nome
- [ ] Abrir modal "Novo Cliente"
- [ ] Preencher todos os campos
- [ ] Salvar cliente novo
- [ ] Verificar toast de sucesso
- [ ] **Fechar modal de sucesso**
- [ ] Cliente aparece na lista
- [ ] Clicar em editar cliente
- [ ] Modificar dados
- [ ] Salvar edição
- [ ] Verificar toast de sucesso
- [ ] **Fechar modal de sucesso**
- [ ] Cliente modificado na lista
- [ ] Clicar em excluir cliente
- [ ] Confirmar exclusão no modal
- [ ] Cliente removido da lista

### BLOCO 4: TRANSAÇÕES (CRUD Completo)
- [ ] Navegar para Transações via sidebar
- [ ] Ver lista de transações
- [ ] Abrir modal "Nova Entrada"
- [ ] Preencher transação de entrada
- [ ] Salvar
- [ ] Verificar toast
- [ ] **Fechar modal**
- [ ] Transação aparece na lista
- [ ] Abrir modal "Nova Saída"
- [ ] Preencher transação de saída
- [ ] Salvar
- [ ] Editar transação existente
- [ ] Excluir transação

### BLOCO 5: VENDAS/PAGAMENTOS (CRUD Completo)
- [ ] Navegar para Vendas via sidebar
- [ ] Ver lista de pagamentos
- [ ] Novo pagamento
- [ ] Preencher dados
- [ ] Registrar pagamento parcial
- [ ] Ver histórico de pagamentos

### BLOCO 6: ORDENS DE SERVIÇO (CRUD Completo)
- [ ] Navegar para Ordens via sidebar
- [ ] Ver lista de OS
- [ ] Nova OS
- [ ] Preencher equipamento e problema
- [ ] Salvar OS
- [ ] Alterar status da OS
- [ ] Editar OS
- [ ] Excluir OS

### BLOCO 7: ESTOQUE (CRUD Completo)
- [ ] Navegar para Estoque via sidebar
- [ ] Ver lista de produtos
- [ ] Novo produto
- [ ] Preencher dados
- [ ] Editar produto
- [ ] Excluir produto

### BLOCO 8: RELATÓRIOS
- [ ] Navegar para Relatórios
- [ ] Gerar relatório de vendas
- [ ] Gerar relatório financeiro
- [ ] Exportar/Imprimir

### BLOCO 9: CONFIGURAÇÕES
- [ ] Navegar para Configurações
- [ ] Alterar configurações gerais
- [ ] Gerenciar usuários
- [ ] Adicionar novo usuário
- [ ] Editar permissões
- [ ] Desativar usuário

### BLOCO 10: FLUXO COMPLETO (E2E)
- [ ] Login → Criar Cliente → Registrar Venda → Ver no Dashboard
- [ ] Login → Criar OS → Alterar Status → Concluir → Ver em Relatórios

---

## MÉTODOS DE SYNC PARA MODAIS

```typescript
// Esperar modal abrir
await page.waitForSelector('[class*="modal"], [role="dialog"]', { timeout: 5000 });

// Esperar modal fechar
await page.waitForSelector('[class*="modal"], [role="dialog"]', { state: 'hidden', timeout: 5000 });

// Esperar toast aparecer
await page.waitForSelector('[class*="toast"], [role="alert"]', { timeout: 3000 });

// Forçar clique em backdrop para fechar
await page.click('[class*="backdrop"], [class*="overlay"]', { position: { x: 10, y: 10 } });
```

---

## DATA E RESPONSÁVEL
- **Data:** $(Get-Date -Format "yyyy-MM-dd")
- **Versão:** 2.0
- **Status:** Aguardando execução
