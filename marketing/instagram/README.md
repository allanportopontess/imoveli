# Instagram — Allan Porto ® (posts diários)

Automação de posts diários no Instagram. Claude cria o conteúdo, renderiza as artes, hospeda as imagens neste repositório (público) e publica via Windsor.ai **somente após aprovação do Allan**.

## Fluxo diário

| Horário (Brasília) | O que acontece |
|---|---|
| 09:52 | Rotina dispara: Claude escreve `posts/AAAA-MM-DD/post.json`, renderiza as artes e faz push |
| logo depois | Claude envia a prévia (slides + legenda) para aprovação |
| após o "ok" | Post fica agendado para **18:30** |
| 18:30 | Claude publica via Windsor (`create_carousel_post`) e registra o `status` no `post.json` |

Sem aprovação até 18:30, o post **não** é publicado. Ele fica com status `aguardando_aprovacao`.

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
