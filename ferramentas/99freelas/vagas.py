#!/usr/bin/env python3
"""Busca vagas de arquitetura na Gupy e no LinkedIn (sem login) e lista as novas no perfil do Allan."""
import html, json, os, re, subprocess, sys, urllib.parse

DIR = os.path.dirname(os.path.abspath(__file__))
VISTOS = os.path.join(DIR, 'dados', 'vagas_vistas.json')

TERMOS = ('arquiteto urbanista', 'arquiteta', 'arquitetura', 'arquiteto de interiores',
          'designer de interiores', 'visual merchandising', 'projetista arquitetura',
          'render 3d', 'arquiteto')
# Descarta TI e o que o Allan não faz
NAO = ('software', 'soluç', 'solucoes', 'soluções', 'dados', 'data ', 'cloud', 'sistemas', 'devops',
       'java', 'salesforce', 'sap', 'ti ', 'tecnologia', 'segurança da informação', 'infraestrutura de ti',
       'enterprise', 'integração', 'integracao', 'rede', 'network', 'microsoft', 'aws', 'azure',
       'detalhamento', 'executivo', 'estágio', 'estagio', 'estagiári', 'trainee', 'jovem aprendiz',
       'aprendiz', 'machine learning', ' ia ', 'genai',
       'mainframe', 'oracle', 'protheus', 'totvs', 'backend', 'frontend', 'cyber', 'cibern', 'automação',
       'corporativo', 'aplicaç', 'tosca', 'engineer', 'especialista de arquitetura ii', 'arquiteto(a) de ia',
       'assistente de vendas', 'assistente de visual', 'assistente visual', 'líder de visual', 'lider de visual',
       'assessor de visual', 'vendedor', 'promob', 'móveis', 'moveis', 'orçamentista', 'professor', 'elétric', 'telecom', 'conectividade')
SIM = ('arquitet', 'interiores', 'urbanis', 'visual merchandising', 'render', 'projetista',
       'retail design', 'layout de loja', 'expansão de lojas', 'obras', 'paisag')


def get(url):
    r = subprocess.run(['curl', '-sS', '-m', '30', '-A', 'Mozilla/5.0', url], capture_output=True, text=True)
    return r.stdout


def relevante(titulo):
    t = ' ' + titulo.lower() + ' '
    return any(s in t for s in SIM) and not any(n in t for n in NAO)


def gupy():
    vagas = {}
    for termo in TERMOS:
        h = get('https://portal.gupy.io/job-search/term=' + urllib.parse.quote(termo))
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', h, re.S)
        if not m:
            continue
        for j in json.loads(m.group(1))['props']['pageProps'].get('initialJobList', {}).get('data', []):
            local = 'Remoto' if j.get('workplaceType') == 'remote' else f"{j.get('city') or ''}/{j.get('state') or ''} ({j.get('workplaceType')})"
            vagas['gupy-%s' % j['id']] = dict(fonte='Gupy', titulo=j['name'], empresa=j.get('careerPageName', ''),
                                             local=local, data=(j.get('publishedDate') or '')[:10],
                                             link=j['jobUrl'].split('?')[0])
    return vagas


def linkedin():
    vagas = {}
    for termo in TERMOS:
        for start in (0, 25):
            q = urllib.parse.urlencode({'keywords': termo, 'geoId': '106057199', 'f_TPR': 'r604800', 'start': start})
            h = get('https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?' + q)
            for card in h.split('<li>')[1:]:
                urn = re.search(r'jobPosting:(\d+)', card)
                tit = re.search(r'base-search-card__title">\s*(.*?)\s*</h3>', card, re.S)
                if not urn or not tit:
                    continue
                emp = re.search(r'base-search-card__subtitle">\s*(?:<a[^>]*>)?\s*([^<]*?)\s*<', card, re.S)
                loc = re.search(r'job-search-card__location">\s*(.*?)\s*</span>', card, re.S)
                dt = re.search(r'datetime="([\d-]+)"', card)
                vagas['li-' + urn.group(1)] = dict(fonte='LinkedIn', titulo=html.unescape(tit.group(1)),
                                                   empresa=html.unescape(emp.group(1)) if emp else '',
                                                   local=html.unescape(loc.group(1)) if loc else '',
                                                   data=dt.group(1) if dt else '',
                                                   link='https://www.linkedin.com/jobs/view/' + urn.group(1))
    return vagas


def main():
    todas = {**gupy(), **linkedin()}
    vistos = set(json.load(open(VISTOS))) if os.path.exists(VISTOS) else set()
    novas = {k: v for k, v in todas.items() if k not in vistos}
    perfil = [v for v in novas.values() if relevante(v['titulo'])]
    print(f"{len(todas)} vagas lidas | {len(novas)} novas | {len(perfil)} no perfil")
    for v in sorted(perfil, key=lambda v: v['data'], reverse=True):
        print(f"- [{v['fonte']}] {v['titulo']} — {v['empresa']} — {v['local']} — {v['data']}\n  {v['link']}")
    if '--nao-salvar' not in sys.argv:
        os.makedirs(os.path.dirname(VISTOS), exist_ok=True)
        json.dump(sorted(vistos | set(todas)), open(VISTOS, 'w'))


if __name__ == '__main__':
    main()
