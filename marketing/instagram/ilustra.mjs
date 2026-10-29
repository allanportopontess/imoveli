// Ilustrações vetoriais (SVG) no estilo "flat" das referências de 30/10 (céu, cidade ao fundo, cotas em pílula
// vermelha/verde). Cada função devolve um <svg> 1000x560 que preenche o card (preserveAspectRatio slice).
const K = '#2A1205', RED = '#E5392B', GRN = '#2E9E45', SKIN = '#F2C29B', HAIR = '#5B3A1E';
const M = 180; // px por metro (cenas internas, eixo vertical)
const FL = 500; // linha do piso

const svg = (inner, bg = '#DDEFF8') => `<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
<rect width="1000" height="560" fill="${bg}"/>${inner}</svg>`;

const T = (x, y, t, s = 30, c = K, a = 'middle', w = 800) =>
  `<text x="${x}" y="${y}" font-family="Inter" font-weight="${w}" font-size="${s}" text-anchor="${a}" fill="${c}">${t}</text>`;

// Cidade ao fundo + vegetação (cenas externas)
const cidade = () => `<g opacity=".9">
${[[40, 250, 70, 120, '#BFD9EE'], [120, 220, 60, 150, '#F6C9A6'], [190, 260, 90, 110, '#CFE3F3'], [700, 230, 80, 140, '#BFD9EE'], [790, 200, 60, 170, '#F6C9A6'], [860, 250, 100, 120, '#CFE3F3']]
    .map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>` +
      [0, 1, 2].map(i => `<rect x="${x + 12}" y="${y + 18 + i * 34}" width="${w - 24}" height="14" fill="#fff" opacity=".7"/>`).join('')).join('')}
</g>${[60, 170, 300, 690, 820, 950].map((x, i) => `<circle cx="${x}" cy="${360 - (i % 2) * 14}" r="${58 + (i % 3) * 10}" fill="${i % 2 ? '#4CAF50' : '#3E9E44'}"/>`).join('')}`;

const palmeira = (x, y) => `<path d="M${x} ${y} q8 -90 0 -170" stroke="#8B5A2B" stroke-width="12" fill="none"/>
${[-60, -20, 20, 60].map(a => `<path d="M${x} ${y - 170} q${a} -30 ${a * 1.6} 10" stroke="#3E9E44" stroke-width="16" fill="none" stroke-linecap="round"/>`).join('')}`;

// Pessoa simples. pose: 'em_pe' | 'curvado'. dir: 1 olha para a direita
const pessoa = (x, piso = FL, pose = 'em_pe', esc = 1, camisa = '#E74C3C') => {
  const H = 306 * esc, hip = piso - 135 * esc, sh = piso - H + 62 * esc;
  const tronco = `<rect x="${x - 30 * esc}" y="${sh}" width="${60 * esc}" height="${hip - sh}" rx="${16 * esc}" fill="${camisa}" stroke="${K}" stroke-width="4"/>
<circle cx="${x}" cy="${piso - H + 30 * esc}" r="${28 * esc}" fill="${SKIN}" stroke="${K}" stroke-width="4"/>
<path d="M${x - 28 * esc} ${piso - H + 26 * esc} q${28 * esc} -${44 * esc} ${56 * esc} 0 q-${10 * esc} -${16 * esc} -${28 * esc} -${14 * esc} q-${18 * esc} -${2 * esc} -${28 * esc} ${14 * esc}z" fill="${HAIR}"/>
<rect x="${x + 14 * esc}" y="${sh + 10 * esc}" width="${70 * esc}" height="${18 * esc}" rx="${9 * esc}" fill="${SKIN}" stroke="${K}" stroke-width="4"/>`;
  const pernas = `<rect x="${x - 26 * esc}" y="${hip - 4}" width="${24 * esc}" height="${piso - hip - 10}" rx="8" fill="#2F5DA8" stroke="${K}" stroke-width="4"/>
<rect x="${x + 2 * esc}" y="${hip - 4}" width="${24 * esc}" height="${piso - hip - 10}" rx="8" fill="#2F5DA8" stroke="${K}" stroke-width="4"/>
<rect x="${x - 30 * esc}" y="${piso - 16}" width="${32 * esc}" height="16" rx="7" fill="#1E3A6E"/><rect x="${x + 2 * esc}" y="${piso - 16}" width="${36 * esc}" height="16" rx="7" fill="#1E3A6E"/>`;
  return pernas + (pose === 'curvado' ? `<g transform="rotate(32 ${x} ${hip})">${tronco}</g>` : tronco);
};

// Cota vertical com pílula (estilo das referências)
const cotaV = (x, y1, y2, txt, cor) => `<path d="M${x} ${y1 + 14} V${y2 - 14}" stroke="${cor}" stroke-width="6" stroke-dasharray="14 10"/>
<path d="M${x - 14} ${y1 + 18} L${x} ${y1} L${x + 14} ${y1 + 18}Z M${x - 14} ${y2 - 18} L${x} ${y2} L${x + 14} ${y2 - 18}Z" fill="${cor}"/>
<rect x="${x - 82}" y="${(y1 + y2) / 2 - 30}" width="164" height="60" rx="14" fill="${cor}" stroke="#fff" stroke-width="4"/>${T(x, (y1 + y2) / 2 + 12, txt, 34, '#fff')}`;
const cotaH = (x1, x2, y, txt, cor) => `<path d="M${x1 + 14} ${y} H${x2 - 14}" stroke="${cor}" stroke-width="6" stroke-dasharray="14 10"/>
<path d="M${x1 + 18} ${y - 14} L${x1} ${y} L${x1 + 18} ${y + 14}Z M${x2 - 18} ${y - 14} L${x2} ${y} L${x2 - 18} ${y + 14}Z" fill="${cor}"/>
<rect x="${(x1 + x2) / 2 - 82}" y="${y - 30}" width="164" height="60" rx="14" fill="${cor}" stroke="#fff" stroke-width="4"/>${T((x1 + x2) / 2, y + 12, txt, 34, '#fff')}`;

const interior = (parede = '#F3E6CF') => `<rect width="1000" height="${FL}" fill="${parede}"/>
<rect y="${FL}" width="1000" height="${560 - FL}" fill="#D8B48F"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${i * 200} ${FL} L${i * 200 - 60} 560" stroke="#C49A72" stroke-width="3"/>`).join('')}
<rect y="${FL - 14}" width="1000" height="14" fill="#C9B79C"/>`;

const selo = (ok, x = 930, y = 70) => ok
  ? `<circle cx="${x}" cy="${y}" r="42" fill="${GRN}" stroke="#fff" stroke-width="6"/><path d="M${x - 18} ${y} l12 14 l24 -28" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
  : `<circle cx="${x}" cy="${y}" r="42" fill="${RED}" stroke="#fff" stroke-width="6"/><path d="M${x - 16} ${y - 16} l32 32 M${x + 16} ${y - 16} l-32 32" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`;

export const ILU = {
  // Bancada de cozinha: baixa (0,75) x confortável (0,90)
  bancada: (ok) => {
    const h = ok ? 0.9 : 0.75, top = FL - h * M;
    return svg(interior() + `<rect x="430" y="90" width="460" height="120" rx="8" fill="#fff" stroke="${K}" stroke-width="5"/><path d="M660 90 V210" stroke="${K}" stroke-width="4"/>
<rect x="430" y="${top}" width="460" height="${FL - top}" fill="#fff" stroke="${K}" stroke-width="5"/>
<rect x="420" y="${top - 18}" width="480" height="22" rx="4" fill="#8E9AA6" stroke="${K}" stroke-width="4"/>
<rect x="520" y="${top - 30}" width="120" height="14" rx="4" fill="#D9A066" stroke="${K}" stroke-width="3"/>
<path d="M560 ${top + 40} V${FL - 20} M760 ${top + 40} V${FL - 20}" stroke="${K}" stroke-width="3"/>` +
      pessoa(ok ? 340 : 330, FL, ok ? 'em_pe' : 'curvado') + cotaV(880, top, FL, ok ? '0,90 m' : '0,75 m', ok ? GRN : RED) + selo(ok, 80, 130));
  },
  // Espaço atrás da mesa para recuar a cadeira
  mesa: (ok) => {
    const gap = ok ? 0.9 : 0.5, borda = 470, parede = borda + gap * 380;
    return svg(interior() + `<rect x="${parede}" y="0" width="${1000 - parede}" height="${FL}" fill="#E2CFAE" stroke="${K}" stroke-width="5"/>
<rect x="110" y="${FL - 0.75 * M}" width="${borda - 110}" height="20" rx="6" fill="#B7793F" stroke="${K}" stroke-width="5"/>
<rect x="140" y="${FL - 0.75 * M + 20}" width="18" height="${0.75 * M - 20}" fill="#8B5A2B"/><rect x="${borda - 50}" y="${FL - 0.75 * M + 20}" width="18" height="${0.75 * M - 20}" fill="#8B5A2B"/>
<g transform="translate(${ok ? borda + 60 : parede - 120} 0)"><rect x="0" y="${FL - 0.45 * M}" width="90" height="16" fill="#B7793F" stroke="${K}" stroke-width="4"/>
<rect x="74" y="${FL - 1.0 * M}" width="16" height="${0.55 * M}" fill="#B7793F" stroke="${K}" stroke-width="4"/><rect x="0" y="${FL - 0.45 * M + 16}" width="12" height="${0.45 * M - 16}" fill="#8B5A2B"/><rect x="76" y="${FL - 0.45 * M + 16}" width="12" height="${0.45 * M - 16}" fill="#8B5A2B"/></g>
<circle cx="300" cy="${FL - 0.75 * M - 26}" r="24" fill="#fff" stroke="${K}" stroke-width="4"/>` +
      cotaH(borda, parede, 150, ok ? '0,90 m' : '0,50 m', ok ? GRN : RED) + selo(ok, 80, 130));
  },
  // Passagem ao lado da cama
  cama: (ok) => {
    const gap = ok ? 0.6 : 0.3, borda = 560, arm = borda + gap * 380;
    return svg(interior('#EADFF0') + `<rect x="${arm}" y="60" width="${1000 - arm}" height="${FL - 60}" fill="#C9A27E" stroke="${K}" stroke-width="5"/><path d="M${arm + 60} 260 v60" stroke="${K}" stroke-width="6" stroke-linecap="round"/>
<rect x="60" y="${FL - 0.55 * M}" width="${borda - 60}" height="${0.55 * M - 20}" rx="14" fill="#fff" stroke="${K}" stroke-width="5"/>
<rect x="60" y="${FL - 0.55 * M - 34}" width="${borda - 60}" height="40" rx="18" fill="#7FA7D9" stroke="${K}" stroke-width="5"/>
<rect x="80" y="${FL - 0.55 * M - 70}" width="120" height="44" rx="18" fill="#fff" stroke="${K}" stroke-width="4"/>
<rect x="40" y="${FL - 1.1 * M}" width="30" height="${1.1 * M}" fill="#8B5A2B" stroke="${K}" stroke-width="4"/>` +
      pessoa((borda + arm) / 2 + (ok ? 0 : 6), FL, 'em_pe', ok ? 1 : 0.95, '#8E44AD') + cotaH(borda, arm, 90, ok ? '0,60 m' : '0,30 m', ok ? GRN : RED) + selo(ok, 940, 420));
  },
  // Tomada: escondida atrás do sofá x bem posicionada
  tomada: (ok) => svg(interior('#E6EEF2') + `<rect x="${ok ? 120 : 260}" y="${FL - 0.85 * M}" width="420" height="${0.85 * M - 10}" rx="26" fill="#3D6B8C" stroke="${K}" stroke-width="5"/>
<rect x="${ok ? 140 : 280}" y="${FL - 0.45 * M}" width="380" height="${0.45 * M - 10}" rx="14" fill="#4E82A8" stroke="${K}" stroke-width="5"/>
<rect x="${ok ? 650 : 400}" y="${FL - 0.3 * M - 22}" width="44" height="44" rx="8" fill="#fff" stroke="${K}" stroke-width="5" ${ok ? '' : 'opacity=".55"'}/>
${ok ? `<path d="M672 ${FL - 0.3 * M} C 720 ${FL - 120}, 760 ${FL - 120}, 800 ${FL - 230}" stroke="${K}" stroke-width="5" fill="none"/>
<rect x="770" y="${FL - 300}" width="70" height="80" rx="10" fill="#F7C51E" stroke="${K}" stroke-width="5"/><rect x="800" y="${FL - 220}" width="10" height="${220 - 14}" fill="${K}"/>` +
      cotaV(900, FL - 0.3 * M, FL, '0,30 m', GRN) : `<path d="M422 ${FL - 0.3 * M} L300 180" stroke="${RED}" stroke-width="6" stroke-dasharray="12 8"/><rect x="150" y="140" width="300" height="64" rx="14" fill="${RED}" stroke="#fff" stroke-width="4"/>${T(300, 184, 'tomada escondida', 32, '#fff')}`}` + selo(ok, ok ? 80 : 900, 130)),
  // Fachada externa com dúvida "ESCRITURA?"
  casa: () => svg(cidade() + palmeira(110, 500) + palmeira(900, 500) + `<rect y="470" width="1000" height="90" fill="#9CCB6A"/><rect y="500" width="1000" height="60" fill="#CFC3B0"/>
<polygon points="300,270 500,165 700,270" fill="#E5392B" stroke="${K}" stroke-width="6"/><rect x="330" y="270" width="340" height="230" fill="#FFF6E5" stroke="${K}" stroke-width="6"/>
<rect x="465" y="380" width="70" height="120" fill="#2F6BFF" stroke="${K}" stroke-width="5"/><rect x="360" y="320" width="70" height="60" fill="#CFE6FF" stroke="${K}" stroke-width="5"/><rect x="570" y="320" width="70" height="60" fill="#CFE6FF" stroke="${K}" stroke-width="5"/>
<rect x="360" y="58" width="280" height="76" rx="20" fill="#fff" stroke="${K}" stroke-width="6"/>${T(500, 110, 'ESCRITURA?', 40, RED, 'middle', 800)}<path d="M480 134 l20 22 l20 -22" fill="#fff" stroke="${K}" stroke-width="6" stroke-linejoin="round"/>`),
  // Linha do tempo: 5 anos de posse
  tempo: () => svg(cidade() + `<rect y="470" width="1000" height="90" fill="#9CCB6A"/>
<rect x="110" y="150" width="780" height="260" rx="24" fill="#fff" stroke="${K}" stroke-width="6"/><rect x="110" y="150" width="780" height="60" rx="24" fill="${RED}" stroke="${K}" stroke-width="6"/>${T(500, 192, 'POSSE CONTÍNUA', 34, '#fff')}
<path d="M170 320 H830" stroke="${K}" stroke-width="10"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${170 + i * 132}" cy="320" r="30" fill="${i === 5 ? GRN : '#2F6BFF'}" stroke="${K}" stroke-width="5"/>${T(170 + i * 132, 332, i, 32, '#fff')}`).join('')}
${T(170, 265, 'início', 26)}${T(830, 265, '5 ANOS', 30, GRN)}${T(500, 390, 'sem oposição · como se fosse seu', 28, '#555', 'middle', 600)}`),
  // Cartório
  cartorio: () => svg(cidade() + `<rect y="470" width="1000" height="90" fill="#CFC3B0"/>
<polygon points="250,190 500,80 750,190" fill="#F3EBD8" stroke="${K}" stroke-width="6"/><rect x="270" y="190" width="460" height="40" fill="#F3EBD8" stroke="${K}" stroke-width="6"/>${T(500, 222, 'CARTÓRIO', 32, K)}
${[300, 390, 480, 570, 660].map(x => `<rect x="${x}" y="230" width="40" height="230" fill="#fff" stroke="${K}" stroke-width="5"/>`).join('')}<rect x="250" y="460" width="500" height="30" fill="#E8DCC2" stroke="${K}" stroke-width="5"/>
<g transform="rotate(-10 840 380)"><rect x="770" y="330" width="150" height="100" rx="10" fill="#fff" stroke="${K}" stroke-width="5"/><circle cx="845" cy="380" r="32" fill="none" stroke="${GRN}" stroke-width="7"/>${T(845, 390, 'OK', 26, GRN)}</g>`),
  // Planta técnica (levantamento) certa/errada
  planta: (ok) => svg(`<rect width="1000" height="560" fill="#E9DCC2"/>${[...Array(12)].map((_, i) => `<path d="M0 ${i * 50} H1000" stroke="#DCCDB0" stroke-width="2"/>`).join('')}
<g transform="rotate(-3 500 280)"><rect x="170" y="70" width="660" height="420" rx="10" fill="#1F4E8C" stroke="${K}" stroke-width="6"/>
<path d="M230 130 H770 V430 H230Z M230 280 H480 V430 M480 130 V280 H770 M620 280 V430" stroke="#fff" stroke-width="7" fill="none"/>
${T(355, 215, ok ? '3,20 m' : '3,?? m', 30, ok ? '#fff' : '#FFB3AA')}${T(625, 215, ok ? '4,15 m' : '4,50 m', 30, ok ? '#fff' : '#FFB3AA')}${T(355, 365, ok ? '2,40 m' : '2,0? m', 30, ok ? '#fff' : '#FFB3AA')}
${ok ? '' : `<path d="M560 330 l60 60 M620 330 l-60 60" stroke="${RED}" stroke-width="12" stroke-linecap="round"/>`}</g>` + selo(ok, 900, 130)),
  // Pasta organizada x papéis soltos
  docs: (ok) => svg(`<rect width="1000" height="560" fill="#E9DCC2"/>` + (ok
    ? `<rect x="250" y="120" width="500" height="360" rx="24" fill="#F7C51E" stroke="${K}" stroke-width="6"/><rect x="250" y="90" width="200" height="60" rx="16" fill="#F7C51E" stroke="${K}" stroke-width="6"/>
${['IPTU', 'LUZ', 'ÁGUA', 'RECIBOS', 'FOTOS'].map((l, i) => `<rect x="${290 + i * 88}" y="${60 + (i % 2) * 14}" width="80" height="120" rx="8" fill="#fff" stroke="${K}" stroke-width="4"/>${T(330 + i * 88, 100 + (i % 2) * 14, l, l.length > 5 ? 14 : 18, K)}`).join('')}
<rect x="250" y="180" width="500" height="300" rx="24" fill="#E9B10F" stroke="${K}" stroke-width="6"/>${T(500, 350, 'POR ANO, EM ORDEM', 36, K)}`
    : ['IPTU', 'conta de luz', 'recibo', '???', 'água', 'foto'].map((l, i) => `<g transform="rotate(${[-14, 9, -6, 16, -11, 5][i]} ${180 + (i % 3) * 300} ${170 + Math.floor(i / 3) * 210})"><rect x="${80 + (i % 3) * 300}" y="${110 + Math.floor(i / 3) * 210}" width="200" height="130" rx="10" fill="#fff" stroke="${K}" stroke-width="5"/>${T(180 + (i % 3) * 300, 185 + Math.floor(i / 3) * 210, l, 28, i === 3 ? RED : K)}</g>`).join('')) + selo(ok, 900, 130)),
  // Vizinhos (prova de posse)
  vizinhos: () => svg(cidade() + `<rect y="470" width="1000" height="90" fill="#9CCB6A"/>
${[[90, '#E5392B'], [600, '#2F6BFF']].map(([x, c]) => `<polygon points="${x},250 ${x + 155},160 ${x + 310},250" fill="${c}" stroke="${K}" stroke-width="6"/><rect x="${x + 20}" y="250" width="270" height="220" fill="#FFF6E5" stroke="${K}" stroke-width="6"/><rect x="${x + 120}" y="360" width="64" height="110" fill="#8B5A2B" stroke="${K}" stroke-width="5"/>`).join('')}` +
    pessoa(470, 500, 'em_pe', 0.75, '#E74C3C') + pessoa(540, 500, 'em_pe', 0.75, '#2E9E45') + `<rect x="380" y="90" width="250" height="70" rx="18" fill="#fff" stroke="${K}" stroke-width="5"/>${T(505, 136, 'mora aqui há anos!', 26, K)}`),
  // Contas e IPTU de vários anos
  contas: () => svg(`<rect width="1000" height="560" fill="#E9DCC2"/>` + ['2019', '2020', '2021', '2022', '2023', '2024'].map((a, i) =>
    `<g transform="rotate(${-8 + i * 3} 500 300)"><rect x="${170 + i * 70}" y="${110 + i * 22}" width="300" height="210" rx="12" fill="#fff" stroke="${K}" stroke-width="5"/>
<rect x="${170 + i * 70}" y="${110 + i * 22}" width="300" height="46" rx="12" fill="${['#2F6BFF', '#F7C51E', '#2E9E45'][i % 3]}" stroke="${K}" stroke-width="5"/>${T(320 + i * 70, 145 + i * 22, ['IPTU', 'LUZ', 'ÁGUA'][i % 3] + ' ' + a, 26, i % 3 === 1 ? K : '#fff')}
<path d="M${200 + i * 70} ${200 + i * 22} h220 M${200 + i * 70} ${235 + i * 22} h180 M${200 + i * 70} ${270 + i * 22} h200" stroke="#C9C9C9" stroke-width="10" stroke-linecap="round"/></g>`).join('')),
  // Vitrine de rua: lotada x 1 produto-foco
  vitrine: (ok) => svg(`<rect width="1000" height="560" fill="#2B2B2B"/><rect y="470" width="1000" height="90" fill="#9C9488"/>
<rect x="120" y="60" width="760" height="410" fill="#1B1B1B" stroke="#111" stroke-width="8"/><rect x="140" y="80" width="720" height="370" fill="${ok ? '#F4EDE1' : '#D9D2C6'}"/>
${ok ? `<path d="M500 80 L380 400 H620Z" fill="#FFD27A" opacity=".55"/><rect x="420" y="250" width="160" height="150" rx="14" fill="#FF8A00" stroke="#111" stroke-width="6"/><rect x="400" y="400" width="200" height="30" fill="#B7A58A" stroke="#111" stroke-width="5"/>`
      : [...Array(26)].map((_, i) => `<rect x="${160 + (i * 97) % 660}" y="${110 + Math.floor(i / 7) * 82 + (i % 2) * 10}" width="${60 + (i % 4) * 12}" height="${50 + (i % 3) * 12}" rx="6" fill="${['#E5392B', '#2F6BFF', '#F7C51E', '#2E9E45', '#8E44AD'][i % 5]}" stroke="#111" stroke-width="4"/>`).join('') +
      `<rect x="600" y="300" width="200" height="90" fill="#fff" stroke="#111" stroke-width="4" transform="rotate(-6 700 345)"/>${T(700, 352, 'PROMO 50%', 30, RED)}`}
<rect x="100" y="40" width="800" height="40" fill="#111"/>`, '#2B2B2B'),
};
