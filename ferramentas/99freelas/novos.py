#!/usr/bin/env python3
"""Lista projetos novos do 99freelas (Engenharia & Arquitetura) desde a última execução.

Uso: python3 novos.py [paginas]
Estado em dados/vistos.json (não versionado). Sem estado, usa a execução atual como base
e mostra apenas o que ainda não está em propostas.json e é das subcategorias de interesse.
"""
import html, json, os, re, subprocess, sys

BASE = 'https://www.99freelas.com.br'
AQUI = os.path.dirname(os.path.abspath(__file__))
VISTOS = os.path.join(AQUI, 'dados', 'vistos.json')
SUBCATS = ('Arquitetura', 'Design de Interiores')
EXCLUIR = ('detalhamento', 'executivo', 'promob', 'cortecloud', 'marcenaria', 'móveis planejados', 'regulariza')


def get(url):
    return subprocess.run(['curl', '-sSL', '-A', 'Mozilla/5.0', url], capture_output=True, text=True).stdout


def texto(fragmento):
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', fragmento))).strip()


def listar(paginas):
    cards = []
    for pg in range(1, paginas + 1):
        partes = re.split(r'<li class="[^"]*result-item', get(f'{BASE}/projects?categoria=engenharia-e-arquitetura&page={pg}'))[1:]
        if not partes:
            break
        for it in partes:
            a = re.search(r'<a href="(/project/[^"?]+)[^"]*">(.*?)</a>', it, re.S)
            info = re.search(r'class="item-text information">(.*?)</p>', it, re.S)
            if a:
                cards.append({'titulo': texto(a.group(2)), 'link': BASE + a.group(1),
                              'subcategoria': texto(info.group(1)).split('|')[0].strip() if info else ''})
    return cards


def detalhar(card):
    t = get(card['link'])
    plano = texto(re.sub(r'<(script|style).*?</\1>', '', t, flags=re.S))
    campo = lambda k, fim: (re.search(k + r':\s*(.*?)\s*' + fim, plano) or [None, '?'])[1]
    d = re.search(r'class="(?:item-text )?project-description[^"]*"[^>]*>(.*?)</div>', t, re.S)
    card.update(orcamento=campo('Orçamento', 'Nível'), propostas=campo('Propostas', 'Interessados'),
                descricao=texto(d.group(1)).split('">')[-1] if d else '')
    return card


def main():
    paginas = int(sys.argv[1]) if len(sys.argv) > 1 else 8
    cards = listar(paginas)
    if not cards:
        print('ERRO: listagem vazia (site fora do ar ou layout mudou).')
        sys.exit(1)
    try:
        vistos = set(json.load(open(VISTOS)))
    except (OSError, ValueError):
        vistos = None
    enviados = {p['link'] for p in json.load(open(os.path.join(AQUI, 'propostas.json')))}
    novos = [c for c in cards if (vistos is None or c['link'] not in vistos) and c['link'] not in enviados]
    if vistos is None:
        print('(primeira execução nesta máquina: base criada)')
    os.makedirs(os.path.dirname(VISTOS), exist_ok=True)
    json.dump(sorted((vistos or set()) | {c['link'] for c in cards}), open(VISTOS, 'w'))

    relevantes = [detalhar(c) for c in novos if c['subcategoria'] in SUBCATS
                  and not any(x in c['titulo'].lower() for x in EXCLUIR)]
    relevantes = [c for c in relevantes if not any(x in c['descricao'].lower() for x in EXCLUIR)]
    print(f'{len(cards)} projetos lidos | {len(novos)} novos | {len(relevantes)} no perfil')
    for c in relevantes:
        print(f"\n### {c['titulo']}\n{c['subcategoria']} | Orçamento: {c['orcamento']} | Propostas: {c['propostas']}\n{c['link']}\n{c['descricao'][:800]}")


if __name__ == '__main__':
    main()
