from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
AZUL=RGBColor(0x0E,0x41,0x94); CINZA=RGBColor(0x55,0x55,0x55)

T={
'pt':dict(arq='CV_Europass_Allan_Porto_PT.docx',
 titulo='Curriculum Vitae — Europass',
 contato=[('Morada','Caruaru / Recife — Pernambuco, Brasil (disponível para relocalização em Portugal)'),('Telemóvel','[preencher: +55 ...]'),('E-mail','[preencher]'),('Portefólio','Instagram @allanportopontes_arquitetura'),('Nacionalidade','Brasileira'),('Carta de condução','Sim (categoria a confirmar)')],
 cargo='Arquiteto e Urbanista — Arquitetura Comercial e Retail Design',
 perfil='Arquiteto e urbanista com 10 anos de profissão e experiência nos setores público e privado (construtoras, ateliês e agência de publicidade). Especialista em arquitetura comercial, integrando marketing, UX e UI Design para criar espaços estratégicos e funcionais, com experiência em gestão de projetos, gestão de obras comerciais e expansão de espaços.',
 sec_exp='EXPERIÊNCIA PROFISSIONAL', sec_edu='EDUCAÇÃO E FORMAÇÃO', sec_cur='CURSOS COMPLEMENTARES', sec_lang='COMPETÊNCIAS LINGUÍSTICAS', sec_dig='COMPETÊNCIAS DIGITAIS', sec_out='OUTRAS INFORMAÇÕES',
 exp=[('[datas a preencher]','Diretor de Expansão e Novos Negócios','Porto Office Coworking — Pernambuco, Brasil','Expansão e adaptação de espaços de trabalho, com foco em experiência do utilizador e rentabilidade; desenvolvimento de novos negócios.'),
      ('2017 – 2022','Arquiteto e Urbanista Sénior','Layout Arquitetura e Urbanismo — Pernambuco, Brasil','Projetos de arquitetura e interiores residenciais e comerciais, desde o levantamento de necessidades do cliente até ao acompanhamento de obra; apresentações e simulações visuais.'),
      ('2017','Gestor de Obras Comerciais','Athena Engenharia — Pernambuco, Brasil','Gestão e acompanhamento da execução de obras comerciais: empreiteiros, prazos, qualidade e compatibilização com o projeto.'),
      ('2010 – 2014','Gerente de Projetos Arquitetónicos','URB Caruaru — Caruaru, Pernambuco, Brasil','Coordenação de projetos arquitetónicos e urbanos no setor público: prazos, equipas, documentação técnica e articulação com entidades.')],
 edu=[('[ano a preencher]','Pós-graduação em Arquitetura Comercial — Master em Retail Design','IPOG — Brasil'),('2016','Licenciatura (Bacharelado) em Arquitetura e Urbanismo','UNIFAVIP DeVry — Caruaru, Brasil'),('—','Registo profissional: CAU-PE A166156-6 (Conselho de Arquitetura e Urbanismo do Brasil)','')],
 cursos=['Design Centrado no Utilizador — PUCRS (2025)','Processos de UX e UI Design — PUCRS (2025)','Foresight — Cidades Inteligentes — CESAR School (2022)','Georreferenciamento com Google Earth (2016)','Análise e Gerenciamento de Cidades — SEURB (2012)','Gestão de Projetos Arquitetónicos'],
 lang_mae='Língua materna: Português', lang_hdr=['Língua','Compreensão oral','Leitura','Interação oral','Produção oral','Escrita'], lang_row=['Inglês','B1','B1','B1','B1','B1'], lang_nota='Níveis: Quadro Europeu Comum de Referência (QECR). Autoavaliação.',
 dig='AutoCAD (avançado) · SketchUp (avançado) · Layout (SketchUp) · Photoshop · Revit (básico) · IA generativa para renderização e apresentações · Microsoft Office (a confirmar) · Claude Code / GitHub',
 out=['Disponibilidade para relocalização para Portugal com a família.','Pedido de reconhecimento do grau académico e inscrição na Ordem dos Arquitectos a iniciar (acordo CAU–OA).']),
'en':dict(arq='CV_Europass_Allan_Porto_EN.docx',
 titulo='Curriculum Vitae — Europass',
 contato=[('Address','Caruaru / Recife — Pernambuco, Brazil (available to relocate to Portugal)'),('Mobile','[fill in: +55 ...]'),('E-mail','[fill in]'),('Portfolio','Instagram @allanportopontes_arquitetura'),('Nationality','Brazilian'),('Driving licence','Yes (category to confirm)')],
 cargo='Architect and Urban Planner — Commercial Architecture & Retail Design',
 perfil='Architect and urban planner with 10 years of professional practice in the public and private sectors (construction companies, architecture studios and an advertising agency). Specialised in commercial architecture, combining marketing, UX and UI Design to create strategic and functional spaces, with experience in project management, commercial construction management and space expansion.',
 sec_exp='WORK EXPERIENCE', sec_edu='EDUCATION AND TRAINING', sec_cur='ADDITIONAL COURSES', sec_lang='LANGUAGE SKILLS', sec_dig='DIGITAL SKILLS', sec_out='ADDITIONAL INFORMATION',
 exp=[('[dates to fill in]','Director of Expansion and New Business','Porto Office Coworking — Pernambuco, Brazil','Expansion and adaptation of workspaces focused on user experience and return on investment; new business development.'),
      ('2017 – 2022','Senior Architect and Urban Planner','Layout Arquitetura e Urbanismo — Pernambuco, Brazil','Residential and commercial architecture and interior projects, from client brief to construction follow-up; presentations and visual simulations.'),
      ('2017','Commercial Works Manager','Athena Engenharia — Pernambuco, Brazil','Management and supervision of commercial construction works: contractors, schedules, quality and compliance with the design.'),
      ('2010 – 2014','Architectural Projects Manager','URB Caruaru — Caruaru, Pernambuco, Brazil','Coordination of architectural and urban projects in the public sector: schedules, teams, technical documentation and liaison with public bodies.')],
 edu=[('[year to fill in]','Postgraduate degree in Commercial Architecture — Master in Retail Design','IPOG — Brazil'),('2016','Bachelor’s degree in Architecture and Urban Planning','UNIFAVIP DeVry — Caruaru, Brazil'),('—','Professional registration: CAU-PE A166156-6 (Brazilian Council of Architecture and Urbanism)','')],
 cursos=['User-Centred Design — PUCRS (2025)','UX and UI Design Processes — PUCRS (2025)','Foresight — Smart Cities — CESAR School (2022)','Georeferencing with Google Earth (2016)','City Analysis and Management — SEURB (2012)','Architectural Project Management'],
 lang_mae='Mother tongue: Portuguese', lang_hdr=['Language','Listening','Reading','Spoken interaction','Spoken production','Writing'], lang_row=['English','B1','B1','B1','B1','B1'], lang_nota='Levels: Common European Framework of Reference (CEFR). Self-assessment.',
 dig='AutoCAD (advanced) · SketchUp (advanced) · Layout (SketchUp) · Photoshop · Revit (basic) · Generative AI for rendering and presentations · Microsoft Office (to confirm) · Claude Code / GitHub',
 out=['Available to relocate to Portugal with family.','Degree recognition and registration with the Ordem dos Arquitectos to be started (CAU–OA agreement).']),
}
def sem_bordas(t):
  tbl=t._tbl; pr=tbl.tblPr; b=OxmlElement('w:tblBorders')
  for e in ('top','left','bottom','right','insideH','insideV'):
    x=OxmlElement('w:'+e); x.set(qn('w:val'),'nil'); b.append(x)
  pr.append(b)
def run(p,txt,size=10,bold=False,cor=None,ital=False):
  r=p.add_run(txt); r.font.size=Pt(size); r.bold=bold; r.italic=ital; r.font.name='Arial'
  if cor: r.font.color.rgb=cor
  return r
def linha_sec(doc,txt):
  p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(12); p.paragraph_format.space_after=Pt(4)
  run(p,txt,11,True,AZUL)
  pPr=p._p.get_or_add_pPr(); bd=OxmlElement('w:pBdr'); bt=OxmlElement('w:bottom')
  for k,v in (('val','single'),('sz','6'),('space','1'),('color','0E4194')): bt.set(qn('w:'+k),v)
  bd.append(bt); pPr.append(bd)
def par(cell,txt,**kw):
  p=cell.paragraphs[0] if not cell.paragraphs[0].text and len(cell.paragraphs)==1 and not kw.get('novo') else cell.add_paragraph()
  kw.pop('novo',None); p.paragraph_format.space_after=Pt(2); run(p,txt,**kw); return p
for lg,d in T.items():
  doc=Document()
  for s in doc.sections: s.left_margin=s.right_margin=Cm(1.8); s.top_margin=s.bottom_margin=Cm(1.5)
  p=doc.add_paragraph(); run(p,'europass',16,True,AZUL); run(p,'   '+d['titulo'],10,False,CINZA)
  p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(8); run(p,'Allan Porto',20,True)
  p=doc.add_paragraph(); run(p,d['cargo'],11,False,AZUL)
  t=doc.add_table(rows=0,cols=2); sem_bordas(t)
  for k,v in d['contato']:
    c=t.add_row().cells; c[0].width=Cm(4); c[1].width=Cm(13.4)
    par(c[0],k,size=9,cor=CINZA); par(c[1],v,size=9.5)
  p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(8); run(p,d['perfil'],10)
  linha_sec(doc,d['sec_exp'])
  t=doc.add_table(rows=0,cols=2); sem_bordas(t)
  for dt,cg,emp,desc in d['exp']:
    c=t.add_row().cells; c[0].width=Cm(4); c[1].width=Cm(13.4)
    par(c[0],dt,size=9,cor=CINZA); par(c[1],cg,size=10.5,bold=True); par(c[1],emp,size=9.5,cor=AZUL,novo=True); par(c[1],desc,size=9.5,novo=True)
  linha_sec(doc,d['sec_edu'])
  t=doc.add_table(rows=0,cols=2); sem_bordas(t)
  for dt,tit,inst in d['edu']:
    c=t.add_row().cells; c[0].width=Cm(4); c[1].width=Cm(13.4)
    par(c[0],dt,size=9,cor=CINZA); par(c[1],tit,size=10,bold=True)
    if inst: par(c[1],inst,size=9.5,cor=AZUL,novo=True)
  linha_sec(doc,d['sec_cur'])
  for x in d['cursos']:
    p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.space_after=Pt(1); run(p,x,9.5)
  linha_sec(doc,d['sec_lang'])
  p=doc.add_paragraph(); run(p,d['lang_mae'],10,True)
  t=doc.add_table(rows=2,cols=6); t.style='Table Grid'
  for i,h in enumerate(d['lang_hdr']): par(t.rows[0].cells[i],h,size=8.5,bold=True,cor=AZUL)
  for i,v in enumerate(d['lang_row']): par(t.rows[1].cells[i],v,size=9.5)
  p=doc.add_paragraph(); run(p,d['lang_nota'],8,False,CINZA,True)
  linha_sec(doc,d['sec_dig'])
  p=doc.add_paragraph(); run(p,d['dig'],9.5)
  linha_sec(doc,d['sec_out'])
  for x in d['out']:
    p=doc.add_paragraph(style='List Bullet'); run(p,x,9.5)
  doc.save(d['arq']); print('ok',d['arq'])
