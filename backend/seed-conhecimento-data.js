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
];
