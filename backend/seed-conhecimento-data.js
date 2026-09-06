// Dados da base de conhecimento técnico da construção civil
// Importado pelo server-pg.js na inicialização (seed automático)
module.exports = [
  {
    categoria: 'NR', titulo: 'NR-1 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais', numero: 'NR-1',
    descricao: 'Estabelece a obrigatoriedade do Gerenciamento de Riscos Ocupacionais (GRO) e do Programa de Gerenciamento de Riscos (PGR) para todos os empregadores.',
    conteudo: `NR-1 — Disposições Gerais e Gerenciamento de Riscos Ocupacionais (atualizada 2020).
PGR substitui o PPRA. Obrigações: identificar perigos, avaliar e classificar riscos, elaborar PGR, implementar medidas de prevenção.
Inventário de Riscos: mapa documental de todos os perigos. Plano de Ação com prazos.
Aplica-se a todos com empregados CLT. Na construção civil: PGR contempla quedas, soterramento, eletricidade, ruído, poeira, químicos.`,
    tags: ['GRO', 'PGR', 'riscos ocupacionais', 'segurança trabalho'], vigente: true
  },
  {
    categoria: 'NR', titulo: 'NR-5 — Comissão Interna de Prevenção de Acidentes (CIPA)', numero: 'NR-5',
    descricao: 'Regulamenta a CIPA — comissão paritária que identifica riscos e propõe medidas preventivas nas empresas.',
    conteudo: `NR-5 — CIPA. Construção civil: obrigatória com 70+ empregados. Abaixo: designar responsável pela segurança.
Composição paritária. Mandato 1 ano. Reunião mensal. SIPAT anual obrigatória.
Atribuições: identificar riscos, elaborar mapa de riscos, participar do PGR, investigar acidentes.`,
    tags: ['CIPA', 'prevenção', 'segurança trabalho', 'SIPAT'], vigente: true
  },
  {
    categoria: 'NR', titulo: 'NR-6 — Equipamentos de Proteção Individual (EPI)', numero: 'NR-6',
    descricao: 'Define obrigações quanto ao fornecimento, uso e conservação dos EPIs, com Certificado de Aprovação (CA) obrigatório.',
    conteudo: `NR-6 — EPI. Fornecimento gratuito. CA (Certificado de Aprovação) obrigatório.
EPIs construção: capacete (classes A/B/C), cinto paraquedista (NR-35 — acima de 2m), calçado biqueira aço, luvas, óculos, protetor auricular (≥85 dB), respirador (sílica, tintas).
Empregador registra entrega no Livro de EPI. Empregado obrigado a usar.`,
    tags: ['EPI', 'capacete', 'cinto segurança', 'proteção individual', 'CA'], vigente: true
  },
  {
    categoria: 'NR', titulo: 'NR-8 — Edificações', numero: 'NR-8',
    descricao: 'Requisitos técnicos mínimos de segurança e conforto para edificações onde trabalhadores exercem atividades.',
    conteudo: `NR-8 — Edificações. Piso antiderrapante, declive máx 5%. Pé-direito mínimo 3m.
Circulação: 1,20m (principal), 0,90m (secundária). Escadas: espelho ≤19,5cm, piso ≥25cm, corrimão ambos os lados.
Sanitários: 1 vaso/20 trabalhadores por sexo. Alojamentos: pé-direito mínimo 2,60m, 3m²/trabalhador.`,
    tags: ['edificações', 'sanitários', 'alojamento', 'pé-direito', 'escadas'], vigente: true
  },
  {
    categoria: 'NR', titulo: 'NR-10 — Segurança em Instalações e Serviços em Eletricidade', numero: 'NR-10',
    descricao: 'Requisitos de segurança para trabalhos em instalações elétricas. Exige qualificação e treinamento específico.',
    conteudo: `NR-10 — Eletricidade. Treinamento: 40h básico; SEP exige 40h adicionais.
LOTO (Lockout/Tagout) antes de qualquer serviço em instalação. Prontuário elétrico obrigatório.
Obra: extensões com aterramento e DR, disjuntores por circuito, proibido fios pelados.`,
    tags: ['eletricidade', 'NR-10', 'instalação elétrica', 'LOTO', 'quadro elétrico'], vigente: true
  },
  {
    categoria: 'NR', titulo: 'NR-12 — Segurança em Máquinas e Equipamentos', numero: 'NR-12',
    descricao: 'Medidas preventivas para uso seguro de máquinas e equipamentos na construção civil.',
    conteudo: `NR-12 — Máquinas. Betoneiras, gruas, marteletes, esmerilhadeiras exigem proteções.
Requisitos: proteção em partes móveis, dispositivo de parada acessível, manual em português, manutenção preventiva documentada, operador qualificado.
Grua: projeto estrutural por RT, inspeção periódica. Esmerilhadeira: EPI (óculos, face shield) e disco correto.`,
    tags: ['NR-12', 'máquinas', 'betoneira', 'grua', 'esmerilhadeira'], vigente: true
  },
  {
    categoria: 'NR', titulo: 'NR-18 — PCMAT — Construção Civil', numero: 'NR-18',
    descricao: 'Principal norma de segurança para canteiros de obras. PCMAT obrigatório para 20+ trabalhadores.',
    conteudo: `NR-18 — PCMAT. Elaborado por engenheiro de segurança ou técnico de segurança.
Instalações: sanitários separados por sexo, vestiário com armários, refeitório, cozinha, área de lazer (50+ trabalhadores).
Tapumes urbanos: altura ≥2,20m, sinalizados à noite. Andaimes: guarda-corpo ≥90cm, rodapé ≥15cm, calculados por RT.
Proteção anti-queda obrigatória desde 2m. ART/RRT obrigatória.`,
    tags: ['NR-18', 'PCMAT', 'canteiro obras', 'andaime', 'tapume', 'guarda-corpo'], vigente: true
  },
  {
    categoria: 'NR', titulo: 'NR-35 — Trabalho em Altura', numero: 'NR-35',
    descricao: 'Trabalho acima de 2m: exige cinto paraquedista, análise de risco, capacitação e plano de resgate.',
    conteudo: `NR-35 — Altura. Definição: acima de 2,00m com risco de queda.
Capacitação mínima: 8h teórico-práticas, renovação a cada 2 anos. AR e PT para atividades não rotineiras.
Cinto paraquedista com talabarte duplo. Ancoragem por RT. Síndrome do arnês: risco de morte em 15min suspenso.
Proibido trabalhar em altura com raios ou ventos fortes.`,
    tags: ['NR-35', 'trabalho altura', 'cinto paraquedista', 'ancoragem', 'queda'], vigente: true
  },
  {
    categoria: 'NBR', titulo: 'NBR 6118 — Projeto de Estruturas de Concreto Armado', numero: 'NBR 6118',
    descricao: 'Principal norma de dimensionamento de estruturas de concreto armado. Fck mínimo 20 MPa, cobrimentos, durabilidade 50 anos.',
    conteudo: `NBR 6118:2014 — Concreto armado e protendido.
Fck mínimo: 20 MPa; 25 MPa em ambientes agressivos. VUP mínima: 50 anos.
Cobrimento mínimo: CAA II urbano — 25mm (laje), 30mm (vigas/pilares).
ELU e ELS obrigatórios. ART de projeto estrutural e execução obrigatórios.`,
    tags: ['NBR 6118', 'concreto armado', 'estrutura', 'fck', 'cobrimento', 'armadura'], vigente: true
  },
  {
    categoria: 'NBR', titulo: 'NBR 6120 — Cargas para Estruturas de Edificações', numero: 'NBR 6120',
    descricao: 'Define sobrecargas mínimas de uso: residencial 1,5 kN/m², escritório 2,0 kN/m², escada coletiva 4,0 kN/m².',
    conteudo: `NBR 6120:2019 — Ações para estruturas. Cargas permanentes, variáveis e excepcionais.
Sobrecargas mínimas: residência 1,5 kN/m²; garagem leve 3,0 kN/m²; escritório 2,0 kN/m²; escada residencial 3,0; coletiva 4,0 kN/m².
Peso específico: concreto armado 25 kN/m³; alvenaria cerâmica 13 kN/m³.`,
    tags: ['NBR 6120', 'cargas', 'sobrecarga', 'estrutura', 'peso próprio'], vigente: true
  },
  {
    categoria: 'NBR', titulo: 'NBR 6122 — Projeto e Execução de Fundações', numero: 'NBR 6122',
    descricao: 'Norma para fundações superficiais (sapata, radier) e profundas (estacas). Sondagem SPT mínima obrigatória.',
    conteudo: `NBR 6122:2022 — Fundações. Superficiais: sapata, radier (solo resistente raso). Profundas: estacas, tubulões.
Sondagem SPT obrigatória: 1 furo/200m² ou 1 por bloco isolado mínimo.
Capacidade de carga: métodos Aoki-Velloso, Decourt-Quaresma. Recalque diferencial: limites na norma.
ART de projeto e execução obrigatórios.`,
    tags: ['NBR 6122', 'fundações', 'sapata', 'estaca', 'sondagem SPT', 'recalque'], vigente: true
  },
  {
    categoria: 'NBR', titulo: 'NBR 9050 — Acessibilidade', numero: 'NBR 9050',
    descricao: 'Parâmetros de acessibilidade para PcD. Rampa ≤8,33%, portas ≥80cm, área manobra 1,50m diâmetro.',
    conteudo: `NBR 9050:2020 — Acessibilidade. Manobra 360°: diâmetro 1,50m.
Rampa: ≤8,33% (1:12), largura ≥1,20m, patamar a cada 50m, corrimão bilateral.
Portas: ≥80cm residencial, ≥90cm uso coletivo, maçaneta alavanca.
Banheiro acessível: 1,50m x 1,70m, barras apoio. Estacionamento: 2% das vagas (mín 1) para PcD.
Piso tátil direcional e de alerta. Obrigatório em edificações públicas e de uso coletivo.`,
    tags: ['NBR 9050', 'acessibilidade', 'PcD', 'rampa', 'piso tátil', 'banheiro acessível'], vigente: true
  },
  {
    categoria: 'NBR', titulo: 'NBR 14037 — Manual do Proprietário', numero: 'NBR 14037',
    descricao: 'Construtoras devem entregar Manual do Proprietário com sistemas, manutenção, VUP e garantias de cada subsistema.',
    conteudo: `NBR 14037:2014 — Manual do proprietário. Obrigatório junto com as chaves.
Conteúdo: sistemas da edificação, procedimentos de uso/operação/limpeza, programa de manutenção preventiva, VUP de cada sistema, garantias legais (CDC) e contratuais, fornecedores.
Garantia mínima CDC: 5 anos vícios ocultos estruturais. Prazos recomendados NBR 15575.`,
    tags: ['NBR 14037', 'manual proprietário', 'manutenção', 'garantia', 'VUP'], vigente: true
  },
  {
    categoria: 'NBR', titulo: 'NBR 15575 — Norma de Desempenho Habitacional', numero: 'NBR 15575',
    descricao: 'Desempenho de edificações habitacionais: VUP, desempenho térmico, acústico e garantias mínimas por subsistema.',
    conteudo: `NBR 15575:2021 — 6 partes: estrutura, pisos, vedações, coberturas, hidrossanitários.
Níveis: Mínimo (M), Intermediário (I), Superior (S). VUP: estrutura ≥50 anos, impermeabilização ≥8 anos, pintura externa ≥4 anos.
Prazos de garantia recomendados: estrutura 5 anos, impermeabilização 3 anos, revestimentos 2 anos, pintura 1 ano.
Referência obrigatória para construtoras e Manual do Proprietário.`,
    tags: ['NBR 15575', 'desempenho', 'VUP', 'garantia', 'habitação', 'durabilidade'], vigente: true
  },
  {
    categoria: 'NBR', titulo: 'NBR 16280 — Reforma em Edificações', numero: 'NBR 16280',
    descricao: 'Reformas que afetam estrutura, vedação ou instalações exigem RT (ART/RRT) e aprovação do condomínio.',
    conteudo: `NBR 16280:2015 — Gestão de reformas. Reformas estruturais, hidráulicas, elétricas ou de fachada: RT obrigatório + comunicação ao síndico.
RT obrigatório: abertura de vão, remoção de parede, alteração de instalações, qualquer intervenção em fachada.
Síndico pode embargar reforma irregular. Penalidades: embargo, multa, responsabilidade civil.`,
    tags: ['NBR 16280', 'reforma', 'condomínio', 'síndico', 'ART', 'reforma estrutural'], vigente: true
  },
  {
    categoria: 'NBR', titulo: 'NBR 5410 — Instalações Elétricas de Baixa Tensão', numero: 'NBR 5410',
    descricao: 'Projeto e execução de instalações elétricas: circuitos, proteções, aterramento, DR obrigatório em áreas molhadas.',
    conteudo: `NBR 5410:2004 — Instalações elétricas BT. DR obrigatório em banheiros, áreas molhadas, piscinas.
Aterramento obrigatório (fio verde/verde-amarelo). Circuitos separados por uso.
Cores: neutro azul, fase preto/vermelho/marrom. ART/RRT de projeto e execução obrigatórios.`,
    tags: ['NBR 5410', 'instalação elétrica', 'disjuntor', 'DR', 'aterramento'], vigente: true
  },
  {
    categoria: 'NBR', titulo: 'NBR 8160 — Sistemas Prediais de Esgoto Sanitário', numero: 'NBR 8160',
    descricao: 'Projeto e execução de esgoto: ramais (declividade ≥2%), sifão, caixa de inspeção a cada 15m, ventilação obrigatória.',
    conteudo: `NBR 8160:1999 — Esgoto sanitário. Declividade mínima: 2% para DN 40-50mm; 1% para DN ≥75mm.
Sifão obrigatório em todos os aparelhos (fecho hídrico ≥25mm). Caixa de inspeção a cada 15m e em mudanças de direção.
Caixa de gordura obrigatória em cozinhas. Fossa séptica onde não há rede pública (NBR 7229/13969).`,
    tags: ['NBR 8160', 'esgoto sanitário', 'sifão', 'caixa inspeção', 'ventilação'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 6.766/1979 — Parcelamento do Solo Urbano', numero: 'Lei 6766/1979',
    descricao: 'Rege loteamentos e desmembramentos. Lote mínimo 125m², 35% de área pública, infraestrutura básica obrigatória.',
    conteudo: `Lei 6766/79 — Parcelamento do solo. Loteamento: abertura de novas vias. Desmembramento: sem novas vias.
Lote mínimo: 125m² com frente ≥5m. Destinação ao município: ≥35% (vias, espaços livres, equipamentos).
Infraestrutura básica: vias pavimentadas, água, esgoto, energia, coleta de lixo.
Registro no CRI obrigatório antes da venda. Crime vender lote não registrado (reclusão 1-4 anos).`,
    tags: ['Lei 6766', 'parcelamento solo', 'loteamento', 'desmembramento', 'lote', 'gleba'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 8.078/1990 — Código de Defesa do Consumidor (CDC)', numero: 'Lei 8078/1990',
    descricao: 'Vícios de construção: 90 dias para reclamar (bens duráveis). Responsabilidade objetiva da construtora. Art. 618 CC: 5 anos para vícios estruturais.',
    conteudo: `CDC — Lei 8078/90. Imóvel = bem durável. Prazo reclamação: 90 dias. Vício oculto: prazo a partir da evidência.
Responsabilidade objetiva da construtora. Memorial descritivo e maquete vinculantes.
Art. 618 CC: 5 anos irredutíveis para solidez e segurança da obra. Prescrição ação: 3 anos do aparecimento.
RT que assina ART/RRT sem ressalvas é corresponsável.`,
    tags: ['CDC', 'consumidor', 'garantia', 'vício construção', 'construtora', 'prazo garantia'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 10.257/2001 — Estatuto da Cidade', numero: 'Lei 10257/2001',
    descricao: 'Política urbana: Plano Diretor, IPTU progressivo, usucapião urbana, operações urbanas, EIV para grandes empreendimentos.',
    conteudo: `Estatuto da Cidade — Lei 10257/2001. Plano Diretor: obrigatório para municípios >20.000 hab.
Instrumentos: IPTU progressivo, usucapião urbana (250m², 5 anos), operações urbanas consorciadas, TDC, EIV.
Usucapião urbana individual: área ≤250m², 5 anos de posse, moradia própria, sem outro imóvel.
Construtoras: conhecer o Plano Diretor Municipal é essencial para viabilidade de projetos.`,
    tags: ['Estatuto da Cidade', 'plano diretor', 'usucapião urbana', 'IPTU progressivo', 'EIV'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 12.378/2010 — CAU/BR e Exercício da Arquitetura', numero: 'Lei 12378/2010',
    descricao: 'Cria o CAU/BR. Arquitetos emitem RRT (não ART). Atribuições privativas: projeto arquitetônico, interiores, paisagismo, patrimônio histórico.',
    conteudo: `Lei 12378/2010 — CAU/BR. RRT substitui ART para arquitetos e urbanistas.
Atribuições privativas: projeto arquitetônico, interiores, paisagismo, parcelamento do solo, restauro histórico.
Compartilhadas: coordenação projetos, gestão de obras, avaliações. No IMOVELI: fiadores CAU são arquitetos urbanistas.`,
    tags: ['CAU', 'RRT', 'arquiteto urbanista', 'Lei 12378', 'atribuições arquiteto'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 13.089/2015 — Estatuto da Metrópole', numero: 'Lei 13089/2015',
    descricao: 'Gestão metropolitana. PDUI obrigatório para regiões metropolitanas. Funções de interesse comum: transporte, saneamento, habitação.',
    conteudo: `Estatuto da Metrópole — Lei 13089/2015. PDUI aprovado pela assembleia legislativa estadual.
FPIC: transporte, saneamento, uso do solo, habitação — planejamento conjunto entre municípios.
Projetos de grande porte em regiões metropolitanas: observar PDUI além do Plano Diretor Municipal.`,
    tags: ['Estatuto Metrópole', 'região metropolitana', 'PDUI', 'gestão urbana'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 4.591/1964 — Condomínios e Incorporações Imobiliárias', numero: 'Lei 4591/1964',
    descricao: 'Regula incorporações imobiliárias (venda na planta). Memorial descritivo vinculante. Comissão de Representantes pode fiscalizar obra.',
    conteudo: `Lei 4591/64 — Incorporação imobiliária. Registro no CRI obrigatório antes de vender unidades.
Memorial descritivo vincula o incorporador. Não pode alterar sem consentimento dos compradores.
Patrimônio de afetação (Lei 10931/2004): conta exclusiva, escrituração separada, balancetes trimestrais.
RT: responsável pela conformidade com o memorial descritivo.`,
    tags: ['Lei 4591', 'condomínio', 'incorporação imobiliária', 'memorial descritivo', 'planta'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 13.465/2017 — REURB — Regularização Fundiária Urbana', numero: 'Lei 13465/2017',
    descricao: 'REURB-S (interesse social, gratuita) e REURB-E (interesse específico). Usucapião extrajudicial em cartório. Exige levantamento por RT.',
    conteudo: `Lei 13465/2017 — REURB. REURB-S: baixa renda, isenta custas. REURB-E: interesse de mercado.
Etapas: requerimento ao município → processamento → aprovação → registro no CRI.
Legitimação fundiária (imóvel público), legitimação de posse, CUEM.
Usucapião extrajudicial (art. 1.071 CPC): sem ação judicial, feita em cartório. RT elabora levantamento planialtimétrico e memorial descritivo.`,
    tags: ['REURB', 'regularização fundiária', 'REURB-S', 'usucapião extrajudicial', 'Lei 13465'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 13.786/2018 — Distrato Imobiliário', numero: 'Lei 13786/2018',
    descricao: 'Retenção máxima de 25% em distratos. Tolerância de 180 dias na entrega. Prazo de devolução 180 ou 30 dias conforme patrimônio de afetação.',
    conteudo: `Lei 13786/2018 — Distrato. Rescisão pelo comprador: retenção até 25% (50% em condomínio fechado).
Tolerância de entrega: 180 dias após data contratual — se exceder, comprador rescinde sem pena.
Quadro-Resumo obrigatório no contrato. Entrega do Habite-se no prazo evita distratos.`,
    tags: ['distrato', 'Lei 13786', 'rescisão', 'imóvel planta', 'tolerância entrega'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 6.496/1977 — ART — Anotação de Responsabilidade Técnica', numero: 'Lei 6496/1977',
    descricao: 'Institui a ART. Obrigatória para todo contrato de serviço técnico de engenharia/agronomia. Deve ser registrada antes do início.',
    conteudo: `Lei 6496/77 — ART. Todo contrato de serviço técnico deve ter ART registrada no CREA.
Tipos: ART de projeto, execução, vistoria, laudo, ensino. Registrar antes de iniciar.
Exercício sem ART: infração ética, multa e suspensão. ART vincula o profissional à garantia do Art. 618 CC.`,
    tags: ['ART', 'Lei 6496', 'responsabilidade técnica', 'CREA', 'contrato'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 13.146/2015 — Lei Brasileira de Inclusão (LBI)', numero: 'Lei 13146/2015',
    descricao: 'Edificações públicas e coletivas devem ser acessíveis. Reformas em edificações públicas exigem rota acessível. Complementa NBR 9050.',
    conteudo: `LBI — Lei 13146/2015. Novos projetos de uso público/coletivo: devem ser acessíveis (NBR 9050).
Reformas em edificações públicas: rota acessível obrigatória. Design Universal: sem adaptações específicas.
Descumprimento: embargo, multa, interdição, responsabilidade civil. RT: observar LBI + NBR 9050 em projetos de uso coletivo.`,
    tags: ['LBI', 'Lei 13146', 'acessibilidade', 'PcD', 'inclusão', 'design universal'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 10.931/2004 — Patrimônio de Afetação', numero: 'Lei 10931/2004',
    descricao: 'Separa recursos da obra do patrimônio geral do incorporador. Acesso ao RET (4% receita bruta). Proteção ao comprador em caso de falência.',
    conteudo: `Lei 10931/2004 — Patrimônio de afetação. Regime voluntário; averbado na matrícula do terreno.
Obrigações: conta bancária exclusiva, escrituração separada, balancetes trimestrais à Comissão.
RET: alíquota unificada de 4% sobre receita bruta (vantagem tributária). Dissolução após Habite-se + quitação.`,
    tags: ['patrimônio afetação', 'Lei 10931', 'RET', 'falência', 'incorporação'], vigente: true
  },
  {
    categoria: 'Lei Federal', titulo: 'Lei 5.194/1966 — Profissões de Engenharia e Arquitetura', numero: 'Lei 5194/1966',
    descricao: 'Cria o Sistema CONFEA/CREA. Define atribuições de engenheiros e arquitetos. Exercício ilegal da profissão é crime.',
    conteudo: `Lei 5194/66 — CONFEA/CREA. ART obrigatória para todo serviço técnico (regulamentada pela Lei 6496/77).
Engenheiro civil: projetos, cálculos, direção técnica, vistoria de obras civis.
Exercício ilegal: art. 47 da Lei de Contravenções Penais. Registro ativo no CREA é obrigatório.`,
    tags: ['CREA', 'ART', 'engenheiro', 'CONFEA', 'atribuições profissionais'], vigente: true
  },
  {
    categoria: 'Norma Incêndio', titulo: 'AVCB — Auto de Vistoria do Corpo de Bombeiros', numero: 'AVCB',
    descricao: 'Documento obrigatório para edificações de uso coletivo. Renovação a cada 3 anos. Exige PPCI aprovado pelos bombeiros.',
    conteudo: `AVCB — Corpo de Bombeiros. Obrigatório para comércio, serviços, indústria, hotelaria, hospitais, escolas, condomínios.
Sistemas exigidos: detecção e alarme (NBR 17240), sprinkler (NBR 10897), hidrante (NBR 13714), extintores (NBR 12693), iluminação emergência (NBR 10898), saídas de emergência (NBR 9077), SPDA (NBR 5419).
Processo: PPCI aprovado → execução → vistoria → AVCB. RT assina PPCI com ART/RRT.`,
    tags: ['AVCB', 'bombeiros', 'PPCI', 'sprinkler', 'hidrante', 'extintores', 'incêndio'], vigente: true
  },
  {
    categoria: 'Norma Incêndio', titulo: 'NBR 9077 — Saídas de Emergência em Edifícios', numero: 'NBR 9077',
    descricao: 'Define requisitos para escadas de segurança (EP, PF), portas corta-fogo, distância máxima de percurso e rotas de fuga.',
    conteudo: `NBR 9077:2001 — Saídas de emergência. Escada obrigatória em edifícios >4 pavimentos (varia por estado).
Tipos: EP (antecâmara com PCF), PF (pressurizada), NE (edifícios baixos). Largura ≥1,20m (até 200 pessoas).
Porta corta-fogo: 60-90 min de resistência. Distância máxima: 30m sem sprinkler; 45m com sprinkler.
Portas das unidades: abrem no sentido da fuga.`,
    tags: ['NBR 9077', 'saída emergência', 'escada segurança', 'porta corta-fogo', 'evacuação'], vigente: true
  },
  {
    categoria: 'Norma Incêndio', titulo: 'COSCIP / Instruções Técnicas — Corpo de Bombeiros', numero: 'COSCIP',
    descricao: 'Normas estaduais do Corpo de Bombeiros (SP: ITs do CBPMESP). Regulam PPCI, carga de incêndio, sistemas de combate e brigada.',
    conteudo: `COSCIP — SP: Decreto 63911/2018 + Instruções Técnicas CBPMESP.
Principais ITs: IT-01 (procedimentos), IT-11 (saídas emergência), IT-14 (carga incêndio), IT-17 (sprinkler), IT-18 (iluminação emergência), IT-20 (sinalização), IT-22 (hidrante), IT-41 (brigada), IT-43 (plano emergência).
Processo: PPCI aprovado na Prefeitura e Corpo de Bombeiros → execução → vistoria → AVCB.
Cada estado tem regulamentação própria.`,
    tags: ['COSCIP', 'bombeiros', 'IT', 'instrução técnica', 'PPCI', 'incêndio pânico'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Patologias — Fissuras, Trincas e Rachaduras', numero: null,
    descricao: 'Classificação: fissura <0,5mm, trinca 0,5-1mm, rachadura 1-10mm, fenda 10-50mm, brecha >50mm. Causas: recalque, retração, sobrecarga, corrosão.',
    conteudo: `Patologias construtivas — fissuras.
Classificação: fissura <0,5mm; trinca 0,5-1mm; rachadura 1-10mm (possível colapso); fenda 10-50mm (evacuação); brecha >50mm (crítico).
Causas: recalque diferencial (diagonal 45° — investigação geotécnica), retração concreto (mapeadas — cura), dilatação térmica, corrosão armadura (manchas ferrosas, carbonatação).
Diagnóstico: laudo de RT com ensaios (esclerometria, GPR, carbonatação). ART/RRT obrigatória no laudo.`,
    tags: ['fissura', 'trinca', 'rachadura', 'patologia construtiva', 'recalque', 'armadura'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Impermeabilização — Sistemas e Normas (NBR 9575 e 9574)', numero: null,
    descricao: 'Sistemas: manta asfáltica (lajes expostas, VUP ≥8 anos), membrana acrílica (banheiros), argamassa polimérica, cristalização. Teste de estanqueidade: 72h.',
    conteudo: `NBR 9575:2010 (seleção) e NBR 9574:2008 (execução) — Impermeabilização.
Áreas obrigatórias: lajes cobertura, terraços, banheiros, subsolos, piscinas, calhas.
Sistemas: manta asfáltica APP/SBS (3-4mm, expostas); membrana acrílica (áreas frias internas); cristalização (subsolos/reservatórios).
Rodapé: subir 20cm nas paredes. Teste estanqueidade: inundação 72h antes de cobrir.`,
    tags: ['impermeabilização', 'manta asfáltica', 'membrana acrílica', 'laje', 'NBR 9575'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Usucapião — Tipos, Prazos e Procedimento Extrajudicial', numero: null,
    descricao: 'Tipos: ordinária (10 anos), extraordinária (15/10 anos), urbana (250m², 5 anos), rural (50ha, 5 anos). Extrajudicial em cartório exige RT.',
    conteudo: `Usucapião no Brasil.
Ordinária: 10 anos (ou 5 anos com justo título e imóvel como moradia).
Extraordinária: 15 anos (ou 10 anos com moradia ou obras).
Urbana (art. 183 CF): ≤250m², 5 anos, moradia própria, sem outro imóvel.
Rural (art. 191 CF): ≤50ha, 5 anos, produtiva, sem outro imóvel.
Extrajudicial (art. 1.071 CPC): no Cartório de Imóveis — mais rápido. Exige: levantamento planialtimétrico + memorial descritivo assinado por RT (ART/RRT), ata notarial, concordância dos confrontantes.`,
    tags: ['usucapião', 'usucapião extrajudicial', 'usucapião urbana', 'posse', 'cartório', 'RT'], vigente: true
  },
  {
    categoria: 'Resolucao', titulo: 'Resolução CONFEA 1.025/2009 — Atribuições de Engenharia', numero: 'Resolução CONFEA 1025/2009',
    descricao: 'Define atribuições por título: Engenheiro Civil (projetos, obras civis completas) vs Técnico em Edificações (obras pequenas, limitações por estado).',
    conteudo: `Resolução CONFEA 1025/2009 — Atribuições profissionais.
Engenheiro Civil: projetos, cálculos, execução, coordenação, vistoria, laudo, perícia em obras civis.
Técnico em Edificações (nível médio): execução e fiscalização de obras de pequeno porte; projetos simples (área máxima por estado). Não pode assinar projetos estruturais ou instalações complexas.
Registro ativo no CREA obrigatório para exercer. Exercício fora das atribuições: infração ética e legal.`,
    tags: ['CONFEA', 'atribuições', 'engenheiro civil', 'técnico edificações', 'CREA'], vigente: true
  },

  // ── PLATAFORMA IMOVELI ───────────────────────────────────────────────────
  {
    categoria: 'IMOVELI', titulo: 'Como funciona a IMOVELI — Guia Completo', numero: null,
    descricao: 'Rede de profissionais da construção civil baseada em Cadeia de Responsabilidade Técnica (CRT). Responsável Técnico (RT) chancelam os profissionais indicados.',
    conteudo: `IMOVELI — Plataforma de rede profissional baseada em confiança técnica.
Responsável Técnico (RT): arquiteto (CAU) ou engenheiro (CREA) com registro ativo. Assina a Cadeia de Responsabilidade Técnica (CRT), assumindo corresponsabilidade técnica pelos profissionais que indica.
Profissional Indicado: pedreiro, eletricista, encanador, pintor, etc. Aparece na rede após aceite do RT. Perfil vinculado ao RT com número único IMOVELI.
Cliente: posta demanda → recebe propostas de profissionais verificados pelo RT → contrata com segurança.
Vantagem: todos os profissionais têm um RT que responde tecnicamente — muito mais seguro que marketplaces sem curadoria.`,
    tags: ['IMOVELI', 'CRT', 'responsável técnico', 'como funciona', 'plataforma'], vigente: true
  },
  {
    categoria: 'IMOVELI', titulo: 'Cadeia de Responsabilidade Técnica (CRT) — O que é', numero: null,
    descricao: 'A CRT é o diferencial da IMOVELI. O RT assina uma declaração de responsabilidade técnica pelos profissionais que indica, criando uma hierarquia de confiança verificável.',
    conteudo: `Cadeia de Responsabilidade Técnica (CRT) — IMOVELI.
O RT assume responsabilidade técnica compartilhada pelos serviços realizados pelos profissionais que indica. Isso cria responsabilização real e profissionalismo.
Hierarquia: RT (arquiteto/engenheiro CREA/CAU) → Profissional Indicado → Cliente.
Documentação: ART ou RRT do RT vincula profissionais indicados às obras. Cliente pode exigir essa documentação.
Por que importa: em caso de vício de construção (Art. 618 CC), o RT e o profissional respondem solidariamente. Elimina o "jeitinho sem responsabilidade".`,
    tags: ['CRT', 'responsabilidade técnica', 'ART', 'RRT', 'vício construção', 'IMOVELI'], vigente: true
  },
  {
    categoria: 'IMOVELI', titulo: 'Como se tornar Responsável Técnico (RT) na IMOVELI', numero: null,
    descricao: 'RT é o arquiteto ou engenheiro civil com CREA/CAU ativo que assina a CRT. Deve ter registro no conselho, ser verificado pela plataforma e aceitar os termos.',
    conteudo: `Tornando-se RT na IMOVELI.
Requisitos: registro ativo no CREA (engenheiro) ou CAU (arquiteto/urbanista) + acervo técnico. A plataforma verifica automaticamente no portal do conselho.
Processo: cadastro → preenchimento de perfil (especialidades, região de atuação, bio) → verificação do conselho → aprovação.
Vantagens: visibilidade profissional, gestão digital de equipe, acesso a clientes verificados, histórico de indicações.
Responsabilidades: acompanhar tecnicamente os profissionais indicados, emitir ART/RRT quando necessário, manter registro ativo.`,
    tags: ['RT', 'responsável técnico', 'CREA', 'CAU', 'cadastro', 'verificação'], vigente: true
  },
  {
    categoria: 'IMOVELI', titulo: 'Leilão Reverso — Como Funciona na IMOVELI', numero: null,
    descricao: 'Cliente posta a demanda (tipo de serviço, localização, orçamento estimado) e profissionais verificados enviam propostas. Cliente escolhe pelo melhor custo-benefício.',
    conteudo: `Leilão Reverso IMOVELI.
1. Cliente cadastra demanda: tipo de serviço, descrição, localização, prazo e orçamento estimado.
2. Profissionais verificados na região recebem notificação e enviam propostas com valor, prazo e portfólio.
3. Cliente avalia propostas, vê perfil do profissional, nome do RT responsável e avaliações anteriores.
4. Cliente escolhe e confirma contrato na plataforma.
Vantagem competitiva: todos os profissionais são chancelados por um RT — elimina o risco de contratar pedreiro sem responsabilidade técnica.`,
    tags: ['leilão reverso', 'proposta', 'orçamento', 'contratação', 'IMOVELI'], vigente: true
  },
  {
    categoria: 'IMOVELI', titulo: 'Match Inteligente — Algoritmo de Recomendação IMOVELI', numero: null,
    descricao: 'O Match Inteligente cruza especialidade, localização (raio geográfico), avaliação, preço médio e disponibilidade para recomendar o profissional mais adequado.',
    conteudo: `Match Inteligente — IMOVELI.
Variáveis consideradas: especialidade (pedreiro, eletricista, etc.), distância (raio do cliente), avaliação média, faixa de preço, disponibilidade e histórico de obras.
RT influencia: profissionais indicados por RT com maior reputação sobem no ranking.
Para o profissional: manter perfil completo, fotos de obras, responder rapidamente às propostas e ter boas avaliações melhora o ranking de match.
Para o cliente: quanto mais detalhada a demanda, melhor o match.`,
    tags: ['match inteligente', 'algoritmo', 'recomendação', 'ranking', 'IMOVELI'], vigente: true
  },

  // ── REGULARIZAÇÃO E DOCUMENTAÇÃO ────────────────────────────────────────
  {
    categoria: 'Regularização', titulo: 'Habite-se — O que é e Como Obter', numero: null,
    descricao: 'Certidão emitida pela prefeitura atestando que a edificação foi construída conforme o projeto aprovado. Obrigatório para registro, financiamento e venda.',
    conteudo: `Habite-se (CVCO — Certidão de Vistoria de Conclusão de Obra).
Emitido pela Prefeitura após vistoria de que a obra foi concluída conforme projeto aprovado.
Documentos exigidos (variam por município): projeto aprovado, ART/RRT de execução, ART hidráulica e elétrica, AVCB (bombeiros), laudos de ensaios, fotos da obra.
Sem Habite-se: imóvel irregular, sem registro no CRI, não financia pelo banco, dificulta venda.
Após Habite-se: averbar no CRI para atualizar a matrícula com a nova construção.`,
    tags: ['habite-se', 'CVCO', 'certidão', 'prefeitura', 'regularização', 'averbação'], vigente: true
  },
  {
    categoria: 'Regularização', titulo: 'Averbação de Construção no Cartório de Imóveis', numero: null,
    descricao: 'Após o Habite-se, a construção deve ser averbada na matrícula do imóvel no CRI. Sem averbação, o imóvel financiado não tem a construção reconhecida.',
    conteudo: `Averbação de construção — CRI (Cartório de Registro de Imóveis).
Após obter o Habite-se, apresentar ao CRI: Habite-se, ART/RRT de execução, certidão negativa de débitos (INSS/FGTS da obra se necessário).
Resultado: a matrícula do imóvel passa a registrar a existência da edificação com área, destinação e metragem.
Importância: imóvel averbado tem valor de mercado real, pode ser financiado (Caixa, Banco do Brasil), transmitido com segurança jurídica.
RT é responsável pela ART/RRT que embasa a averbação.`,
    tags: ['averbação', 'cartório', 'CRI', 'matrícula', 'registro imóveis', 'habite-se'], vigente: true
  },
  {
    categoria: 'Regularização', titulo: 'Retificação de Área — Procedimento Extrajudicial e Judicial', numero: null,
    descricao: 'Corrige divergências de área entre a matrícula e a medição real. Extrajudicial (art. 213 LRP): até 1/20 da área, no cartório. Judicial: para divergências maiores.',
    conteudo: `Retificação de área — Lei 6015/73, art. 213.
Extrajudicial: diferença de até 1/20 (5%) da área registrada. Documentos: levantamento planialtimétrico + memorial descritivo por RT (ART/RRT), anuência dos confrontantes.
Judicial: diferença >5%, sem anuência de confrontantes ou área pública.
RT faz o levantamento georreferenciado e assina memorial descritivo. CREA/CAU verifica habilitação para georreferenciamento.
Georreferenciamento rural (zonas rurais): obrigatório pelo INCRA (Decreto 4449/2002).`,
    tags: ['retificação área', 'georreferenciamento', 'cartório', 'matrícula', 'memorial descritivo'], vigente: true
  },
  {
    categoria: 'Regularização', titulo: 'REURB — Regularização Fundiária Urbana Passo a Passo', numero: null,
    descricao: 'REURB-S (social, gratuita para baixa renda) e REURB-E (específica). Processo municipal com levantamento por RT, aprovação e registro no CRI.',
    conteudo: `REURB — Lei 13465/2017. Passo a passo:
1. Requerimento: ao município ou associação de moradores. REURB-S: isento de custas para baixa renda.
2. Processamento: município verifica localização, limites, confrontantes, notifica os interessados.
3. Elaboração do projeto de regularização: RT elabora planta de situação, quadro de áreas, memorial descritivo (ART/RRT obrigatória).
4. Aprovação pelo município: emite CRF (Certidão de Regularização Fundiária).
5. Registro no CRI: CRF + projeto aprovado → registro das unidades → emissão de matrículas individuais.
Instrumentos: legitimação fundiária, legitimação de posse, CUEM, CDRU.`,
    tags: ['REURB', 'REURB-S', 'regularização fundiária', 'CRF', 'legitimação', 'município'], vigente: true
  },
  {
    categoria: 'Regularização', titulo: 'ART — Anotação de Responsabilidade Técnica — Guia Prático', numero: null,
    descricao: 'Obrigatória para todo contrato de serviço técnico de engenharia. Deve ser registrada no CREA antes do início. Vincula o profissional à responsabilidade civil e penal.',
    conteudo: `ART — Anotação de Responsabilidade Técnica (CREA).
Obrigatória para: projeto, execução, vistoria, laudo, perícia, ensino — todo serviço técnico de engenharia e agronomia.
Registrar ANTES do início do serviço no portal CREA-NET ou presencialmente.
Tipos: ART de projeto (antes de entregar), ART de execução (antes de iniciar a obra), ART de vistoria/laudo.
Valor: proporcional ao contrato (tabela do CREA estadual). Geralmente R$50-R$200 para obras residenciais pequenas.
Consequência sem ART: infração ética (processo no CREA), multa, suspensão do exercício profissional.
ART cobre: responsabilidade civil e penal do profissional. Garante ao cliente identificar quem responde pela obra.`,
    tags: ['ART', 'CREA', 'responsabilidade técnica', 'registro', 'contrato', 'profissional'], vigente: true
  },
  {
    categoria: 'Regularização', titulo: 'RRT — Registro de Responsabilidade Técnica — Guia Prático', numero: null,
    descricao: 'Equivalente da ART para arquitetos e urbanistas no CAU. Obrigatório para todo serviço técnico de arquitetura. Emitido pelo sistema CAU/BR.',
    conteudo: `RRT — Registro de Responsabilidade Técnica (CAU).
Obrigatório para arquitetos e urbanistas: projeto arquitetônico, interiores, paisagismo, patrimônio histórico, gestão de obra.
Emitido pelo portal CAU/BR antes do início do serviço.
Valor: tabela anual do CAU. Pode ser por serviço ou anual (RRT anual cobre todos os projetos do ano).
Acervo técnico: cada RRT emitido compõe o acervo profissional do arquiteto — importante para concursos, habilitações e crédito.
Diferença ART×RRT: conteúdo equivalente, mas emissores diferentes (CREA vs CAU). Projetos multidisciplinares (arq+eng): ambos emitem o seu.`,
    tags: ['RRT', 'CAU', 'arquiteto', 'responsabilidade técnica', 'acervo técnico'], vigente: true
  },

  // ── ORÇAMENTO E GESTÃO DE OBRAS ─────────────────────────────────────────
  {
    categoria: 'Orçamento', titulo: 'SINAPI — Sistema Nacional de Pesquisa de Custos e Índices', numero: null,
    descricao: 'Referencial de custos da Caixa Econômica Federal. Usado em obras públicas e financiamentos. Composições de serviços com insumos, mão de obra e equipamentos.',
    conteudo: `SINAPI — Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil.
Gerido pela CEF e IBGE. Referencial obrigatório para obras públicas (Lei 8666/93 e RDC).
Composições: cada serviço tem código, insumos, produtividade e custo unitário por estado.
Desonerado (sem encargos patronais) e não-desonerado: usar o correto conforme o regime tributário.
BDI (Bonificações e Despesas Indiretas): acrescido ao custo direto. Obras públicas: 20-28% (TCU).
CUB (SINDUSCON): custo unitário básico por m² para orçamento paramétrico inicial.`,
    tags: ['SINAPI', 'orçamento', 'CUB', 'BDI', 'composições', 'custo obra'], vigente: true
  },
  {
    categoria: 'Orçamento', titulo: 'Curva ABC de Insumos — Como Usar em Obras', numero: null,
    descricao: 'Pareto aplicado ao orçamento: identifica os 20% de itens que representam 80% do custo. Essencial para controle de compras e negociação.',
    conteudo: `Curva ABC de insumos — Obras.
A (vitais): top 20% dos itens = ~80% do custo. Ex: concreto, aço, impermeabilização, esquadrias.
B (importantes): ~30% dos itens = ~15% do custo. Ex: revestimentos, hidráulica.
C (triviais): ~50% dos itens = ~5% do custo. Ex: parafusos, fita, selante.
Uso: focar negociação de preço nos itens A, comprar antecipado, controlar estoque. Software: Sienge, Obra Prima, planilha Excel.
RT deve analisar curva ABC antes de fechar contratos de grande porte.`,
    tags: ['curva ABC', 'orçamento', 'insumos', 'controle custo', 'pareto'], vigente: true
  },
  {
    categoria: 'Orçamento', titulo: 'Cronograma Físico-Financeiro — Elaboração e Controle', numero: null,
    descricao: 'Planeja no tempo o avanço físico (% executado) e financeiro (R$ desembolsado) da obra. Exigido em financiamentos e contratos públicos.',
    conteudo: `Cronograma Físico-Financeiro.
Físico: percentual de avanço de cada serviço por período (semana ou mês). Diagrama de Gantt.
Financeiro: desembolso previsto de recursos por período. Curva S: acumulado financeiro ao longo do tempo.
Elaboração: WBS (EAP) → sequência de atividades → duração → recursos → custo por período.
Desvio físico-financeiro (earned value): compara planejado vs executado. IDP (Índice de Desempenho de Prazo) e IDC (Custo).
Exigido por: CEF, BNDES, obras públicas (Decreto 7983/2013). RT assina o cronograma com ART.`,
    tags: ['cronograma', 'físico-financeiro', 'curva S', 'planejamento obra', 'earned value'], vigente: true
  },

  // ── PRÁTICAS CONSTRUTIVAS ────────────────────────────────────────────────
  {
    categoria: 'Pratica Construtiva', titulo: 'Concreto — Fck, Resistência, Dosagem e Controle', numero: null,
    descricao: 'Fck é a resistência característica à compressão. Dosagem ABCP ou experimental. Controle por corpos de prova. Traço em volume ou em massa.',
    conteudo: `Concreto — Conceitos essenciais.
Fck: resistência característica à compressão (MPa). Mínimo: 20 MPa (NBR 6118). Estruturas agressivas: 25-35 MPa.
Relação água/cimento: quanto menor, mais resistente e durável. Máx NBR 6118: 0,50 (CAA I) a 0,45 (CAA IV).
Controle: corpos de prova cilíndricos 10×20cm, cura 28 dias. Mínimo 2 CP por caminhão betoneira ou a cada 10m³.
Slump (abatimento): 6-10cm = obra normal. Retemperar com água é proibido. Adicionar aditivo plastificante se necessário.
Bombeável: slump >10cm. Concreto auto-adensável: sem vibração.
ART do concreto usinado obrigatória na nota fiscal.`,
    tags: ['concreto', 'fck', 'resistência', 'slump', 'corpo de prova', 'relação água cimento'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Alvenaria — Blocos Cerâmicos, de Concreto e Estrutural', numero: null,
    descricao: 'Alvenaria de vedação (não estrutural) vs estrutural. Blocos cerâmicos NBR 15270, blocos de concreto NBR 6136. Amarração, modulação e graute.',
    conteudo: `Alvenaria — tipos e normas.
Vedação: não suporta carga vertical além do próprio peso. Blocos cerâmicos (NBR 15270) ou concreto (NBR 6136).
Estrutural (NBR 16868): suporta cargas de laje e pavimentos superiores. Blocos de concreto ou cerâmicos com vazados grauteados.
Modulação: planejar em múltiplos do bloco evita quebras e desperdício (projeto de modulação NBR 15961).
Amarração: cada fiada alterna a posição do bloco para travar as juntas verticais.
Graute: mistura fluida de concreto bombeada para dentro dos vazados — aumenta resistência da alvenaria estrutural.
Verga e contraverga: acima e abaixo de vãos (portas, janelas) — evitam fissuras nos cantos.`,
    tags: ['alvenaria', 'bloco cerâmico', 'alvenaria estrutural', 'graute', 'modulação', 'verga'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Instalação Hidrossanitária — Água Fria, Quente e Esgoto', numero: null,
    descricao: 'NBR 5626 (água fria), NBR 7198 (água quente), NBR 8160 (esgoto). Pressões, diâmetros, reservatório inferior e superior, recalque e distribuição.',
    conteudo: `Instalações hidrossanitárias — boas práticas.
Água fria (NBR 5626): pressão mínima 5 mca, máxima 40 mca. Reservatório: volume mínimo = consumo de 1 dia (200 L/pessoa).
Reservatório inferior (cisterna) + bomba + reservatório superior = sistema de recalque. Superior: pelo menos 3h de consumo.
Água quente (NBR 7198): tubulação CPVC ou PEX. Isolamento térm. em áreas externas.
Barrilete (cobertura): distribui para as colunas de descida. Respeitar declividade mínima e diâmetros mínimos.
Esgoto: sifão obrigatório em todos os aparelhos. Caixa sifonada no banheiro e caixa de gordura na cozinha.`,
    tags: ['hidráulica', 'instalação hidrossanitária', 'NBR 5626', 'reservatório', 'esgoto', 'recalque'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Argamassa — Tipos, Traços e Aplicações', numero: null,
    descricao: 'Argamassa de assentamento, chapisco, emboço, reboco e contrapiso. Traços em volume ou em massa. NBR 13281, NBR 7200.',
    conteudo: `Argamassa — tipos e traços.
Chapisco: 1:3 (cimento:areia) com aditivo. Aplicar antes do emboço em superfícies lisas.
Emboço/reboco: 1:2:8 (cimento:cal:areia) ou argamassa industrializada. Espessura: 2-2,5cm.
Assentamento de blocos: 1:0,5:4 a 1:1:6 (cimento:cal:areia). Juntas: 10-15mm horizontal, 10mm vertical.
Assentamento de revestimentos cerâmicos (NBR 14081): argamassa AC-I (paredes internas secas), AC-II (paredes externas/molhadas), AC-III (piscinas, fachadas).
Contrapiso: 1:4 (cimento:areia) + aditivo. Espessura 3-5cm. Cura 28 dias antes de assentar revestimento.`,
    tags: ['argamassa', 'chapisco', 'emboço', 'reboco', 'traço', 'assentamento', 'AC-II'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Cobertura — Telhados, Inclinações e Materiais', numero: null,
    descricao: 'Telhas cerâmicas (30-45%), fibrocimento (10-25%), metálicas (5-35%), shingle. NBR 7190 para estrutura de madeira. Cumeeira, calha e rufos.',
    conteudo: `Cobertura — telhados.
Inclinações mínimas: cerâmica 30%, fibrocimento ondulado 10%, fibrocimento trapezoidal 5%, metálica 5%, PVC 3%, shingle 18%.
Estrutura madeira (NBR 7190): tesoura, caibros (espaçamento ≤0,5m), ripas. ART/RRT estrutural obrigatória.
Impermeabilização da laje antes da cobertura: manta SBS ou similar (VUP ≥8 anos).
Calha e rufo: zincado ou PVC. Declividade da calha ≥1%. Saída d'água a cada 40m².
Telhado verde: sobrecarga ≥150 kg/m² — projeto estrutural específico por engenheiro.
SPDA (para-raios): obrigatório em edificações >10m de altura (NBR 5419).`,
    tags: ['cobertura', 'telhado', 'telha cerâmica', 'inclinação', 'calha', 'impermeabilização'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Vedações — Dry Wall, EPS e Sistemas Leves', numero: null,
    descricao: 'Dry wall (drywall): gesso acartonado em perfis metálicos. NBR 15758. Mais rápido, mais leve, não estrutural. Ideal para divisórias internas e forros.',
    conteudo: `Dry wall e vedações leves.
Drywall (NBR 15758): chapas de gesso acartonado (ST normal, RU resistente a umidade, RF resistente ao fogo) em perfis metálicos.
Espessura parede simples: 2 chapas + perfil 70mm = 100mm total. Dupla: melhor acústica.
Instalações: embutidas na cavidade. Não rasgar horizontalmente — prejudica resistência estrutural.
EPS (isopor estrutural): sistema construtivo leve, bom desempenho térmico e acústico. Estrutura de aço com concreto projetado.
Limitações drywall: não suporta grandes cargas em parede (use buchas especiais ≤ 10kg). Áreas molhadas: usar chapas RU + impermeabilização.`,
    tags: ['drywall', 'dry wall', 'gesso acartonado', 'vedação leve', 'EPS', 'forro'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Esquadrias — Portas e Janelas: Materiais e Desempenho', numero: null,
    descricao: 'Alumínio, PVC, madeira, aço e misto. Desempenho: estanqueidade à água (NBR 10821), permeabilidade ao ar, resistência a cargas. Verga obrigatória.',
    conteudo: `Esquadrias — portas e janelas.
Materiais: alumínio (NBR 10821), PVC (NBR 15498), madeira (NBR 15930), aço.
Desempenho NBR 10821: 5 características: resistência à ação do vento, estanqueidade à água, permeabilidade ao ar, resistência a operações de abertura/fechamento, deformação.
Instalação: verga (acima) e contraverga (abaixo) em alvenaria — obrigatórias para evitar fissuras nos cantos.
Arremate: impermeabilizar a junta entre esquadria e alvenaria. Peitoril com pingadeira voltada para fora.
Acessibilidade (NBR 9050): portas ≥80cm livres residencial, ≥90cm coletivo. Maçaneta tipo alavanca.`,
    tags: ['esquadrias', 'janela', 'porta', 'alumínio', 'verga', 'estanqueidade', 'NBR 10821'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Revestimentos Cerâmicos e Porcelanato — Assentamento e Patologias', numero: null,
    descricao: 'NBR 13816 (terminologia), NBR 13818 (absorção, PEI), NBR 14081 (argamassa AC). Descolamento, eflorescência e juntas de dilatação.',
    conteudo: `Revestimentos cerâmicos — assentamento profissional.
Absorção de água: BIa (porcelanato ≤0,5%), BIb (±3%), BII (6-10%), BIII (>10%). Fachadas: usar BIa ou BIb.
PEI (resistência ao desgaste): PEI 0 (parede), PEI 1 (banheiro residencial), PEI 3 (sala), PEI 4 (comércio), PEI 5 (indústria).
Argamassa: AC-I (paredes internas secas), AC-II (externas, piscina), AC-III (fachada com deformação).
Juntas de movimentação: a cada 3m em pisos internos, 1-2m em fachadas. Rejunte flexível nas juntas.
Patologias: descolamento (argamassa vencida ou espessura inadequada), eflorescência (umidade atravessando).`,
    tags: ['cerâmica', 'porcelanato', 'PEI', 'absorção', 'AC-II', 'junta dilatação', 'rejunte'], vigente: true
  },

  // ── SUSTENTABILIDADE E CERTIFICAÇÕES ────────────────────────────────────
  {
    categoria: 'Sustentabilidade', titulo: 'AQUA-HQE — Certificação de Alta Qualidade Ambiental', numero: null,
    descricao: 'Certificação francesa adaptada ao Brasil pela Fundação Vanzolini. Avalia 14 categorias de desempenho ambiental. Equivalente ao LEED para edifícios brasileiros.',
    conteudo: `AQUA-HQE — Alta Qualidade Ambiental.
14 categorias: relação com entorno, escolha de produtos, canteiro baixo impacto, gestão de energia, água, resíduos, manutenção, conforto higrotérmico, acústico, visual, olfativo, qualidade do ar, da água.
Fases: programa (briefing ambiental), concepção (projeto), realização (obra), operação (pós-entrega).
Auditoria pela Fundação Vanzolini. RT deve documentar todas as decisões de projeto.
Incentivos: IPTU verde em muitos municípios, financiamento facilitado, valorização de 10-15% no VGV.`,
    tags: ['AQUA', 'HQE', 'certificação ambiental', 'sustentabilidade', 'edificação verde'], vigente: true
  },
  {
    categoria: 'Sustentabilidade', titulo: 'LEED — Leadership in Energy and Environmental Design', numero: null,
    descricao: 'Certificação americana do USGBC. No Brasil: LEED v4 para BD+C (novas construções), O+M (operações) e ID+C (interiores). Créditos em energia, água, materiais, inovação.',
    conteudo: `LEED — Leadership in Energy and Environmental Design.
Versão atual: LEED v4.1. Categorias BD+C: local sustentável, eficiência hídrica, energia e atmosfera, materiais e recursos, qualidade ambiental interna, inovação, prioridade regional.
Pontuação: Certified (40-49pt), Silver (50-59pt), Gold (60-79pt), Platinum (≥80pt).
Pré-requisitos obrigatórios: redução mínima 20% no uso de água, comissionamento de energia, não uso de CFCs.
RT que coordena projetos LEED deve conhecer os créditos aplicáveis desde o partido arquitetônico.`,
    tags: ['LEED', 'certificação', 'sustentabilidade', 'green building', 'eficiência energética'], vigente: true
  },
  {
    categoria: 'Sustentabilidade', titulo: 'Eficiência Energética — NBR 15575 e RTQ-R', numero: null,
    descricao: 'RTQ-R: regulamento para etiquetagem de eficiência energética residencial (A a E). NBR 15575 define desempenho térmico mínimo por zona bioclimática.',
    conteudo: `Eficiência energética em edificações residenciais.
NBR 15575 partes 4 e 5: desempenho térmico por zona bioclimática (1-8). Zona 1-3 (Sul): prioridade retenção calor. Zona 4-8 (Centro-Norte): ventilação e sombreamento.
RTQ-R (Portaria INMETRO): avalia envoltória (paredes, cobertura, janelas), iluminação e AQS (aquecimento de água solar).
Etiqueta A (mais eficiente) → E. Etiqueta A exige: transmitância de parede ≤2,0 W/m²K (zona 4), proteção solar das janelas (FS ≤2,0).
Para arquiteto: ventilação cruzada, proteção solar, cores claras nas fachadas e cobertura reduzem carga térmica.`,
    tags: ['eficiência energética', 'RTQ-R', 'NBR 15575', 'zona bioclimática', 'transmitância', 'etiqueta'], vigente: true
  },

  // ── FUNDAÇÕES E SOLO ─────────────────────────────────────────────────────
  {
    categoria: 'Pratica Construtiva', titulo: 'Sondagem SPT — Interpretação e Uso no Projeto', numero: null,
    descricao: 'SPT (Standard Penetration Test): mede resistência do solo a cada metro. NSPT define tipo de fundação. NBR 6484 e 6122.',
    conteudo: `Sondagem SPT — Standard Penetration Test.
Ensaio: golpes de 63,5 kg para penetrar 30cm o amostrador. NSPT = número de golpes.
Interpretação: NSPT 0-4: solo muito mole (sapata impossível); 5-8: mole; 9-19: médio; ≥20: rígido (sapata possível se superficial); ≥40: duro/muito rígido.
Perfil de sondagem: solo coeso (argila/silte) vs granular (areia/pedregulho). Nível d'água (NA): fundamental para escavação.
Mínimo de sondagens (NBR 6122): 1 por 200m² ou 1 por bloco isolado, o que for menor.
RT define o tipo de fundação com base na sondagem: sapata, radier, estaca hélice contínua, estaca raiz, tubulão.`,
    tags: ['sondagem', 'SPT', 'NSPT', 'fundação', 'solo', 'capacidade de carga'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Estacas — Tipos, Execução e Controle de Qualidade', numero: null,
    descricao: 'Hélice contínua (HC), estaca raiz, franki, pré-moldada, cravada. Prova de carga estática obrigatória acima de determinado porte. NBR 6122 e 12131.',
    conteudo: `Estacas — fundações profundas.
Hélice Contínua Monitorada (HC): mais comum em obras urbanas. Rápida, sem vibração, concreto e armação simultaneamente. Controle: relatório de monitoramento eletrônico.
Estaca raiz: diâmetro pequeno (15-25cm), altíssima carga, ideal para terrenos difíceis e reforço de fundações.
Pré-moldada (concreto ou aço): cravada por bate-estaca. Verificar vibração e nível de ruído (licença ambiental em zonas urbanas).
Franki: adensamento do solo no pé — boa capacidade de carga em areias.
Prova de carga (NBR 12131): obrigatória em obras >25 estacas ou quando NBR 6122 exigir. RT assina laudo com ART.`,
    tags: ['estaca', 'hélice contínua', 'estaca raiz', 'prova de carga', 'NBR 12131', 'fundação profunda'], vigente: true
  },

  // ── AVALIAÇÃO IMOBILIÁRIA ─────────────────────────────────────────────────
  {
    categoria: 'Avaliação Imobiliária', titulo: 'Avaliação Imobiliária — NBR 14653 e CREA/CAU', numero: 'NBR 14653',
    descricao: 'Laudo de avaliação por RT (engenheiro ou arquiteto). Métodos: comparativo, renda, custo. Valor de mercado, locativo, patrimonial. Graus de fundamentação.',
    conteudo: `Avaliação Imobiliária — NBR 14653.
Partes: 1 (procedimentos gerais), 2 (imóveis urbanos), 3 (rurais), 4 (empreendimentos), 5 (máquinas e equipamentos).
Método comparativo: principal para imóveis urbanos. Pesquisa de mercado com ≥3 amostras (grau II) ou ≥5 (grau III).
Graus de fundamentação: I, II, III. Grau III: 6+ amostras, tratamento estatístico inferencial, variáveis independentes.
RT assina laudo com ART/RRT. Responsabilidade civil e penal pelo valor atribuído.
Uso: financiamento (banco), seguro, inventário, desapropriação, imposto causa mortis, divórcio, garantia judicial.`,
    tags: ['avaliação imobiliária', 'NBR 14653', 'laudo', 'valor de mercado', 'PTAM', 'método comparativo'], vigente: true
  },
  {
    categoria: 'Avaliação Imobiliária', titulo: 'Vistoria Cautelar — O que é e Para que Serve', numero: null,
    descricao: 'Vistoria realizada pelo RT antes ou durante obra vizinha para documentar o estado do imóvel. Protege o cliente de indenizações indevidas por danos causados por terceiros.',
    conteudo: `Vistoria Cautelar de Vizinhança.
Objetivo: documentar o estado do imóvel (rachaduras, trincas, recalques pré-existentes) antes de obra vizinha ou demolição.
Quando fazer: antes do início de obras de fundação, escavação, demolição ou qualquer atividade que possa gerar vibração ou movimentação do solo.
Relatório: fotos datadas, descrição das patologias pré-existentes, croqui de localização. RT assina com ART/RRT.
Valor legal: se o vizinho alegar que a obra causou danos, a vistoria cautelar comprova o que já existia antes.
NBR 13752 (perícias) e NBR 14653 (avaliações) como referencias técnicas.`,
    tags: ['vistoria cautelar', 'vizinhança', 'laudo', 'perícia', 'dano obra', 'documentação'], vigente: true
  },

  // ── DIREITO DE CONSTRUIR ──────────────────────────────────────────────────
  {
    categoria: 'Legislação Urbana', titulo: 'Plano Diretor — O que é e Como Afeta o Projeto', numero: null,
    descricao: 'Lei municipal obrigatória para cidades >20mil hab. Define zonas de uso, coeficientes de aproveitamento, taxas de ocupação, gabaritos e recuos.',
    conteudo: `Plano Diretor Municipal.
Obrigatório: municípios >20.000 hab. (art. 182 CF + Estatuto da Cidade).
Define: zonas de uso (ZR1, ZR2, ZM, ZC, ZI etc.), coeficiente de aproveitamento (CA = área construída / área terreno), taxa de ocupação (TO = projeção / área terreno), gabarito (altura máxima).
Recuos: afastamento frontal, lateral e de fundos. Variam por zona e por município.
Taxa de permeabilidade: % mínimo do terreno sem impermeabilização. Permeabilidade e drenagem.
RT deve consultar a LUOS (Lei de Uso e Ocupação do Solo) e o PD municipal antes de qualquer projeto.`,
    tags: ['plano diretor', 'zona uso', 'coeficiente aproveitamento', 'taxa ocupação', 'gabarito', 'recuo'], vigente: true
  },
  {
    categoria: 'Legislação Urbana', titulo: 'Aprovação de Projetos na Prefeitura — Passo a Passo', numero: null,
    descricao: 'Processo de aprovação: projeto arquitetônico → análise urbanística → licença de construção → início da obra → Habite-se. RT coordena toda a documentação.',
    conteudo: `Aprovação de projetos na Prefeitura.
1. Consulta prévia: verificar parâmetros (CA, TO, gabarito, recuos) para a zona do terreno.
2. Projeto arquitetônico: elaborado por arquiteto (RRT) ou engenheiro civil (ART), conforme legislação local.
3. Protocolo: planta de situação, localização, implantação, planta baixa, cortes, fachadas, memorial descritivo, ART/RRT.
4. Análise urbanística: verifica conformidade com LUOS e Plano Diretor. Prazo: 30-90 dias (varia por município).
5. Licença de construção: emitida após aprovação.
6. Início da obra: RT de execução emite ART antes de iniciar.
7. Habite-se: solicitado após conclusão da obra.`,
    tags: ['aprovação projeto', 'licença construção', 'prefeitura', 'habite-se', 'LUOS', 'protocolo'], vigente: true
  },

  // ── PATOLOGIAS ────────────────────────────────────────────────────────────
  {
    categoria: 'Pratica Construtiva', titulo: 'Umidade — Tipos, Causas e Tratamento', numero: null,
    descricao: 'Umidade de infiltração (cobertura, fachada), ascensional (fundação), condensação (ar úmido em superfície fria), vazamento (instalações). Diagnóstico antes de tratar.',
    conteudo: `Patologias de umidade — diagnóstico e tratamento.
Ascensional (capilar): parece mancha em baixo das paredes térreo. Causa: ausência de impermeabilização na fundação. Tratamento: injeção de resina hidrofóbica ou membrana cristalizante na base.
Infiltração de cobertura: mancha no teto/laje, geralmente após chuva. Causa: manta furada, telha quebrada, rufo mal executado. Tratamento: identificar e reparar o ponto.
Infiltração de fachada: manchas na parede após chuva com vento. Causa: fissura, rejunte aberto, janela sem pingadeira. Tratamento: selagem com elastomérico + repintura.
Condensação: bolhas na pintura, mofo (especialmente em banheiro sem ventilação). Tratamento: ventilação, aquecimento, desumidicador.`,
    tags: ['umidade', 'infiltração', 'ascensional', 'condensação', 'mofo', 'impermeabilização'], vigente: true
  },
  {
    categoria: 'Pratica Construtiva', titulo: 'Corrosão de Armadura — Diagnóstico e Recuperação', numero: null,
    descricao: 'Corrosão do aço no concreto: manchas ferrosas, delaminação do cobrimento, fissuras horizontais. Causas: carbonatação, cloretos. NBR 6118 e NBR 6209.',
    conteudo: `Corrosão de armadura — patologia grave.
Mecanismo: carbonatação (CO2 reduz pH do concreto <9, aço perde passivação) ou cloretos (ambiente marinho, sais de degelo).
Diagnóstico: mapa de fissuração, fenolftaleína (indicador de carbonatação — rosa=alcalino, incolor=carbonatado), potencial de corrosão (Cu/CuSO4).
Consequências: expansão do óxido → delaminação do cobrimento → perda de seção transversal → colapso.
Recuperação (NBR 6209): remover concreto deteriorado, tratar armadura (desoxidante + passivador), corrigir com argamassa de reparo tixotrópica, impermeabilizar.
RT assina laudo de patologia e projeto de recuperação com ART.`,
    tags: ['corrosão armadura', 'carbonatação', 'cloreto', 'reparo estrutural', 'NBR 6209', 'patologia'], vigente: true
  },

  // ── TOPOGRAFIA ────────────────────────────────────────────────────────────
  {
    categoria: 'Topografia', titulo: 'Levantamento Planialtimétrico — O que é e Quando Exigir', numero: null,
    descricao: 'Mapa com curvas de nível (altimetria) e limites do terreno (planimetria). Exigido em projetos de drenagem, terraplanagem, georreferenciamento e usucapião extrajudicial.',
    conteudo: `Levantamento Planialtimétrico.
Planimetria: limites, confrontantes, área e servidões do terreno.
Altimetria: curvas de nível com equidistância 0,5-2m (conforme precisão exigida).
Instrumentos: estação total, GPS RTK, drone (levantamento aerofotogramétrico).
Precisão: NBR 13133 (levantamento topográfico). Georreferenciamento rural: padrão INCRA, GPS geodésico.
Quando exigir: projeto de drenagem, terraplanagem, loteamento, retificação de área, usucapião extrajudicial, REURB.
RT (engenheiro agrimensor, civil ou arquiteto conforme atribuição) assina com ART/RRT.`,
    tags: ['topografia', 'levantamento planialtimétrico', 'curva de nível', 'georreferenciamento', 'estação total'], vigente: true
  },

  // ── GESTÃO E FISCALIZAÇÃO ────────────────────────────────────────────────
  {
    categoria: 'Gestão de Obras', titulo: 'Diário de Obra — Importância e Como Preencher', numero: null,
    descricao: 'Documento diário que registra atividades, efetivo, condições climáticas, ocorrências e avanço físico. Prova contratual em caso de litígio.',
    conteudo: `Diário de Obra.
Conteúdo mínimo: data, condição climática, efetivo (mão de obra por função), serviços executados, materiais recebidos, equipamentos em uso, ocorrências (acidentes, paralisações, visitas técnicas).
Assinatura: RT de execução e representante do cliente/fiscalização.
Valor legal: prova documental em caso de disputa contratual, rescisão, atraso, acidente de trabalho.
Formato: caderno físico numerado e rubricado, ou sistema digital com timestamp (SINAPI, Sienge, apps de obra).
RT deve exigir e manter o diário atualizado diariamente.`,
    tags: ['diário de obra', 'fiscalização', 'registro', 'RT', 'gestão obra', 'contrato'], vigente: true
  },
  {
    categoria: 'Gestão de Obras', titulo: 'NR-18 — PCMAT — Planejamento do Canteiro de Obras', numero: 'NR-18',
    descricao: 'Programa de Condições e Meio Ambiente de Trabalho na Indústria da Construção. Obrigatório para obras com ≥20 trabalhadores. Elaborado por técnico ou engenheiro de segurança.',
    conteudo: `NR-18 — PCMAT — Planejamento do canteiro.
Layout do canteiro: vestiário, sanitários (1 vaso/20 trabalhadores/sexo), refeitório, cozinha, área de lazer (≥50 trabalhadores).
EPC (proteção coletiva): guarda-corpo em bordas ≥2m, rede de proteção, tela em fachada (4m x 4m).
Tapume: altura ≥2,20m, sinalização noturna se junto à via pública.
Andaime fachadeiro: projeto por RT com ART. Guarda-corpo ≥90cm, rodapé ≥15cm, travamento lateral.
Grua e elevador de carga: ART de projeto e instalação. Operador habilitado. Inspeção semestral.
Ordem de serviço de segurança obrigatória para cada trabalhador antes de iniciar.`,
    tags: ['PCMAT', 'NR-18', 'canteiro obras', 'guarda-corpo', 'andaime', 'segurança obra'], vigente: true
  },
];

