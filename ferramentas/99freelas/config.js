// Configuração do robô 99freelas. Credenciais vêm SEMPRE de variáveis de ambiente.
module.exports = {
  baseUrl: 'https://www.99freelas.com.br',
  loginPath: '/login',
  // Listagem de projetos da categoria Engenharia & Arquitetura (confirmar slug ao liberar o domínio)
  listagemPath: '/projects?categoria=engenharia-e-arquitetura',
  paginasMax: 5,

  filtros: {
    valorMinimo: 600,
    // Orçamento "Aberto"/"A combinar": manter na lista, marcado para conferência
    manterOrcamentoAberto: true,
    // Basta UM termo para entrar
    incluir: [
      'projeto arquitet', 'arquitet', 'residencia', 'residencial', 'casa', 'sobrado',
      'comercial', 'fachada', 'layout', 'loja', 'planta baixa', 'ponto comercial',
    ],
    // Qualquer termo destes exclui o projeto
    excluir: ['detalhamento', 'detalhar', 'projeto executivo', 'executivo'],
  },

  // Seletores: palpites iniciais; ajustar com `node buscar.js --diagnostico`
  seletores: {
    loginEmail: '#email',
    loginSenha: '#senha',
    loginBotao: '#btnEfetuarLogin',
    logadoIndicador: 'a[href*="logout"], a[href*="sair"]',
    cardProjeto: 'li.result-item, .projects-result li',
    cardTitulo: 'h1 a, h2 a, .title a',
    cardDescricao: '.description, .item-text',
    cardOrcamento: '.information, .budget',
    detalheDescricao: '.project-description, .item-text',
    detalheOrcamento: '.project-budget, .information',
    propostaBotao: 'a[href*="proposta"], button:has-text("Enviar proposta")',
    propostaValor: 'input[name="oferta"], input[name="valor"]',
    propostaPrazo: 'input[name="duracao"], input[name="prazo"]',
    propostaTexto: 'textarea[name="proposta"], textarea',
    propostaEnviar: 'button[type="submit"]:has-text("Enviar")',
  },
};
