# MVP.md — IMOVELI

> O que precisa estar pronto para o primeiro usuário real.
> Mantenedor: product-strategist

## Definição de MVP

Um Responsável Técnico real consegue se cadastrar, verificar seu CREA/CAU, indicar um profissional e esse profissional aparece disponível para um cliente contratar.

**Critério de sucesso do MVP**: 10 Responsáveis Técnicos ativos, 30 profissionais indicados, 5 demandas fechadas.

## Features do MVP — detalhamento

### ✅ 1. Cadastro e verificação de RT

**O que faz**: RT entra com nome, CREA/CAU, UF, e-mail, senha. Sistema valida e cria perfil.
**Concluído quando**:
- [ ] Formulário de cadastro funciona
- [ ] Dados persistem no banco
- [ ] E-mail de boas-vindas enviado (ou logar no console)
- [ ] RT consegue fazer login e ver seu dashboard
- [ ] Status começa como "pendente" e admin pode aprovar

### ✅ 2. Indicação de profissional pelo RT

**O que faz**: RT indica profissional com nome, telefone, especialidade (multi-seleção das 50+ categorias), escopo.
**Concluído quando**:
- [x] Formulário multi-seleção de categoria funciona
- [x] Dados persistem em `indicacoes` + `prestadores`
- [x] Profissional aparece no painel "Meus Profissionais" do RT
- [x] Toggle público/privado funciona

### ✅ 3. Cadastro do perfil do profissional

**O que faz**: RT indica profissional com perfil completo: nome, e-mail, telefone, categoria(s), cidade, estado.
**Escopo**:
- Nome, e-mail (opcional), telefone
- Profissão (da taxonomia existente, multi-seleção)
- Cidade, Estado (dropdown UF)
- Escopo de serviços autorizados pelo RT
**Fora do escopo**: avaliações, trust score, portfólio, pagamentos

**Concluído quando**:
- [x] Campos email, cidade, estado no formulário frontend
- [x] Backend persiste email, cidade, estado em `prestadores`
- [x] PUT /api/prestadores/:id/perfil para atualizações futuras
- [x] Ownership check: fiador só indica em seu próprio cadastro (IDOR fix)
- [x] Auth em GET /indicados, POST aceitar/recusar (endpoints desprotegidos corrigidos)
- [x] XSS fix: escapeHtml() em loadIndicados()
- [x] security-reviewer auditou (commit 5c7b412)

### ⏳ 4. Perfil público do profissional

**O que faz**: Página pública acessível por URL com foto, nome, especialidade, RT responsável.
**Concluído quando**:
- [ ] URL pública `/p/[id]` retorna perfil
- [ ] RT responsável aparece com link
- [ ] Sem dados sensíveis expostos (e-mail, telefone ocultos no público)

### ⏳ 5. Cadastro de cliente e demanda

**O que faz**: Cliente cadastra uma demanda (tipo de serviço, descrição, cidade, orçamento).
**Concluído quando**:
- [ ] Formulário de demanda funciona
- [ ] Match básico retorna profissionais por especialidade + cidade
- [ ] Cliente consegue escolher e "fechar"

### ⏳ 6. Match básico

**O que faz**: Dado uma demanda, retorna os profissionais com especialidade + cidade compatíveis.
**Concluído quando**:
- [ ] Endpoint `/api/match` funciona
- [ ] Retorna score simples
- [ ] Resultado exibido para o cliente com opção de contato

## Fluxo completo do MVP

```
RT cadastra → Admin aprova → RT indica profissional
                                  ↓
                         Profissional completa perfil
                                  ↓
                         Perfil público disponível
                                  ↓
                    Cliente cadastra demanda
                                  ↓
                    Match retorna profissionais
                                  ↓
                    Cliente escolhe → Contato
```

## Critério de "done" global

Uma feature só é considerada entregue quando:
1. Funciona no fluxo feliz
2. Trata erros visíveis ao usuário
3. Não quebrou features existentes
4. security-reviewer auditou
5. qa-reviewer declarou APROVADO
