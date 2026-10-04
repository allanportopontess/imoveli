// Filtros puros (sem navegador) — testáveis offline.
const normalizar = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// "R$ 1.500,00" → 1500 ; retorna todos os valores encontrados no texto
function extrairValores(texto) {
  const achados = normalizar(texto).match(/r\$\s*[\d.]+(,\d{2})?/g) || [];
  return achados.map((v) => Number(v.replace(/r\$\s*/, '').replace(/\./g, '').replace(',', '.')));
}

function classificarOrcamento(texto, valorMinimo) {
  const valores = extrairValores(texto);
  if (!valores.length) {
    return /aberto|a combinar|negociar/.test(normalizar(texto)) ? 'aberto' : 'desconhecido';
  }
  return Math.max(...valores) >= valorMinimo ? 'ok' : 'abaixo';
}

function avaliar(projeto, filtros) {
  const texto = normalizar(`${projeto.titulo} ${projeto.descricao}`);
  const termoExcluido = filtros.excluir.find((t) => texto.includes(normalizar(t)));
  if (termoExcluido) return { aceito: false, motivo: `exclui: "${termoExcluido}"` };
  const termoIncluido = filtros.incluir.find((t) => texto.includes(normalizar(t)));
  if (!termoIncluido) return { aceito: false, motivo: 'fora do perfil' };
  const orc = classificarOrcamento(projeto.orcamento, filtros.valorMinimo);
  if (orc === 'abaixo') return { aceito: false, motivo: 'orçamento abaixo do mínimo' };
  if (orc !== 'ok' && !filtros.manterOrcamentoAberto) return { aceito: false, motivo: 'orçamento não informado' };
  return { aceito: true, motivo: `perfil: "${termoIncluido}"`, orcamento: orc };
}

module.exports = { normalizar, extrairValores, classificarOrcamento, avaliar };
