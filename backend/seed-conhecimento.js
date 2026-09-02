require('dotenv').config();
const { query, testConnection } = require('./db-pg');

const conhecimentos = [

  // ========== NORMAS REGULAMENTADORAS (NRs) ==========
  {
    categoria: 'NR',
    titulo: 'NR-1 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais',
    numero: 'NR-1',
    descricao: 'Estabelece a obrigatoriedade do Gerenciamento de Riscos Ocupacionais (GRO) e do Programa de Gerenciamento de Riscos (PGR) para todos os empregadores.',
    conteudo: `NR-1 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais (atualizada em 2020).
Obrigações do empregador: identificar perigos, avaliar e classificar riscos, elaborar o PGR (Programa de Gerenciamento de Riscos), implementar medidas de prevenção e monitorar sua eficácia.
PGR substitui o PPRA (NR-9) e o PCMSO passa a ser complementar.
Inventário de Riscos: mapa documental de todos os perigos no ambiente de trabalho.
Plano de Ação: medidas de eliminação, neutralização ou controle de riscos com prazos definidos.
Aplica-se a todos os estabelecimentos que possuam empregados regidos pela CLT.
Na construção civil, o PGR deve contemplar todos os riscos de obra: quedas, soterramento, eletricidade, ruído, poeira, agentes químicos.`,
    tags: ['GRO', 'PGR', 'riscos ocupacionais', 'segurança trabalho', 'PPRA'],
    vigente: true,
    fonte_url: 'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-01-atualizada-2020.pdf'
  },
  {
    categoria: 'NR',
    titulo: 'NR-5 — Comissão Interna de Prevenção de Acidentes (CIPA)',
    numero: 'NR-5',
    descricao: 'Regulamenta a CIPA — comissão paritária que identifica riscos e propõe medidas preventivas nas empresas.',
    conteudo: `NR-5 — CIPA (Comissão Interna de Prevenção de Acidentes).
Obrigatória para empresas com número de empregados acima do mínimo definido no Quadro I por atividade econômica (CNAE).
Construção civil (CNAE 41/42/43): exige CIPA quando há 70+ empregados. Abaixo disso, designar responsável pela segurança.
Composição: representantes do empregador e eleitos pelos empregados. Mandato de 1 ano.
Atribuições: identificar riscos no processo de trabalho, elaborar mapa de riscos, participar na implementação e controle do PGR, investigar acidentes.
Reunião ordinária mensal. Atas devem ser registradas e disponibilizadas.
SIPAT (Semana Interna de Prevenção de Acidentes do Trabalho): obrigatória anualmente.`,
    tags: ['CIPA', 'comissão prevenção', 'segurança trabalho', 'SIPAT', 'mapa de riscos'],
    vigente: true
  },
  {
    categoria: 'NR',
    titulo: 'NR-6 — Equipamentos de Proteção Individual (EPI)',
    numero: 'NR-6',
    descricao: 'Define as obrigações de empregadores e empregados quanto ao fornecimento, uso e conservação dos EPIs, e lista os equipamentos aprovados pelo MTE.',
    conteudo: `NR-6 — Equipamentos de Proteção Individual (EPI).
O empregador é obrigado a: fornecer o EPI adequado ao risco, de forma gratuita, em perfeito estado de conservação e funcionamento.
EPI deve ter Certificado de Aprovação (CA) emitido pelo Ministério do Trabalho.
EPIs essenciais na construção civil:
- Capacete (proteção da cabeça): CA obrigatório. Classes A, B (elétrica) e C.
- Cinto de segurança tipo paraquedista (NR-35, trabalho em altura acima de 2m).
- Calçado de segurança (bota ou sapato com biqueira de aço e palmilha antiestática).
- Luvas (conforme agente: vibração, químico, térmico, mecânico).
- Óculos de proteção e protetor facial.
- Protetor auricular (ambientes com ruído ≥ 85 dB — NR-15 Anexo 1).
- Respirador (poeira de sílica, tintas, solventes).
- Colete refletivo em obras com trânsito.
O empregado é obrigado a usar o EPI fornecido e zelar por sua conservação.
O empregador deve registrar entrega e treinamento no Livro de Registro de EPI.`,
    tags: ['EPI', 'capacete', 'cinto segurança', 'calçado segurança', 'proteção individual'],
    vigente: true
  },
  {
    categoria: 'NR',
    titulo: 'NR-8 — Edificações',
    numero: 'NR-8',
    descricao: 'Estabelece requisitos técnicos mínimos para garantir segurança e conforto nas edificações onde os trabalhadores exercem suas atividades.',
    conteudo: `NR-8 — Edificações.
Aplica-se a todos os locais de trabalho, exigindo que as edificações ofereçam garantias de segurança e conforto.
Pisos: material resistente, nivelado, antiderrapante. Declive máximo de 1:20 (5%) para escoamento de água.
Paredes, coberturas e tetos: materiais resistentes, vedação contra intempéries. Pé-direito mínimo: 3m em locais de trabalho.
Circulação: largura mínima 1,20m para circulação principal, 0,90m para secundária.
Escadas: degraus com espelho máximo 19,5cm e piso mínimo 25cm. Corrimão obrigatório em ambos os lados quando > 5 degraus.
Iluminação natural e artificial adequada conforme NR-17 e NBR 5413.
Instalações sanitárias: 1 vaso para cada 20 trabalhadores do sexo masculino; 1 para cada 20 do feminino. Mictório: 1 para cada 20 homens.
Alojamentos de obra (canteiro): pé-direito mínimo 2,60m, área mínima 3m² por trabalhador.`,
    tags: ['edificações', 'piso', 'escadas', 'sanitários', 'alojamento obra', 'pé-direito'],
    vigente: true
  },
  {
    categoria: 'NR',
    titulo: 'NR-10 — Segurança em Instalações e Serviços em Eletricidade',
    numero: 'NR-10',
    descricao: 'Estabelece requisitos e condições mínimas para garantir a segurança e saúde dos trabalhadores em instalações elétricas.',
    conteudo: `NR-10 — Segurança em Instalações e Serviços em Eletricidade.
Aplica-se a todos que trabalham em instalações elétricas em qualquer etapa: projeto, construção, montagem, operação, manutenção.
Trabalhadores que atuam em instalações elétricas devem ser qualificados e ter treinamento específico em NR-10 (40h básico ou 40h + SEP para sistemas energizados).
Habilitação: trabalhador deve ser habilitado (diploma técnico/engenharia) ou qualificado (treinamento específico).
Prontuário de instalações elétricas: documento obrigatório com projetos, diagramas unifilares, especificações de equipamentos.
Zona controlada (até 1m do ponto energizado BT / distâncias variáveis AT): acesso restrito.
Bloqueio e sinalização (LOTO — Lockout/Tagout): obrigatório antes de qualquer serviço em instalação elétrica.
Na construção: extensões elétricas devem ter aterramento, DJ, cabos protegidos. Proibido uso de fios pelados ou adaptadores improvisados.
Quadros elétricos temporários de obra: devem ter DR (diferencial residual) e disjuntores por circuito.`,
    tags: ['eletricidade', 'NR-10', 'instalação elétrica', 'aterramento', 'quadro elétrico obra', 'LOTO'],
    vigente: true
  },
  {
    categoria: 'NR',
    titulo: 'NR-12 — Segurança no Trabalho em Máquinas e Equipamentos',
    numero: 'NR-12',
    descricao: 'Define referências técnicas e medidas preventivas para garantir saúde e integridade física dos trabalhadores no uso de máquinas e equipamentos.',
    conteudo: `NR-12 — Segurança no Trabalho em Máquinas e Equipamentos.
Aplica-se amplamente à construção civil: betoneiras, gruas, guinchos, marteletes, compactadores, cortadoras de disco, esmerilhadeiras, etc.
Requisitos principais:
- Proteções fixas e móveis em partes móveis (transmissão, lâminas, discos).
- Dispositivo de partida e parada de fácil acesso, identificado.
- Sinalização de segurança e distâncias mínimas de segurança.
- Manual de instruções em português.
- Manutenção preventiva documentada.
- Operação somente por trabalhador qualificado.
Grua/torre de içamento: projeto estrutural assinado por RT, cálculo de estabilidade, inspeção periódica, operador com habilitação.
Betoneira: proteção da coroa e pinhão, proteção da boca do tambor, chave fim-de-curso.
Esmerilhadeira: uso com EPI (óculos, face shield, luvas) e disco para o material correto.`,
    tags: ['NR-12', 'máquinas', 'equipamentos', 'betoneira', 'grua', 'esmerilhadeira', 'segurança'],
    vigente: true
  },
  {
    categoria: 'NR',
    titulo: 'NR-18 — Condições e Meio Ambiente de Trabalho na Indústria da Construção (PCMAT)',
    numero: 'NR-18',
    descricao: 'Principal norma de segurança para canteiros de obras. Define requisitos para o Programa de Condições e Meio Ambiente de Trabalho (PCMAT) e instalações no canteiro.',
    conteudo: `NR-18 — Condições e Meio Ambiente de Trabalho na Indústria da Construção.
Obrigatória para todo canteiro de obras. Empresas com 20+ trabalhadores devem elaborar o PCMAT (Programa de Condições e Meio Ambiente de Trabalho).
PCMAT deve ser elaborado por profissional legalmente habilitado (engenheiro de segurança ou técnico de segurança) e aprovado pelo SESMT ou pelo CIPA.
Instalações sanitárias: separadas por sexo, laváveis, 1 vaso/20 trabalhadores, papel higiênico, sabonete, toalha.
Vestiários: armários individuais com cadeado. Área mínima de 1,5m² por trabalhador.
Refeitório: local limpo, coberto, bancadas e assentos, aquecedor de alimentos, lavatório com água potável.
Cozinha: se houver, geladeira, fogão, pia com água encanada, exaustor.
Área de lazer: obrigatória quando há 50+ trabalhadores.
Tapumes: obra em área urbana — altura mínima 2,20m, sinalizados à noite.
Andaimes: fachadeiros com guarda-corpo (h ≥ 90cm), rodapé (h ≥ 15cm), travamento. Suporte de carga calculado e assinado por RT.
Escadas e rampas de acesso: corrimão, largura ≥ 80cm.
Proteção coletiva contra queda: guarda-corpo e redes (desde 2m de altura).
Proibição de trabalho em altura sem EPI anti-queda e ancoragem.`,
    tags: ['NR-18', 'PCMAT', 'canteiro obras', 'andaime', 'tapume', 'construção civil', 'guarda-corpo'],
    vigente: true
  },
  {
    categoria: 'NR',
    titulo: 'NR-35 — Trabalho em Altura',
    numero: 'NR-35',
    descricao: 'Estabelece requisitos mínimos para o trabalho em altura (acima de 2m do nível inferior), visando à prevenção de acidentes por queda.',
    conteudo: `NR-35 — Trabalho em Altura.
Define trabalho em altura: toda atividade executada acima de 2,00m do nível inferior, onde haja risco de queda.
Obrigações do empregador:
- Garantir que o trabalho em altura só inicie após verificação de que as medidas de controle foram implementadas.
- Elaborar Análise de Risco (AR) e Permissão de Trabalho (PT) para trabalho em altura não rotineiro.
- Capacitar o trabalhador (mínimo 8h teórico-práticas, renovar a cada 2 anos ou mudança de risco).
Obrigações do trabalhador:
- Usar o cinto de segurança tipo paraquedista com talabarte duplo.
- Inspecionar o EPI antes de cada uso.
- Comunicar qualquer anomalia no sistema de proteção.
Sistemas de ancoragem: ponto fixo estrutural, linha de vida horizontal ou vertical, conforme projeto de RT.
Resgate: plano de resgate em caso de queda (suspensão em cinto — síndrome do arnês: risco de morte em 15 min).
Andaime: deve ter guarda-corpo e rodapé. Montagem/desmontagem por profissional qualificado.
Proibição de trabalho em altura em condições climáticas adversas (raios, ventos fortes).`,
    tags: ['NR-35', 'trabalho altura', 'queda', 'cinto paraquedista', 'talabarte', 'ancoragem', 'andaime'],
    vigente: true
  },

  // ========== NORMAS TÉCNICAS (NBRs) ==========
  {
    categoria: 'NBR',
    titulo: 'NBR 6118 — Projeto de Estruturas de Concreto Armado',
    numero: 'NBR 6118',
    descricao: 'Principal norma brasileira para projeto e execução de estruturas de concreto armado e protendido. Define requisitos de segurança, durabilidade, desempenho e dimensionamento.',
    conteudo: `ABNT NBR 6118:2014 — Projeto de estruturas de concreto — Procedimento.
Cobertura: projeto, dimensionamento, detalhamento e verificação de estruturas de concreto armado e protendido.
Aspectos principais:
- Resistência do concreto: fck mínimo de 20 MPa para concreto armado (25 MPa em ambientes agressivos).
- Cobrimento mínimo das armaduras: varia conforme classe de agressividade ambiental (CAA I a IV). Ex: CAA II urbano — 25mm para laje, 30mm para vigas/pilares.
- Armadura mínima: taxa mínima de armadura longitudinal em vigas e pilares.
- Ductilidade: exigência de rotação plástica para redistribuição de esforços.
- Estados Limite Último (ELU) e Estado Limite de Serviço (ELS): verificações obrigatórias.
- Durabilidade: vida útil de projeto (VUP) mínima de 50 anos para estruturas correntes.
- Detalhamento: espaçamento mínimo entre barras, ganchos, emendas por traspasse.
ART/RRT obrigatório para projeto estrutural e para execução (responsabilidade do RT).`,
    tags: ['NBR 6118', 'concreto armado', 'estrutura', 'fck', 'cobrimento', 'armadura', 'dimensionamento'],
    vigente: true
  },
  {
    categoria: 'NBR',
    titulo: 'NBR 6120 — Cargas para o Cálculo de Estruturas de Edificações',
    numero: 'NBR 6120',
    descricao: 'Define os valores mínimos de cargas variáveis (sobrecargas) que devem ser considerados no projeto estrutural de edificações.',
    conteudo: `ABNT NBR 6120:2019 — Ações para o cálculo de estruturas de edificações.
Classifica as cargas em:
- Ações permanentes: peso próprio da estrutura, revestimentos fixos, instalações permanentes.
- Ações variáveis: sobrecargas de uso (pessoas, móveis), vento (ABNT NBR 6123), temperatura.
- Ações excepcionais: impactos, explosões (consideradas em casos especiais).
Sobrecargas mínimas de uso:
- Residências: 1,5 kN/m² (quartos, salas); 3,0 kN/m² (garagem veículos leves).
- Escritórios: 2,0 kN/m².
- Salões de reunião/festas: 3,0 kN/m².
- Escadas residenciais: 3,0 kN/m²; coletivas: 4,0 kN/m².
- Coberturas acessíveis: 1,0 kN/m² (não acessíveis).
Peso específico de materiais: concreto armado 25 kN/m³; concreto simples 24 kN/m³; aço 77 kN/m³; alvenaria de tijolo cerâmico 13 kN/m³.`,
    tags: ['NBR 6120', 'cargas', 'sobrecarga', 'ações estruturais', 'peso próprio', 'estrutura'],
    vigente: true
  },
  {
    categoria: 'NBR',
    titulo: 'NBR 6122 — Projeto e Execução de Fundações',
    numero: 'NBR 6122',
    descricao: 'Norma para projeto, execução e controle de fundações superficiais e profundas.',
    conteudo: `ABNT NBR 6122:2022 — Projeto e execução de fundações.
Fundações superficiais (sapata, radier, blocos): solicitam o solo nas camadas rasas. Indicadas quando solo é resistente próximo à superfície.
Fundações profundas (estacas, tubulões): transferem carga para camadas mais resistentes a maior profundidade.
Investigação geotécnica obrigatória: sondagem SPT (Standard Penetration Test) mínima 1 furo por 200m² ou 1 por bloco isolado. Resultado: NSPT por camada.
Capacidade de carga: calculada por métodos empíricos (Aoki-Velloso, Decourt-Quaresma) ou semiempíricos.
Prova de carga estática: recomendada para obras com > 500t de carga ou solo heterogêneo.
Recalque diferencial: diferença de recalque entre apoios — limites na NBR 6118 e NBR 6122.
Responsabilidade técnica: ART de projeto fundacional e ART de execução são obrigatórias.
Escolha do tipo de fundação: baseada em sondagem, cargas, vizinhança, prazo e custo.`,
    tags: ['NBR 6122', 'fundações', 'sapata', 'radier', 'estaca', 'sondagem SPT', 'recalque'],
    vigente: true
  },
  {
    categoria: 'NBR',
    titulo: 'NBR 9050 — Acessibilidade a Edificações, Mobiliário, Espaços e Equipamentos Urbanos',
    numero: 'NBR 9050',
    descricao: 'Define parâmetros e critérios de acessibilidade para garantir a utilização de espaços, edificações, mobiliário, equipamentos urbanos e elementos por pessoas com deficiência ou mobilidade reduzida.',
    conteudo: `ABNT NBR 9050:2020 — Acessibilidade a edificações, mobiliário, espaços e equipamentos urbanos.
Área de manobra em cadeira de rodas: circulação 90° → 1,20m x 1,20m; 180° → 1,50m x 1,20m; 360° → diâmetro 1,50m.
Rampa acessível: inclinação máxima 8,33% (1:12). A cada 50m de comprimento, patamar de 1,20m. Largura mínima 1,20m. Corrimão bilateral.
Portas: vão mínimo de 80cm (porta residencial) e 90cm (edificação de uso coletivo). Maçaneta tipo alavanca.
Banheiro acessível: dimensões mínimas 1,50m x 1,70m (bacia + área de transferência). Barras de apoio obrigatórias.
Estacionamento: 2% das vagas reservadas para PcD (mínimo 1 vaga). Sinalização horizontal e vertical.
Calçada: piso tátil direcional (linhas paralelas) e de alerta (bolinhas). Faixa de circulação mínima 1,20m livre.
Símbolo Internacional de Acesso (SIA): deve identificar espaços acessíveis.
Aplicação: obrigatória em edificações públicas e de uso coletivo. Edificações residenciais multifamiliares devem garantir rota acessível até a unidade.
Decreto 5296/2004 e Lei 13.146/2015 (Lei Brasileira de Inclusão) reforçam a obrigatoriedade.`,
    tags: ['NBR 9050', 'acessibilidade', 'cadeira de rodas', 'rampa', 'PcD', 'piso tátil', 'banheiro acessível'],
    vigente: true
  },
  {
    categoria: 'NBR',
    titulo: 'NBR 14037 — Manual de Uso, Operação e Manutenção das Edificações',
    numero: 'NBR 14037',
    descricao: 'Define requisitos para elaboração e apresentação do Manual do Proprietário/Usuário de edificações habitacionais.',
    conteudo: `ABNT NBR 14037:2014 — Diretrizes para elaboração de manuais de uso, operação e manutenção das edificações — Requisitos para elaboração e apresentação do conteúdo.
Construtoras/incorporadoras são obrigadas a entregar o Manual do Proprietário junto com as chaves do imóvel.
O manual deve conter:
- Descrição dos sistemas e subsistemas da edificação (estrutura, revestimentos, instalações hidráulicas, elétricas, de gás, impermeabilização, etc.).
- Procedimentos de uso, operação e limpeza.
- Programa de manutenção preventiva (com periodicidade).
- Vida útil de projeto (VUP) de cada sistema.
- Garantias legais (CDC) e contratuais.
- Relação de fornecedores e prestadores de serviços da obra.
Prazo de garantia legal mínimo (CDC): 5 anos para vícios ocultos estruturais. Prazos contratuais conforme NBR 15575.
O manual é documento obrigatório e pode ser exigido em caso de acionamento de garantia.
Importância para o profissional: o RT deve orientar o cliente sobre o manual e incluir recomendações de manutenção em contratos.`,
    tags: ['NBR 14037', 'manual proprietário', 'manutenção', 'garantia', 'VUP', 'construtora'],
    vigente: true
  },
  {
    categoria: 'NBR',
    titulo: 'NBR 15575 — Edificações Habitacionais — Norma de Desempenho',
    numero: 'NBR 15575',
    descricao: 'Norma de desempenho para edificações habitacionais. Define requisitos e critérios de desempenho para sistemas e subsistemas construtivos, com foco em durabilidade e garantias.',
    conteudo: `ABNT NBR 15575:2021 — Edificações habitacionais — Desempenho.
Estrutura em 6 partes:
- Parte 1: Requisitos gerais (desempenho, durabilidade, vida útil de projeto — VUP).
- Parte 2: Sistemas estruturais.
- Parte 3: Sistemas de pisos.
- Parte 4: Sistemas de vedações verticais (paredes e painéis).
- Parte 5: Sistemas de coberturas.
- Parte 6: Sistemas hidrossanitários.
Níveis de desempenho: Mínimo (M), Intermediário (I) e Superior (S).
Vida Útil de Projeto (VUP): estrutura ≥ 50 anos; vedações externas ≥ 40 anos; vedações internas ≥ 20 anos; impermeabilização ≥ 8 anos; pintura externa ≥ 4 anos.
Desempenho térmico: a edificação deve manter temperaturas internas dentro de limites conforme zona bioclimática (NBR 15220).
Desempenho acústico: isolamento acústico entre unidades habitacionais e em relação ao exterior.
Prazo de garantia mínimo recomendado: 5 anos para estrutura; 3 anos para impermeabilização; 2 anos para revestimentos; 1 ano para pintura.
A norma é referência obrigatória para construtoras e deve constar no Manual do Proprietário.`,
    tags: ['NBR 15575', 'desempenho', 'VUP', 'vida útil', 'garantia', 'habitação', 'durabilidade'],
    vigente: true
  },
  {
    categoria: 'NBR',
    titulo: 'NBR 16280 — Reforma em Edificações — Sistema de Gestão de Reformas',
    numero: 'NBR 16280',
    descricao: 'Estabelece requisitos para o planejamento e gestão de reformas em edificações, definindo quando é necessária aprovação do síndico/condomínio e responsabilidade técnica.',
    conteudo: `ABNT NBR 16280:2015 — Reforma em edificações — Sistema de gestão de reformas.
Classifica reformas em:
- Reformas que afetam a estrutura, vedação, instalações ou fachada: exigem projeto técnico assinado por RT e aprovação do condomínio.
- Reformas que não afetam sistemas construtivos (troca de revestimento, pintura interna): não exigem RT, mas devem ser comunicadas ao síndico.
O proprietário deve apresentar ao síndico: escopo detalhado, responsável técnico (ART/RRT), prazo de execução e medidas de segurança.
O síndico (ou administradora) tem responsabilidade de fiscalizar e pode interditar reforma irregular.
Reformas que requerem RT obrigatório:
- Abertura ou fechamento de vão (porta/janela) em parede.
- Remoção de parede (estrutural ou de vedação).
- Alteração em instalações hidráulicas, elétricas ou de gás.
- Alteração de piso (aumento de carga — verificar NBR 6120).
- Qualquer intervenção em fachada.
Penalidades por reforma irregular: embargo, multa do condomínio, responsabilidade civil por danos.`,
    tags: ['NBR 16280', 'reforma', 'condomínio', 'síndico', 'ART', 'reforma estrutural'],
    vigente: true
  },
  {
    categoria: 'NBR',
    titulo: 'NBR 5410 — Instalações Elétricas de Baixa Tensão',
    numero: 'NBR 5410',
    descricao: 'Norma que rege o projeto, execução e manutenção de instalações elétricas de baixa tensão em edificações.',
    conteudo: `ABNT NBR 5410:2004 — Instalações elétricas de baixa tensão.
Abrange: edificações residenciais, comerciais, públicas, industriais, agropecuárias, hortigranjeiras e de prestação de serviços.
Pontos de tomada: mínimo 1 tomada 20A para chuveiro; tomadas de uso geral (TUG) a cada 5m no perímetro de cômodos.
Circuitos: iluminação, TUG, e tomadas de uso específico (TUE) separados. Não misturar cargas de grande porte com TUG.
Proteção: disjuntor de proteção para cada circuito + DR (Dispositivo Diferencial Residual) obrigatório em banheiros, áreas molhadas, piscinas e para crianças.
Aterramento: obrigatório em toda instalação elétrica nova. Fio verde ou verde-amarelo.
Fio neutro: azul claro. Fase: preto, vermelho, marrom (convenção).
Potência mínima instalada: calculada conforme uso previsto.
Laudo de instalações elétricas (AVCB/Laudo CREA): exigido pelo Corpo de Bombeiros e seguradoras.
ART/RRT obrigatório para projeto e execução de instalações elétricas.`,
    tags: ['NBR 5410', 'instalação elétrica', 'disjuntor', 'tomada', 'aterramento', 'DR', 'chuveiro'],
    vigente: true
  },
  {
    categoria: 'NBR',
    titulo: 'NBR 8160 — Sistemas Prediais de Esgoto Sanitário',
    numero: 'NBR 8160',
    descricao: 'Regula o projeto e a execução de sistemas prediais de esgoto sanitário, cobrindo ramais, colunas, coletores e caixas.',
    conteudo: `ABNT NBR 8160:1999 — Sistemas prediais de esgoto sanitário — Projeto e execução.
Componentes do sistema:
- Ramal de descarga: trecho horizontal entre o aparelho e o ramal de esgoto. Declividade mínima: 2% para DN 40-50mm; 1% para DN ≥ 75mm.
- Ramal de esgoto: coleta ramais de descarga. Declividade ≥ 1%.
- Subcoluna: ramal vertical de esgoto.
- Coluna de esgoto: tubo vertical que coleta subcoluna ou ramais.
- Coletor predial: tubo horizontal principal até inspeção ou rede pública.
Caixa de inspeção: obrigatória em mudanças de direção, reunião de ramais e a cada 15m em linha reta.
Ventilação: tubo de queda deve ter coluna de ventilação. Impede ruptura de fecho hídrico (sifão).
Sifão: dispositivo obrigatório em todos os aparelhos para impedir odores. Fecho hídrico mínimo: 25mm.
Caixa de gordura: obrigatória em cozinhas antes do lançamento no esgoto. Limpeza a cada 30-60 dias.
Fossa séptica + sumidouro: alternativa onde não há rede pública (NBR 7229 e NBR 13969).
ART/RRT de projeto e execução obrigatórios.`,
    tags: ['NBR 8160', 'esgoto sanitário', 'sifão', 'caixa inspeção', 'ventilação', 'fossa séptica'],
    vigente: true
  },

  // ========== LEIS FEDERAIS ==========
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 6.766/1979 — Parcelamento do Solo Urbano',
    numero: 'Lei 6766/1979',
    descricao: 'Disciplina o parcelamento do solo urbano no Brasil, definindo regras para loteamentos e desmembramentos.',
    conteudo: `Lei Federal nº 6.766, de 19 de dezembro de 1979 — Dispõe sobre o Parcelamento do Solo Urbano.
Define dois tipos de parcelamento:
- Loteamento: subdivisão de gleba em lotes com abertura de novas vias, logradouros ou prolongamento/modificação das vias existentes.
- Desmembramento: subdivisão de gleba em lotes com aproveitamento do sistema viário existente, sem abertura de novas vias.
Requisitos mínimos para loteamento:
- Área mínima de lote: 125m² com frente mínima de 5m (padrão; municípios podem exigir mais).
- Destinação obrigatória ao município: mínimo 35% da área total para vias, espaços livres e equipamentos comunitários.
- Infraestrutura básica: vias pavimentadas, rede de água, esgoto, energia elétrica e coleta de lixo.
Aprovação: exige projeto aprovado pela prefeitura e pelo estado. Registro no Cartório de Imóveis obrigatório antes da venda.
Loteamento irregular: vendedor responde civil e criminalmente (art. 50). Crime: reclusão de 1 a 4 anos.
REURB (Lei 13.465/2017) regulariza loteamentos irregulares consolidados.
Responsabilidade do RT: profissional que assinar o projeto de loteamento responde tecnicamente pela implantação.`,
    tags: ['Lei 6766', 'parcelamento solo', 'loteamento', 'desmembramento', 'lote', 'gleba', 'regularização'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 8.078/1990 — Código de Defesa do Consumidor (CDC)',
    numero: 'Lei 8078/1990',
    descricao: 'Estabelece direitos e obrigações nas relações de consumo, incluindo vícios de construção, garantias e responsabilidade civil de construtoras.',
    conteudo: `Lei Federal nº 8.078/1990 — Código de Defesa do Consumidor.
Aplica-se às relações entre construtoras/incorporadoras (fornecedoras) e compradores de imóveis (consumidores).
Vícios de qualidade (art. 18): defeitos que tornam o produto impróprio ou diminuem o valor. Prazo para reclamação: 90 dias para bens duráveis (imóveis são bens duráveis).
Vícios ocultos (art. 26, §3º): o prazo começa da data em que o vício se torna evidente.
Garantia legal (art. 618 CC): 5 anos para sólida construção (vícios estruturais). Prazo decadencial — prescinde de contrato.
Responsabilidade do construtor: objetiva pelos vícios do imóvel. Não precisa provar culpa para acionar.
Publicidade enganosa (art. 37): é proibida. Memorial descritivo e maquete são vinculantes.
Distrato (Lei 13.786/2018): regula devolução de valores quando o comprador desiste de imóvel na planta.
Prática abusiva: cobrar por área não construída (como área de varanda não computada), ou não entregar o que foi prometido.
Importância para o RT: o profissional pode ser corresponsável por vícios se assinou ART/RRT sem ressalvas.`,
    tags: ['CDC', 'consumidor', 'garantia', 'vício construção', 'construtora', 'incorporadora', 'prazo garantia'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 10.257/2001 — Estatuto da Cidade',
    numero: 'Lei 10257/2001',
    descricao: 'Regulamenta os artigos 182 e 183 da Constituição Federal, estabelecendo diretrizes gerais da política urbana no Brasil.',
    conteudo: `Lei Federal nº 10.257, de 10 de julho de 2001 — Estatuto da Cidade.
Instrumentos de política urbana criados ou regulamentados:
- Plano Diretor: obrigatório para municípios com > 20.000 habitantes. Define uso e ocupação do solo.
- IPTU Progressivo no Tempo: para imóveis subutilizados em área de urbanização prioritária.
- Desapropriação com pagamento em títulos da dívida pública (após IPTU progressivo).
- Usucapião Urbana (art. 9º e 10): individual (250m²) e coletiva.
- Concessão de Uso Especial para Moradia (CUEM): imóvel público ocupado por 5 anos para moradia.
- Operações Urbanas Consorciadas: parcerias público-privado para transformação urbana.
- Direito de Superfície: proprietário pode conceder uso da superfície sem transferir a propriedade.
- Transferência do Direito de Construir (TDC): proprietário vende potencial construtivo a outro terreno.
- EIV — Estudo de Impacto de Vizinhança: exigido para empreendimentos de grande porte.
Relevância para construtoras: conhecer o Plano Diretor Municipal é essencial para viabilidade de projetos.
Regularização fundiária: Estatuto da Cidade fundou as bases da REURB (complementada pela Lei 13.465/2017).`,
    tags: ['Estatuto da Cidade', 'plano diretor', 'usucapião urbana', 'IPTU progressivo', 'operação urbana', 'EIV'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 10.406/2002 — Código Civil (Art. 618 — Garantia por Solidez)',
    numero: 'Lei 10406/2002 — Art. 618',
    descricao: 'O Art. 618 do Código Civil estabelece a responsabilidade do empreiteiro/construtor por 5 anos pela solidez e segurança da obra.',
    conteudo: `Código Civil — Lei nº 10.406/2002 — Art. 618.
"Nos contratos de empreitada de edifícios ou outras construções consideráveis, o empreiteiro de materiais e execução responderá, durante o prazo irredutível de cinco anos, pela solidez e segurança do trabalho, assim em razão dos materiais, como do solo."
Pontos-chave:
- Prazo de 5 anos é irredutível: não pode ser reduzido por contrato.
- Abrange: vícios estruturais, de fundação, de cobertura, de impermeabilização — qualquer risco à solidez e segurança.
- Respondem solidariamente: empreiteiro, subempreiteiros e o RT que assinou ART/RRT.
- Prescrição da ação: 3 anos a partir do aparecimento do vício (art. 206, §3º, V).
- Prova do vício: laudo técnico de RT é fundamental para acionar a garantia.
- Diferença com CDC: Art. 618 CC aplica-se a toda empreitada (não apenas relação de consumo). CDC e Art. 618 são cumuláveis.
Para o RT: a ART/RRT vincula o profissional à garantia do Art. 618. É fundamental delimitar bem o escopo da responsabilidade no contrato.`,
    tags: ['Art. 618', 'Código Civil', 'garantia obra', '5 anos', 'solidez', 'segurança', 'empreiteiro', 'ART'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 5.194/1966 — Regulamenta as Profissões de Engenheiro, Arquiteto e Engenheiro-Agrônomo',
    numero: 'Lei 5194/1966',
    descricao: 'Define as atribuições profissionais de engenheiros e arquitetos, cria o CONFEA/CREA e estabelece a obrigatoriedade de ART.',
    conteudo: `Lei Federal nº 5.194/1966 — Regula o exercício das profissões de Engenheiro, Arquiteto e Engenheiro-Agrônomo.
Cria o Sistema CONFEA/CREA: Conselho Federal e Conselhos Regionais de Engenharia, Arquitetura e Agronomia.
ART — Anotação de Responsabilidade Técnica (regulamentada pela Lei 6496/77 e Resolução CONFEA 1025/2009):
- Obrigatória para todo serviço técnico de engenharia: projetos, execução, vistoria, parecer, avaliação, laudos.
- Emitida pelo profissional registrado no CREA.
- Vincula o profissional à obra/serviço, definindo sua responsabilidade.
- Deve ser registrada antes do início da obra ou serviço.
- Habite-se e Alvará: prefeituras exigem ART/RRT para aprovação.
Exercício ilegal da profissão (art. 6º): crime previsto no art. 47 da Lei de Contravenções Penais.
Atribuições do engenheiro civil: projetos, cálculos, direção técnica, vistoria de obras civis.
Atribuições do arquiteto e urbanista: projeto arquitetônico, paisagismo, urbanismo (complementadas pela Lei 12.378/2010).
Registro profissional: obrigatório no CREA (engenheiros) ou CAU (arquitetos) para exercício legal.`,
    tags: ['CREA', 'ART', 'engenheiro', 'arquiteto', 'CONFEA', 'atribuições profissionais', 'registro'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 12.378/2010 — Regulamenta o Exercício da Arquitetura e Urbanismo (CAU/BR)',
    numero: 'Lei 12378/2010',
    descricao: 'Cria o Conselho de Arquitetura e Urbanismo do Brasil (CAU/BR) e define as atribuições privativas e compartilhadas dos arquitetos e urbanistas.',
    conteudo: `Lei Federal nº 12.378, de 31 de dezembro de 2010.
Cria o Conselho de Arquitetura e Urbanismo (CAU/BR) e os CAU estaduais, desvinculando arquitetos do CREA.
RRT — Registro de Responsabilidade Técnica: equivalente à ART para arquitetos e urbanistas.
Atribuições privativas do arquiteto e urbanista:
- Projeto arquitetônico de edificações.
- Projeto de interiores.
- Projeto paisagístico.
- Projeto urbano e de parcelamento do solo.
- Patrimônio histórico e cultural (restauro, reabilitação).
Atribuições compartilhadas com engenheiros:
- Coordenação de projetos multidisciplinares.
- Gestão e administração de obras.
- Avaliações e perícias.
CAU: fiscaliza o exercício profissional dos arquitetos, aplica sanções por irregularidades.
Acervo técnico: registro das obras realizadas pelo profissional no CAU. Essencial para histórico profissional.
Para o IMOVELI: fiadores registrados no CAU são arquitetos e urbanistas. Devem emitir RRT para cada serviço técnico.`,
    tags: ['CAU', 'RRT', 'arquiteto urbanista', 'Lei 12378', 'CAUBL', 'atribuições arquiteto'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 13.089/2015 — Estatuto da Metrópole',
    numero: 'Lei 13089/2015',
    descricao: 'Estabelece diretrizes gerais para o planejamento, a gestão e a execução das funções públicas de interesse comum em regiões metropolitanas e aglomerações urbanas.',
    conteudo: `Lei Federal nº 13.089, de 12 de janeiro de 2015 — Estatuto da Metrópole.
Define região metropolitana e aglomeração urbana como unidades de gestão interfederativa.
PDUI — Plano de Desenvolvimento Urbano Integrado: obrigatório para regiões metropolitanas, aprovado pela assembleia legislativa estadual.
Instrumentos de gestão metropolitana:
- Contratos de gestão entre entes da federação.
- Consórcios públicos (Lei 11.107/2005).
- Convênios de cooperação.
Funções Públicas de Interesse Comum (FPIC): transporte, saneamento, uso do solo, habitação — devem ser planejadas em conjunto pelos municípios da região.
Impacto na construção civil:
- Projetos de grande porte em regiões metropolitanas devem observar o PDUI.
- Zoneamento metropolitano pode restringir ou ampliar potencial construtivo.
- Obras de infraestrutura (rodovias, metrô, saneamento) seguem planejamento metropolitano.
Impactos no RT: obras em regiões metropolitanas podem ter regulação adicional além do Plano Diretor Municipal.`,
    tags: ['Estatuto Metrópole', 'região metropolitana', 'PDUI', 'gestão urbana', 'planejamento urbano'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 4.591/1964 — Condomínios e Incorporações Imobiliárias',
    numero: 'Lei 4591/1964',
    descricao: 'Regula o condomínio em edificações e as incorporações imobiliárias no Brasil. Base legal para venda de imóveis na planta.',
    conteudo: `Lei Federal nº 4.591, de 16 de dezembro de 1964 — Condomínio em edificações e incorporações imobiliárias.
Incorporação imobiliária: alienação de unidades futuras ("na planta") antes ou durante a construção.
Incorporador: responsável legal pela entrega das unidades. Deve registrar a incorporação no Cartório de Imóveis (com projeto aprovado, memorial descritivo, orçamento, cronograma).
Memorial descritivo: documento que especifica materiais, acabamentos e sistemas. Vincula o incorporador — não pode ser alterado sem consentimento dos compradores.
Prazo de entrega: deve ser definido em contrato. Tolerância de 180 dias sem penalidade (usual no mercado, confirmado pela Lei 13.786/2018).
Patrimônio de afetação (Lei 10.931/2004): separa os recursos da obra do patrimônio geral do incorporador — protege o comprador em caso de falência.
Convenção de condomínio: regula a vida em condomínio: taxas, responsabilidades, uso das áreas comuns.
Comissão de Representantes dos Adquirentes: pode fiscalizar a obra durante a incorporação.
Responsabilidade do RT: o profissional que assina ART/RRT de projeto e execução é responsável pela conformidade com o memorial descritivo.`,
    tags: ['Lei 4591', 'condomínio', 'incorporação imobiliária', 'incorporador', 'memorial descritivo', 'planta'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 13.465/2017 — Regularização Fundiária Urbana (REURB)',
    numero: 'Lei 13465/2017',
    descricao: 'Institui a REURB (Regularização Fundiária Urbana), estabelecendo procedimentos para regularização de assentamentos informais.',
    conteudo: `Lei Federal nº 13.465, de 11 de julho de 2017 — Regularização Fundiária Rural e Urbana.
REURB-S: Regularização Fundiária de Interesse Social — para ocupações de baixa renda. Isenta de custas cartorárias.
REURB-E: Regularização Fundiária de Interesse Específico — para ocupações de interesse de mercado (não social).
Etapas da REURB:
1. Requerimento ao município (por moradores, incorporador, estado ou MP).
2. Processamento pelo município: cadastramento, notificação dos titulares das áreas, projetos.
3. Aprovação do projeto de regularização.
4. Registro no Cartório de Imóveis.
Instrumentos: legitimação fundiária (atribui propriedade ao ocupante de imóvel público), legitimação de posse, CUEM, CRF (Certidão de Regularização Fundiária).
Usucapião extrajudicial (art. 1.071 CPC c/c Lei 13.465): feito em cartório, sem necessidade de ação judicial.
Responsabilidade do RT: elaborar o levantamento planialtimétrico e projeto de regularização. ART/RRT obrigatória.
Importância para o IMOVELI: profissionais especializados em regularização fundiária têm alta demanda no mercado.`,
    tags: ['REURB', 'regularização fundiária', 'REURB-S', 'REURB-E', 'legitimação fundiária', 'usucapião', 'Lei 13465'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 13.786/2018 — Distrato Imobiliário (Lei dos Distratos)',
    numero: 'Lei 13786/2018',
    descricao: 'Regulamenta a resolução (distrato) dos contratos de compra e venda de imóveis na planta, definindo percentuais de retenção e prazos de tolerância.',
    conteudo: `Lei Federal nº 13.786, de 27 de dezembro de 2018 — Disciplina a resolução do contrato por inadimplemento do adquirente de unidade imobiliária.
Regras para distrato (rescisão a pedido do comprador):
- Incorporadoras podem reter até 25% dos valores pagos (em condomínio de acesso controlado: até 50%).
- Se o imóvel já estiver concluído (Habite-se emitido): comprador pode ser cobrado por despesas de condomínio e IPTU desde a data disponibilidade.
- Devolução: em 180 dias corridos do distrato se não houver patrimônio de afetação; em 30 dias do prazo de carência se houver.
Prazo de tolerância de entrega: 180 dias após a data contratual. Se excedido, o comprador pode rescindir sem pena e receber de volta 100% do que pagou em até 60 dias.
Cláusula de décimo terceiro parcela: proibida se não prevista explicitamente.
Quadro-Resumo obrigatório: deve acompanhar o contrato de compra e venda, em destaque, com todas as principais condições.
Para RT: a entrega do Habite-se no prazo é crucial para evitar distratos e multas contratuais à construtora.`,
    tags: ['distrato', 'Lei 13786', 'rescisão contrato', 'imóvel planta', 'retenção', 'tolerância entrega'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 9.514/1997 — Sistema de Financiamento Imobiliário (SFI) e Alienação Fiduciária',
    numero: 'Lei 9514/1997',
    descricao: 'Institui o SFI e a alienação fiduciária de coisa imóvel — principal instrumento de garantia nos financiamentos imobiliários brasileiros.',
    conteudo: `Lei Federal nº 9.514, de 20 de novembro de 1997 — Sistema de Financiamento Imobiliário.
Alienação fiduciária de imóvel: o comprador transfere a propriedade ao banco/credor como garantia do financiamento. Comprador fica como fiduciante (posse direta); banco como fiduciário (propriedade resolúvel).
Com quitação: banco transfere a propriedade definitiva ao comprador (livre e desembaraçada).
Em caso de inadimplência: banco consolida a propriedade em 15 dias após notificação. Imóvel leiloado; comprador recebe o saldo restante (se houver) após leilão.
Vantagem sobre hipoteca: retomada é muito mais rápida (sem ação judicial).
CRI — Certificado de Recebíveis Imobiliários: título lastreado em créditos imobiliários, emitido por securitizadoras.
Impacto para construtoras: financiamento de obra via SFH/SFI exige averbação da incorporação, laudos de medição, ART/RRT de cada etapa.
Para o RT: os laudos de medição de obra para liberação de parcelas de financiamento são assinados pelo RT responsável.`,
    tags: ['SFI', 'alienação fiduciária', 'financiamento imobiliário', 'CRI', 'banco', 'inadimplência', 'laudo medição'],
    vigente: true
  },

  // ========== INCÊNDIO E SEGURANÇA ==========
  {
    categoria: 'Norma Incêndio',
    titulo: 'AVCB — Auto de Vistoria do Corpo de Bombeiros',
    numero: 'AVCB',
    descricao: 'Documento emitido pelo Corpo de Bombeiros atestando que a edificação atende às medidas de segurança contra incêndio e pânico exigidas pela legislação estadual.',
    conteudo: `AVCB — Auto de Vistoria do Corpo de Bombeiros (denominação varia por estado: CLCB em SP, LVCB em outros).
Obrigatório para: edificações de uso coletivo (comércio, serviços, industria, hotelaria, hospitais, escolas, condomínios), conforme área e tipo de ocupação.
Renovação: geralmente a cada 3 anos (prazo varia por estado e tipo de edificação).
Sistemas exigidos (variam por tipo e área):
- Detecção e alarme de incêndio (NBR 17240).
- Chuveiro automático — sprinkler (NBR 10897): obrigatório em edificações de grande porte.
- Hidrante e mangotinhos (NBR 13714).
- Extintores de incêndio (NBR 12693): tipo e quantidade conforme ocupação.
- Iluminação de emergência (NBR 10898).
- Sinalização de segurança (NBR 13434).
- Saídas de emergência: rotas, portas corta-fogo, escadas de segurança (NBR 9077).
- SPDA — Sistema de Proteção contra Descargas Atmosféricas (NBR 5419).
- Plano de abandono e brigada de incêndio (NBR 14276).
Processo: projeto de prevenção de incêndio (PPCI) aprovado pelos bombeiros → execução → vistoria → AVCB.
RT obrigatório: engenheiro ou arquiteto assina o PPCI. ART/RRT de projeto e execução.`,
    tags: ['AVCB', 'bombeiros', 'incêndio', 'PPCI', 'sprinkler', 'hidrante', 'extintores', 'saída emergência'],
    vigente: true
  },
  {
    categoria: 'Norma Incêndio',
    titulo: 'NBR 9077 — Saídas de Emergência em Edifícios',
    numero: 'NBR 9077',
    descricao: 'Define os requisitos para saídas de emergência, escadas de segurança e rotas de fuga em edificações.',
    conteudo: `ABNT NBR 9077:2001 — Saídas de emergência em edifícios.
Escada de segurança: obrigatória em edifícios com mais de 4 pavimentos (varia por estado — SP: decreto 63.911/2018).
Tipos:
- Escada enclausurada protegida (EP): antecâmara com porta corta-fogo.
- Escada enclausurada à prova de fumaça (PF): antecâmara pressurizada ou com ventilação natural.
- Escada não enclausurada (NE): permitida em edificações baixas.
Largura mínima: 1,20m para escadas até 200 pessoas/andar; 1,50m para > 200 pessoas.
Porta corta-fogo (PCF): resistência ao fogo de 60 a 90 min conforme edificação. Deve fechar automaticamente.
Distância máxima de percurso: 30m sem sprinkler; 45m com sprinkler (até a porta de saída ou escada).
Rota de fuga: sinalizada continuamente, iluminação de emergência, piso antiderrapante, sem obstáculos.
Descarga: acesso direto ao exterior da edificação com largura ≥ 1,20m.
Portas das unidades (apartamentos, salas): devem abrir no sentido da fuga.`,
    tags: ['NBR 9077', 'saída emergência', 'escada segurança', 'rota fuga', 'porta corta-fogo', 'evacuação'],
    vigente: true
  },
  {
    categoria: 'Código',
    titulo: 'COSCIP / IT (Instruções Técnicas) — Corpo de Bombeiros',
    numero: 'COSCIP',
    descricao: 'Conjunto de normas do Corpo de Bombeiros que regula medidas de segurança contra incêndio e pânico nas edificações. Cada estado tem sua regulamentação específica.',
    conteudo: `COSCIP — Código de Segurança Contra Incêndios e Pânico (São Paulo: substituído pelas Instruções Técnicas — ITs do CBPMESP; outros estados têm legislações similares).
Em São Paulo: Decreto Estadual 63.911/2018 e Instruções Técnicas (ITs) do Corpo de Bombeiros da Polícia Militar do Estado de São Paulo (CBPMESP).
Principais ITs aplicáveis à construção civil:
- IT 01: Procedimentos administrativos (processo de aprovação PPCI).
- IT 11: Saídas de emergência.
- IT 14: Carga de incêndio (densidade de carga por tipo de ocupação).
- IT 17: Sistema de chuveiro automático (sprinkler).
- IT 18: Iluminação de emergência.
- IT 20: Sinalização de emergência.
- IT 22: Sistemas de hidrante e mangotinho.
- IT 41: Brigada de incêndio.
- IT 43: Plano de emergência.
Processo em SP:
1. Projeto PPCI elaborado por RT (engenheiro/arquiteto) e aprovado na Prefeitura e no Corpo de Bombeiros.
2. Obra executada conforme projeto aprovado.
3. Vistoria pelo Corpo de Bombeiros.
4. Emissão do AVCB (Auto de Vistoria do Corpo de Bombeiros).
Cada estado tem regulamentação própria — consultar o Corpo de Bombeiros local.`,
    tags: ['COSCIP', 'bombeiros', 'IT', 'instrução técnica', 'PPCI', 'SP', 'incêndio pânico'],
    vigente: true
  },

  // ========== PRÁTICAS CONSTRUTIVAS ==========
  {
    categoria: 'Pratica Construtiva',
    titulo: 'Patologias da Construção — Fissuras, Trincas e Rachaduras',
    numero: null,
    descricao: 'Classificação e causas das manifestações patológicas em estruturas de concreto e alvenaria, com orientações para diagnóstico e solução.',
    conteudo: `Patologias Construtivas — Fissuras, Trincas e Rachaduras.
Classificação por abertura:
- Fissura: < 0,5mm — geralmente superficial, sem comprometimento estrutural.
- Trinca: 0,5mm a 1,0mm — investigar causa; pode ser estrutural.
- Rachadura: 1,0mm a 10mm — comprometimento estrutural possível; exige laudo de RT.
- Fenda: 10mm a 50mm — colapso iminente; evacuação e reforço urgentes.
- Brecha: > 50mm — situação crítica.
Causas mais comuns:
- Recalque diferencial de fundação (forma diagonal de 45°): exige investigação geotécnica.
- Retração do concreto (fissuras mapeadas, superficiais): adição de fibras, cura adequada.
- Dilatação térmica (fissuras em juntas de dilatação inexistentes): inserção de juntas.
- Sobrecarga além do projeto: reforma sem cálculo estrutural.
- Corrosão de armadura (manchas ferrosas, carbonatação do concreto): reparo com ponte de aderência e graute.
- Movimentação higroscópica de alvenaria (fissuras horizontais na interface pilar-alvenaria).
Diagnóstico: laudo de RT com sondagem, ensaios (Esclerometria, GPR, carbonatação), monitoramento com relógio comparador.
Sempre exige ART/RRT do profissional que emite o laudo.`,
    tags: ['fissura', 'trinca', 'rachadura', 'patologia construtiva', 'recalque', 'armadura', 'concreto'],
    vigente: true
  },
  {
    categoria: 'Pratica Construtiva',
    titulo: 'Impermeabilização — Sistemas e Normas',
    numero: null,
    descricao: 'Sistemas de impermeabilização para lajes, banheiros, piscinas, subsolos e áreas úmidas, com referências normativas e VUP.',
    conteudo: `Impermeabilização — Sistemas e Normas (NBR 9575, NBR 9574).
NBR 9575:2010 — Impermeabilização — Seleção e projeto.
NBR 9574:2008 — Execução de impermeabilização.
Áreas obrigatoriamente impermeabilizadas:
- Lajes de cobertura (telhado plano ou inclinado invertido).
- Terraços e varandas expostos.
- Banheiros (box e área do vaso).
- Cozinhas (área sob a pia).
- Subsolos e porões.
- Piscinas, fontes e espelhos d'água.
- Calhas e rufos.
Sistemas mais comuns:
- Manta asfáltica (APP ou SBS): para lajes expostas. Espessura 3mm ou 4mm. VUP ≥ 8 anos.
- Membrana acrílica (pintura impermeabilizante): banheiros e áreas frias internas. Camadas sobrepostas.
- Argamassa polimérica: sistemas de proteção em reservatórios e piscinas.
- Cristalização (cimento cristalizante): concreto saturado — subsolos, reservatórios.
Erros comuns: falta de rodapé (deve subir 20cm nas paredes), falta de proteção mecânica na manta, trincas não tratadas antes de impermeabilizar, falta de cura.
Teste de estanqueidade: inundação por 72h antes de cobrir com contrapiso (NBR 9574, item 8).`,
    tags: ['impermeabilização', 'manta asfáltica', 'membrana acrílica', 'laje', 'banheiro', 'NBR 9575'],
    vigente: true
  },
  {
    categoria: 'Pratica Construtiva',
    titulo: 'Usucapião — Tipos e Requisitos',
    numero: null,
    descricao: 'Guia sobre os tipos de usucapião no Brasil, prazos, requisitos e o procedimento extrajudicial (cartorial).',
    conteudo: `Usucapião no Brasil — Tipos e Requisitos.
1. Usucapião Ordinária (art. 1.242 CC): 10 anos de posse contínua e pacífica, com justo título e boa-fé. Reduz para 5 anos se o imóvel foi adquirido onerosamente, está registrado e o possuidor tornou o imóvel sua moradia ou realizou investimentos.
2. Usucapião Extraordinária (art. 1.238 CC): 15 anos sem interrupção, sem oposição, independente de título ou boa-fé. Reduz para 10 anos se o possuidor estabeleceu moradia habitual ou realizou obras/serviços produtivos.
3. Usucapião Urbana (art. 183 CF e art. 1.240 CC): área urbana de até 250m², 5 anos de posse, moradia própria ou familiar, sem outro imóvel.
4. Usucapião Especial Coletiva Urbana (art. 10 Estatuto da Cidade): comunidade com posse de área urbana por 5 anos, sem identificação de cada posse individual.
5. Usucapião Rural / Pro Labore (art. 191 CF e art. 1.239 CC): área rural de até 50 hectares, 5 anos, produtiva, sem outro imóvel.
6. Usucapião por Abandono de Lar (art. 1.240-A CC): cônjuge abandona lar por 2 anos; posseiro requer o imóvel do casal.
7. Usucapião Extrajudicial (art. 1.071 CPC — Decreto 9.310/2018): feita no Cartório de Imóveis. Exige: levantamento planialtimétrico, planta, memorial descritivo assinado por RT + ART/RRT, ata notarial, concordância dos confrontantes.
Procedimento extrajudicial é mais rápido (sem ação judicial), mas exige RT para o levantamento.`,
    tags: ['usucapião', 'usucapião extrajudicial', 'usucapião urbana', 'usucapião extraordinária', 'posse', 'cartório'],
    vigente: true
  },

  // ========== LEIS SUGERIDAS ADICIONAIS ==========
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 6.496/1977 — Anotação de Responsabilidade Técnica (ART)',
    numero: 'Lei 6496/1977',
    descricao: 'Institui a Anotação de Responsabilidade Técnica (ART) nos conselhos regionais de engenharia, arquitetura e agronomia.',
    conteudo: `Lei Federal nº 6.496, de 7 de dezembro de 1977 — Institui a "Anotação de Responsabilidade Técnica" na prestação de serviços de Engenharia, Arquitetura e Agronomia.
ART: documento que identifica o profissional responsável técnico por obras e serviços de engenharia e agronomia.
Obrigatoriedade: todo contrato de serviço técnico deve ter ART registrada no CREA da região.
Conteúdo da ART: dados do profissional, do contratante, do objeto (obra/serviço), valor, endereço, atividades técnicas.
Anotação antes do início: o profissional deve registrar a ART antes de iniciar o serviço.
Penalidades: exercício sem ART caracteriza infração ética e sujeita o profissional a multa e suspensão pelo CREA.
Tipos de ART:
- ART de projeto (arquitetônico, estrutural, instalações).
- ART de execução (obra civil, instalações).
- ART de vistoria e laudo.
- ART de ensino, pesquisa, gestão.
Valor da ART: tabelado pelo CONFEA conforme tipo e valor do serviço.
A ART vincula o profissional ao serviço e é a base da responsabilidade civil e criminal na área técnica.`,
    tags: ['ART', 'Lei 6496', 'responsabilidade técnica', 'CREA', 'contrato obra', 'engenharia'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 13.146/2015 — Lei Brasileira de Inclusão (Estatuto da Pessoa com Deficiência)',
    numero: 'Lei 13146/2015',
    descricao: 'Institui a Lei Brasileira de Inclusão (LBI), com foco na acessibilidade em edificações, transportes e serviços, complementando a NBR 9050.',
    conteudo: `Lei Federal nº 13.146, de 6 de julho de 2015 — Lei Brasileira de Inclusão da Pessoa com Deficiência (Estatuto da Pessoa com Deficiência).
Acessibilidade em edificações (art. 55-57):
- Novos projetos de edificações de uso público ou coletivo devem ser acessíveis.
- Reformas de edificações públicas: obrigatória a implantação de rota acessível.
- Edificações residenciais multifamiliares novas: pelo menos 1 unidade adaptável por andar (varia conforme regulamentação local).
Prazos de adequação (já vencidos): edificações públicas deveriam estar adequadas até 2025.
Punições pelo descumprimento: embargos, multas, interdição e responsabilidade civil por danos causados pela inacessibilidade.
Complementa: NBR 9050 (norma técnica), Decreto 5.296/2004 (regulamentou Leis 10.048 e 10.098).
Design Universal: edificações devem ser projetadas para uso por pessoas com e sem deficiência, sem adaptações específicas.
Para RT: qualquer projeto novo de uso coletivo ou público deve observar a LBI + NBR 9050. ART/RRT de projetos acessíveis.`,
    tags: ['LBI', 'Lei 13146', 'acessibilidade', 'PcD', 'inclusão', 'NBR 9050', 'design universal'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 10.931/2004 — Patrimônio de Afetação nas Incorporações Imobiliárias',
    numero: 'Lei 10931/2004',
    descricao: 'Regula o patrimônio de afetação, separando os recursos da obra do patrimônio geral do incorporador, protegendo compradores em caso de falência.',
    conteudo: `Lei Federal nº 10.931, de 2 de agosto de 2004 — Patrimônio de afetação de incorporações imobiliárias.
Patrimônio de afetação: regime voluntário pelo qual o incorporador destaca bens e direitos da incorporação do seu patrimônio geral, vinculando-os exclusivamente à obra.
Vantagens para compradores: em caso de falência da incorporadora, os recursos afetados não se misturam com outros credores. A Comissão de Representantes pode dar continuidade à obra.
Vantagens para incorporadoras: acesso ao Regime Especial Tributário (RET) — alíquota unificada de 4% sobre a receita bruta (vs. tributação normal ~7%).
Registro do patrimônio de afetação: averbado na matrícula do terreno no Cartório de Imóveis.
Obrigações do incorporador sob afetação:
- Conta bancária exclusiva para a obra.
- Escrituração contábil separada.
- Entrega de balancetes trimestrais à Comissão de Representantes.
- Proibição de desvio de recursos para outros empreendimentos.
Dissolução do patrimônio de afetação: após a conclusão da obra (Habite-se), quitação do financiamento e entrega das unidades.`,
    tags: ['patrimônio afetação', 'Lei 10931', 'incorporação', 'RET', 'falência', 'proteção comprador'],
    vigente: true
  },
  {
    categoria: 'Resolucao',
    titulo: 'Resolução CONFEA 1.025/2009 — Atribuições Profissionais (Engenharia)',
    numero: 'Resolução CONFEA 1025/2009',
    descricao: 'Define as atribuições profissionais dos engenheiros e outros profissionais de engenharia por título e modalidade.',
    conteudo: `Resolução CONFEA nº 1.025, de 30 de outubro de 2009.
Define as atividades profissionais para cada título e modalidade de engenharia.
Atribuições do Engenheiro Civil:
- Projeto, cálculo, coordenação e execução de obras de engenharia civil (edificações, pontes, rodovias, saneamento, etc.).
- Vistoria, perícia, avaliação, laudo, parecer técnico.
- Pesquisa, estudos geotécnicos.
- Ensino e pesquisa na área de engenharia civil.
Atribuições do Técnico em Edificações (nível médio):
- Execução e fiscalização de obras de pequeno porte conforme limitação definida pelo CREA.
- Projetos simples de edificações (área máxima definida por estado).
- Não pode assinar projetos estruturais ou de instalações complexas.
Limitações: profissionais de áreas correlatas (engenheiro eletricista, mecânico) têm atribuições específicas, não podendo assinar projetos civis.
Registro de responsabilidade: todos precisam de registro ativo no CREA para exercer suas atribuições.`,
    tags: ['CONFEA', 'atribuições', 'engenheiro civil', 'técnico edificações', 'ART', 'registro CREA'],
    vigente: true
  },
  {
    categoria: 'Lei Federal',
    titulo: 'Lei 11.977/2009 — Programa Minha Casa Minha Vida (MCMV)',
    numero: 'Lei 11977/2009',
    descricao: 'Cria o Programa Minha Casa Minha Vida (MCMV) para habitação de interesse social, com regras específicas de construção, repasse e qualidade.',
    conteudo: `Lei Federal nº 11.977, de 7 de julho de 2009 — Programa Minha Casa Minha Vida (MCMV).
Atualizada pelo Decreto 11.715/2023 (Nova fase MCMV / Minha Casa Verde e Amarela).
Faixas de renda (2024):
- Faixa 1: renda familiar bruta até R$ 2.640 — subsídio máximo.
- Faixas 2 e 3: renda até R$ 8.000 — financiamento com taxas subsidiadas.
Padrões mínimos de habitação MCMV:
- Área mínima: 37m² por unidade.
- Sistemas obrigatórios: aquecimento solar, laje de cobertura térmica, reboco interno e externo, piso cerâmico, entre outros.
- NBR 15575 (desempenho): obrigatória para os empreendimentos.
- Infraestrutura obrigatória: água, esgoto, energia, coleta de lixo, pavimentação.
Regularização fundiária integrada ao MCMV: empreendimentos devem ter aprovação municipal e registro no CRI.
Responsabilidade do RT: projetos e execução de empreendimentos MCMV exigem ART/RRT. Laudos de vistoria para liberação de parcelas da CEF são responsabilidade do RT.`,
    tags: ['MCMV', 'Minha Casa Minha Vida', 'habitação social', 'CEF', 'subsídio', 'Lei 11977'],
    vigente: true
  }
];

async function seed() {
  const ok = await testConnection();
  if (!ok) { console.error('❌ Sem conexão com PostgreSQL'); process.exit(1); }

  console.log(`📚 Inserindo ${conhecimentos.length} registros de conhecimento...`);
  let inseridos = 0, atualizados = 0;

  for (const k of conhecimentos) {
    const tags = k.tags ? `{${k.tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}` : '{}';
    const { rows } = await query(
      `SELECT id FROM base_conhecimento WHERE numero = $1 OR (titulo = $2 AND numero IS NULL)`,
      [k.numero || null, k.titulo]
    );
    if (rows.length > 0) {
      await query(
        `UPDATE base_conhecimento SET categoria=$1, titulo=$2, descricao=$3, conteudo=$4, tags=$5, vigente=$6, fonte_url=$7 WHERE id=$8`,
        [k.categoria, k.titulo, k.descricao, k.conteudo, tags, k.vigente !== false, k.fonte_url || null, rows[0].id]
      );
      atualizados++;
    } else {
      await query(
        `INSERT INTO base_conhecimento (categoria, titulo, numero, descricao, conteudo, tags, vigente, fonte_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [k.categoria, k.titulo, k.numero || null, k.descricao, k.conteudo, tags, k.vigente !== false, k.fonte_url || null]
      );
      inseridos++;
    }
  }

  console.log(`✅ Concluído: ${inseridos} inseridos, ${atualizados} atualizados.`);
  process.exit(0);
}

seed().catch(err => { console.error('❌ Erro:', err.message); process.exit(1); });
