# Linha editorial — Allan Porto · Arquitetura (desde 04/11/2026)

**Ideia:** sair do "post pronto". O feed vira uma revista de arquitetura: fotografia em primeiro plano, frase curta, muito respiro.

## Identidade visual
- Papel off-white `#F4F1EC`, tinta `#1C1B19`, cinza `#8A847A`.
- Um acento por pilar: terracota `#B5652F` (varejo/projeto), petróleo `#2F5D62` (imóvel em dia/Kit), oliva `#6B7A4B` (casa/domingo).
- Títulos em **Cormorant Garamond** (serifa clássica, com itálico na palavra-chave); apoio em **Inter Tight** fina, caixa-alta espaçada.
- Sem etiquetas coloridas, caixas, emojis nas artes ou "setas de arrasta". Cabeçalho discreto: "Allan Porto · Arquitetura" + 01/05.
- Fotos: arquitetura real (Unsplash, créditos em `img/real/CREDITOS.md`) ou 3D do escritório com crédito. Nunca ilustração, nunca foto pessoal sem pedido.
- Gerador: `node editorial.mjs <data>` (tipos `capa`, `foto`, `moldura`, `frase`, `final`).

## Regras de texto
- Até ~8 palavras por slide; uma ideia por slide.
- 3 a 5 slides. Capa = foto + frase. Fecho = frase + 1 chamada.
- Legenda curta: frase da capa → 1 linha de resumo → 1 CTA → assinatura → 5 a 6 hashtags.
- Varejo: CTA "Comente VENDA". Imóvel em dia: aviso "conteúdo educativo, cada caso precisa de advogado". Sem promessa jurídica.

## Semana-padrão (10h, 1 post/dia)
| Dia | Pilar | O que entra |
|---|---|---|
| Seg | Varejo | Uma decisão de projeto que vende (luz, vitrine, percurso, caixa) |
| Ter | Imóvel em dia | Usucapião / escritura / documentação, educativo |
| Qua | Morar bem | Casa e reforma: luz, ventilação, espaço |
| Qui | Varejo | Fachada, identidade, ponto de venda |
| Sex | Referência | Uma obra/um detalhe de arquitetura e o que ele ensina |
| Sáb | Oferta | Kit Usucapião PRO ou Loja que Vende (uma vez por semana) |
| Dom | Respiro | 3 slides, uma frase e uma pergunta leve |

## Rotina
- **Sexta 9:52:** preparo os 7 posts da semana seguinte e envio a prévia.
- **Todo dia 10h:** publica o post do dia se estiver `aprovado`.
