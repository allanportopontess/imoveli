# Instagram — Allan Porto ® (posts diários)

Automação de posts diários no Instagram. Claude cria o conteúdo, renderiza as artes, hospeda as imagens neste repositório (público) e publica via Windsor.ai **somente após aprovação do Allan**.

## Fluxo

| Quando (Brasília) | Rotina | O que acontece |
|---|---|---|
| Sexta, 09:52 | Instagram: preparar posts da próxima semana | Claude cria os 7 posts da semana seguinte (`status: aguardando_aprovacao`), renderiza, faz push e envia a prévia |
| após o "ok" | — | Posts aprovados passam para `status: aprovado` |
| Todo dia, 18:30 | Instagram: publicar post do dia | Publica o post do dia via Windsor **somente se** `status == aprovado` e marca `publicado` |

Post sem aprovação **não** é publicado.

## Calendário editorial

| Dia | Pilar (`pilar`) | Exemplos de pauta |
|---|---|---|
| Seg | `varejo` | Layout de loja, fluxo de cliente, zona de descompressão |
| Ter | `usucapiao` | Usucapião, regularização, documentação de imóvel |
| Qua | `arquitetura` | Dicas de arquitetura da vida real (casa, reforma, erros comuns) |
| Qui | `varejo` | Iluminação comercial, vitrinismo, PDV e checkout |
| Sex | `projeto` | Projeto do portfólio (usa fotos enviadas pelo Allan; sem fotos → dica) |
| Sáb | `venda` | Oferta direta: Kit Usucapião PRO / Cartilha Imóvel em Dia 360 |
| Dom | `arquitetura` | Antes e depois, mitos, perguntas e respostas |

Regras de conteúdo:
- Carrossel de 5 a 8 slides: capa com gancho, 1 ideia por slide, CTA no final.
- Legenda: gancho → resumo em lista → CTA (salvar, comentar, direct) → 8 a 12 hashtags do nicho.
- Posts de venda levam CTA "link na bio" (o link na bio deve ter `?src=instagram&sck=organico_AAAAMMDD`).
- **ManyChat "Comenta VENDA"** (ativo): quem comenta VENDA recebe no direct o checklist grátis do Loja que Vende (`utm_medium=dm`). Use a chamada **só em posts de varejo/loja** (pilares `varejo`, `projeto` comercial e Reels do Loja que Vende): no slide final ("Comente VENDA e receba o checklist grátis no direct") e na legenda, antes das hashtags. Não use em posts de usucapião, casa ou Kit (atrairia lead errado).
- Nada de promessa jurídica: conteúdo de usucapião é educativo, sem garantir resultado.

## Comandos

```bash
cd marketing/instagram
npm install
node render.mjs 2026-10-04   # gera posts/2026-10-04/slide-01.jpg ...
```

URL pública de cada slide (usada na publicação):
`https://raw.githubusercontent.com/allanportopontess/imoveli/<branch>/marketing/instagram/posts/<data>/slide-01.jpg`

## Formato do `post.json`

```json
{
  "data": "2026-10-04", "horario": "18:30", "pilar": "varejo",
  "status": "aguardando_aprovacao | aprovado | publicado | rejeitado",
  "kicker": "Arquitetura de varejo",
  "slides": [
    { "tipo": "capa", "titulo": "...", "texto": "..." },
    { "numero": "01", "titulo": "...", "texto": "texto com **destaque**" },
    { "tipo": "cta", "kicker": "...", "titulo": "...", "texto": "...", "botao": "..." }
  ],
  "legenda": "..."
}
```
