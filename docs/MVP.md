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

### ✅ 4. Perfil público do profissional

**O que faz**: Painel público acessível pelo SPA com nome, especialidade, RT responsável, cidade/estado, reputação.
**Concluído quando**:
- [x] GET /api/perfil/:tipo/:id retorna perfil seguro (sem email, telefone, CPF)
- [x] Exibe cidade e estado no perfil
- [x] RT responsável aparece com conselho e registro
- [x] Back button com rastreio de página anterior (state.prevPage)
- [x] XSS: escapeHtml() aplicado nos campos renderizados

### ✅ 5. Demanda de cliente

**O que faz**: Cliente posta demanda com e-mail, descrição, especialidade, cidade, orçamento. Sem conta necessária.
**Concluído quando**:
- [x] Formulário completo na página "Demandas"
- [x] POST /api/demandas sem auth (cliente posta apenas com e-mail)
- [x] GET /api/demandas/disponiveis carrega lista pública
- [x] RT verificado pode propor serviço em demandas abertas
- [x] Feedback visual de sucesso/erro inline

### ✅ 6. Match inteligente

**O que faz**: Dado uma busca, retorna profissionais com score composto (técnica, preço, localização, reputação).
**Concluído quando**:
- [x] POST /api/match com score multicritério implementado
- [x] handleBuscarMatch() wired ao botão na página de match
- [x] Resultados exibem: nome, especialidade, grau, distância, reputação, score
- [x] XSS: escapeHtml() aplicado em todos os campos dos resultados
- [x] Botão "Contratar" abre modal de serviço direto
- [x] Botão "Postar Demanda" redireciona para form com especialidade pré-preenchida

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
