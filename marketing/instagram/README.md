# Instagram — Allan Porto ® (posts diários)

Automação de posts diários no Instagram. Claude cria o conteúdo, renderiza as artes, hospeda as imagens neste repositório (público) e publica via Windsor.ai **somente após aprovação do Allan**.

## Fluxo

| Quando (Brasília) | Rotina | O que acontece |
|---|---|---|
| Sexta, 09:52 | Instagram: preparar posts da próxima semana | Claude cria os 7 posts da semana seguinte (`status: aguardando_aprovacao`), renderiza, faz push e envia a prévia |
| após o "ok" | — | Posts aprovados passam para `status: aprovado` |
| Todo dia, 18:30 | Instagram: publicar post do dia | Publica o post do dia via Windsor **somente se** `status == aprovado` e marca `publicado` |

Post sem aprovação **não** é publicado.

**Autorização permanente (Allan, 29/10/2026):** a rotina das 18:30 publica sem nova confirmação o post do dia com `status: aprovado` (máx. 1/dia); a rotina de sexta cria os 7 posts no padrão atual e envia para aprovação (não publica). Fotos novas: `python3 tools/busca_unsplash.py "termo"`.

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
- **Máximo 1 post no feed por dia.** Se entrar um post extra (ex.: Reels avulso), o post agendado daquele dia é adiado e a semana é empurrada 1 dia. A rotina das 18:30 não publica se já houver post no feed no mesmo dia.
- Carrossel de 5 a 8 slides: capa com gancho, 1 ideia por slide, CTA no final.
- Legenda: gancho → resumo em lista → CTA (salvar, comentar, direct) → 8 a 12 hashtags do nicho.
- Posts de venda levam CTA "link na bio". A bio aponta para `lojaquevende.allanportoarquiteto.com.br/links/?utm_source=instagram&utm_medium=bio` (ativo desde 05/10): checklist grátis em destaque, curso Loja que Vende e Kit Usucapião PRO (`pay.hotmart.com/C106999952U`, com `src=instagram&sck=bio_kit`).
- **ManyChat "Comenta VENDA"** (ativo, testado em 05/10): quem comenta VENDA recebe no direct o checklist grátis do Loja que Vende (`utm_medium=dm`). Use a chamada **só em posts de varejo/loja** (pilares `varejo`, `projeto` comercial e Reels do Loja que Vende): no slide final ("Comente VENDA e receba o checklist grátis no direct") e na legenda, antes das hashtags. Não use em posts de usucapião, casa ou Kit (atrairia lead errado).
- Nada de promessa jurídica: conteúdo de usucapião é educativo, sem garantir resultado.
- **Estilo visual (desde 30/10, pedido do Allan): carrossel "pro/viral" sem fotos pessoais.** `node pro.mjs <pasta>` lê `posts/<pasta>/pro.json`. Tipos: `capa_spot` (capa clara, tipografia gigante Inter Tight, linha preenchida com imagem, frase manuscrita), `numero` (fundo escuro, #n apagado, título em degradê, etiquetas, imagem emoldurada), `frase` (frase gigante sobre foto + CTA), `duplo` (EVITE ISSO / PREFIRA ISSO em fundo amarelo) e `tabela` (título em caixa preta + ilustração + coluna com lista). Toda imagem é foto real (Unsplash, licença de uso comercial livre, lista em `img/real/CREDITOS.md`) ou 3D do escritório (com crédito); recortes de pessoas feitos com rembg. Tipo `foco` = foto em tela cheia com etiqueta, título curto e marcação da ação (`marca`/`cota`). Nada de ilustração 2D/cartoon (pedido do Allan em 30/10); textos curtos e diretos. Temas: `lima`, `ambar`, `azul`.
- **Estilo anterior (13/10, pedido do Allan): post de TikTok/Instagram claro.** Fundo creme pontilhado, títulos em Impact (renderizado com Anton, mesma família) com palavras coloridas (rosa, azul, laranja, verde), textos de apoio em serifa (Instrument Serif), legendas em caixas brancas estilo TikTok, resposta/palavra-chave gigante com contorno e sombra preta, cards com borda preta. Fotos do Allan em `img/allan-selfie-*.jpg` (uma por slide). Gerar com `node tiktok.mjs <pasta>` a partir de `posts/<pasta>/criador.json` (tipos `capa`, `chat`, `close`; `titulo_imp` = título em Impact; `*x*` = palavra colorida, `**x**` = marca-texto amarelo). Alternativas: `criador.mjs` (escuro), `viral.mjs` (claro influencer), `render.mjs` (só texto).

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
