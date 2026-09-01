# /nova-feature — Scaffolding de feature nova para IMOVELI

Use: `/nova-feature [nome da feature]`

Este comando usa o agente `feature-builder` para criar uma feature completa do zero.

## O que o agente vai fazer:
1. Perguntar os detalhes da feature (se não fornecidos)
2. Analisar o schema SQL e rotas existentes
3. Criar/alterar tabelas no banco se necessário
4. Adicionar rotas no backend (`server-pg.js`)
5. Adicionar UI no frontend (`index.html`)
6. Testar a integração

## Exemplos de uso:
- `/nova-feature sistema de avaliações`
- `/nova-feature upload de foto de perfil real`
- `/nova-feature notificações in-app`
- `/nova-feature painel de demandas do cliente`
- `/nova-feature busca com filtros`
- `/nova-feature onboarding wizard para RT novo`

O agente `feature-builder` tem todas as instruções de padrão de código do IMOVELI e vai seguir as convenções existentes.
