# 🚀 Plano de Refatoração: Componentes CRUD Genéricos

> **Status:** Planejado  
> **Início:** 2025-11-21  
> **Estimativa:** 13-15 horas  
> **Objetivo:** Criar arquitetura escalável para múltiplos CRUDs

## 📋 Contexto

O projeto terá múltiplos CRUDs similares:
- ✅ Produtos (atual - 550 linhas)
- ✅ Unidades de Medida (atual)
- ✅ Tipos de Produto (atual)
- 🔜 Clientes
- 🔜 Fornecedores
- 🔜 Telas de movimentação
- 🔜 Outros...

**Problema:** Código duplicado, difícil manutenção, inconsistência visual

**Solução:** Componentes genéricos reutilizáveis + hooks customizados

## 🏗️ Arquitetura Proposta

```
frontend/src/
├── shared/
│   ├── components/
│   │   ├── CrudTable/
│   │   │   ├── CrudTable.tsx          ← Tabela genérica
│   │   │   ├── TableHeader.tsx
│   │   │   ├── TableRow.tsx
│   │   │   ├── TableActions.tsx
│   │   │   └── index.ts
│   │   ├── CrudModal/
│   │   │   ├── CrudModal.tsx          ← Modal genérico
│   │   │   └── index.ts
│   │   ├── SearchBar/
│   │   │   ├── SearchBar.tsx          ← Barra de busca
│   │   │   └── index.ts
│   │   ├── Pagination/
│   │   │   ├── Pagination.tsx         ← Paginação
│   │   │   └── index.ts
│   │   ├── EmptyState/
│   │   │   ├── EmptyState.tsx         ← Estado vazio
│   │   │   └── index.ts
│   │   └── LoadingState/
│   │       ├── LoadingState.tsx       ← Loading
│   │       └── index.ts
│   └── hooks/
│       ├── useCrud.ts                 ← CRUD genérico
│       ├── usePagination.ts           ← Paginação
│       ├── useFilters.ts              ← Filtros
│       └── useModal.ts                ← Modal state
├── features/
│   ├── produtos/
│   │   ├── hooks/
│   │   │   └── useProdutos.ts         ← Lógica específica
│   │   ├── components/
│   │   │   └── ProdutoForm.tsx        ← Formulário específico
│   │   └── config/
│   │       └── produtosConfig.ts      ← Configuração
│   ├── clientes/                      ← Futuro
│   └── fornecedores/                  ← Futuro
└── pages/dashboard/
    └── produtos.tsx                   ← 80 linhas (vs 550)
```

## 📦 Componentes a Criar

### 1. CrudTable (Genérico)

**Props:**
```typescript
interface CrudTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  actions?: boolean;
}
```

**Uso:**
```tsx
<CrudTable
  data={produtos}
  columns={produtosColumns}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### 2. CrudModal (Genérico)

**Props:**
```typescript
interface CrudModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**Uso:**
```tsx
<CrudModal isOpen={isOpen} title="Novo Produto" onClose={handleClose}>
  <ProdutoForm onSubmit={handleSubmit} />
</CrudModal>
```

### 3. SearchBar (Genérico)

**Props:**
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onNew?: () => void;
  newButtonLabel?: string;
}
```

### 4. useCrud Hook (Genérico)

**Interface:**
```typescript
function useCrud<T>(apiEndpoint: string) {
  return {
    items: T[];
    isLoading: boolean;
    error: string | null;
    create: (data: Partial<T>) => Promise<void>;
    update: (id: number, data: Partial<T>) => Promise<void>;
    delete: (id: number) => Promise<void>;
    refresh: () => Promise<void>;
  };
}
```

**Uso:**
```typescript
const { items, create, update, delete } = useCrud<Produto>('/produtos');
```

## 🎯 Fases de Implementação

### Fase 1: Componentes Base (4h)
1. Criar estrutura de diretórios
2. Implementar `SearchBar`
3. Implementar `EmptyState`
4. Implementar `LoadingState`
5. Implementar `Pagination`

### Fase 2: Componentes Principais (4h)
1. Implementar `CrudTable`
2. Implementar `CrudModal`
3. Criar testes unitários

### Fase 3: Hooks Reutilizáveis (3h)
1. Implementar `useCrud`
2. Implementar `usePagination`
3. Implementar `useFilters`
4. Implementar `useModal`

### Fase 4: Refatoração de Produtos (2h)
1. Criar `features/produtos/`
2. Criar `ProdutoForm.tsx`
3. Criar `produtosConfig.ts`
4. Refatorar `produtos.tsx`
5. Testar funcionalidades

### Fase 5: Documentação e Template (1h)
1. Documentar padrão
2. Criar template para novos CRUDs
3. Atualizar README

## 📊 Benefícios Esperados

| Métrica | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| Linhas por CRUD | 550 | 80 | 85% ↓ |
| Tempo criar CRUD | 8h | 30min | 94% ↓ |
| Código duplicado | Alto | Zero | 100% ↓ |
| Consistência | Baixa | Alta | ∞ ↑ |
| Manutenibilidade | Difícil | Fácil | ∞ ↑ |

## 🔄 Exemplo: Novo CRUD em 30min

Com os componentes genéricos, criar um CRUD de Clientes será:

```tsx
// pages/dashboard/clientes.tsx
import { CrudTable, SearchBar, CrudModal } from '@/shared/components';
import { useCrud, usePagination, useFilters, useModal } from '@/shared/hooks';
import { ClienteForm } from '@/features/clientes/components';
import { clientesConfig } from '@/features/clientes/config';

const PaginaClientes = () => {
  const { items, create, update, delete } = useCrud<Cliente>('/clientes');
  const { filteredItems, searchTerm, setSearchTerm } = useFilters(items);
  const { currentItems, ...pagination } = usePagination(filteredItems);
  const { isOpen, mode, selected, openCreate, openEdit, close } = useModal();

  return (
    <DashboardLayoutModerno title="Clientes">
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        onNew={openCreate}
      />
      
      <CrudTable
        data={currentItems}
        columns={clientesConfig.columns}
        onEdit={openEdit}
        onDelete={delete}
        pagination={pagination}
      />
      
      <CrudModal isOpen={isOpen} title={mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'} onClose={close}>
        <ClienteForm
          initialData={selected}
          onSubmit={mode === 'create' ? create : update}
        />
      </CrudModal>
    </DashboardLayoutModerno>
  );
};
```

**Total:** ~40 linhas + configuração

## ✅ Checklist de Implementação

### Fase 1: Componentes Base
- [ ] Criar `shared/components/SearchBar/SearchBar.tsx`
- [ ] Criar `shared/components/EmptyState/EmptyState.tsx`
- [ ] Criar `shared/components/LoadingState/LoadingState.tsx`
- [ ] Criar `shared/components/Pagination/Pagination.tsx`
- [ ] Testar componentes isoladamente

### Fase 2: Componentes Principais
- [ ] Criar `shared/components/CrudTable/CrudTable.tsx`
- [ ] Criar `shared/components/CrudTable/TableHeader.tsx`
- [ ] Criar `shared/components/CrudTable/TableRow.tsx`
- [ ] Criar `shared/components/CrudTable/TableActions.tsx`
- [ ] Criar `shared/components/CrudModal/CrudModal.tsx`
- [ ] Testar componentes

### Fase 3: Hooks
- [ ] Criar `shared/hooks/useCrud.ts`
- [ ] Criar `shared/hooks/usePagination.ts`
- [ ] Criar `shared/hooks/useFilters.ts`
- [ ] Criar `shared/hooks/useModal.ts`
- [ ] Testar hooks

### Fase 4: Refatoração Produtos
- [ ] Criar `features/produtos/hooks/useProdutos.ts`
- [ ] Criar `features/produtos/components/ProdutoForm.tsx`
- [ ] Criar `features/produtos/config/produtosConfig.ts`
- [ ] Refatorar `pages/dashboard/produtos.tsx`
- [ ] Testar CRUD completo

### Fase 5: Aplicar Padrão
- [ ] Refatorar `unidades.tsx`
- [ ] Refatorar `tipos-produto.tsx`
- [ ] Criar documentação
- [ ] Criar template

## 📝 Notas de Implementação

### Prioridades
1. **Alta:** Componentes genéricos e hooks
2. **Média:** Refatoração de produtos
3. **Baixa:** Aplicação em outras páginas

### Decisões Técnicas
- **TypeScript:** Usar generics para máxima reutilização
- **Testes:** Jest + React Testing Library
- **Storybook:** Documentar componentes visuais
- **Performance:** React.memo onde necessário

### Riscos
- ⚠️ Quebrar funcionalidades existentes → Testar incrementalmente
- ⚠️ Over-engineering → Manter simples, adicionar complexidade conforme necessário
- ⚠️ Curva de aprendizado → Documentar bem

## 🎓 Referências

- [React Component Patterns](https://react.dev/learn/thinking-in-react)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [SOLID Principles](https://konstantinlebedev.com/solid-in-react/)

## 🚀 Próximos Passos

1. **Amanhã:** Começar Fase 1 (Componentes Base)
2. **Revisar** este plano antes de iniciar
3. **Criar branch:** `refactor/generic-crud-components`
4. **Implementar** fase por fase
5. **Code review** incremental

---

**Última atualização:** 2025-11-20  
**Responsável:** Daniel da Rosa  
**Status:** 🟡 Planejado
