# AI.md — IMOVELI

> Decisões, prompts e evoluções de IA.
> Mantenedor: ai-architect

## Stack atual

| Componente | Tecnologia | Modelo |
|-----------|-----------|--------|
| Chatbot | Anthropic SDK | claude-3-5-sonnet-20241022 |
| Embeddings | — | (futuro: text-embedding-3-small) |
| Busca vetorial | — | (futuro: pgvector) |

## Endpoint do chatbot

```
POST /api/chat
Body: { mensagens: [{role, content}], contexto?: string }
Response: { success, resposta }
```

O campo `contexto` injeta dados do usuário logado no system prompt, permitindo respostas personalizadas.

## System Prompt — v2 (atual)

**Data**: 2026-09-01
**Motivo**: Substituir prompt genérico por especialista em construção civil brasileira
**Tokens médios**: ~800 input (com histórico) / ~400 output

Domínios cobertos:
- Patologias construtivas (rachaduras, infiltrações, recalque, eflorescência)
- Materiais e estruturas (concreto, aço, fundações, lajes)
- Instalações (elétrica NBR 5410, hidráulica NBR 5626/8160, HVAC, SPDA)
- Normas ABNT (6118, 6120, 9050, 15575, 14037)
- Orçamento (SINAPI, BDI, curva ABC)
- Regularização (usucapião, REURB, habite-se, AVCB)
- Conselhos profissionais (CREA/ART, CAU/RRT)
- Plataforma IMOVELI (CRT, Match, Leilão Reverso)

Regras de comportamento:
1. Técnico + acessível + direto
2. Citar normas quando relevante
3. Dizer "confirme com o RT" quando incerto
4. Nunca inventar números de normas ou prazos

**Arquivo**: `backend/server-pg.js` — constante `CHAT_SYSTEM_PROMPT`

## Evolução planejada

### v3 — Contexto enriquecido (próximo)
- Injetar histórico de serviços do profissional no contexto
- Injetar demandas abertas da região do cliente
- Personalizar tom por tipo de usuário (RT vs. cliente leigo)

### v4 — RAG sobre normas técnicas
- Ingerir PDFs: NBR 6118, NBR 15575, NBR 9050, Lei 13.465/2017
- Embeddings via API + armazenar no PostgreSQL com pgvector
- Chatbot busca trechos antes de responder → respostas com citação exata

### v5 — Análise de demanda
- Cliente descreve problema → IA extrai especialidade, urgência, orçamento
- Retorna: top 3 profissionais com match score explicado

### v6 — Diagnóstico por foto (visão computacional)
- Cliente envia foto de patologia
- Claude Vision classifica: tipo, urgência, profissional necessário
- Gera relatório preliminar com recomendação de ART

## Match Inteligente — algoritmo atual

```javascript
// Estado atual: filtro simples por especialidade
// Dados: prestadores com especialidade LIKE '%tipo%' e cidade == cidade_cliente

// Evolução para score ponderado:
function calcularScore(profissional, demanda) {
  const especialidade = matchEspecialidade(profissional, demanda);  // 0-1
  const preco = matchPreco(profissional, demanda);                  // 0-1
  const distancia = matchDistancia(profissional, demanda);          // 0-1
  const avaliacao = profissional.media_avaliacao / 5;               // 0-1
  const experiencia = Math.min(profissional.total_servicos / 50, 1); // 0-1

  return (
    especialidade * 0.35 +
    preco        * 0.25 +
    distancia    * 0.20 +
    avaliacao    * 0.15 +
    experiencia  * 0.05
  );
}
```

## Custo e limites

| Recurso | Limite atual | Custo estimado |
|---------|-------------|---------------|
| Anthropic API | — | ~$0.003/1k tokens input, $0.015/1k output |
| Max tokens por request | 2048 output | OK para MVP |
| Rate limit | 1000 req/min | OK para MVP |

**Em produção**: logar tokens consumidos por request para monitorar custo.
