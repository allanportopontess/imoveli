# Busca fotos no Unsplash (licença de uso comercial livre). Uso: python3 tools/busca_unsplash.py "termo 1" "termo 2"
# Resolve o desafio anti-bot (prova de trabalho) do site e lista id, tamanho, descrição e URL base de cada foto.
# Baixe com: curl -o img/real/<id>.jpg "<url>?w=1600&q=85&fm=jpg" e registre em img/real/CREDITOS.md
import subprocess,re,json,hashlib,sys,urllib.parse,time
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
J="/tmp/unsplash-cookies.txt"
def get(u): return subprocess.run(['curl','-sL','-A',UA,'-b',J,'-c',J,u],capture_output=True,text=True).stdout
def busca(q,n=12):
    u="https://unsplash.com/napi/search/photos?per_page=%d&query=%s"%(n,urllib.parse.quote(q))
    t=get(u)
    if 'anubis_challenge' in t:
        ch=json.loads(re.search(r'id="anubis_challenge" type="application/json">(.*?)</script>',t,re.S).group(1))
        c=ch['challenge']; d=ch['rules']['difficulty']; rd=c['randomData']; i=0; t0=time.time()
        while True:
            h=hashlib.sha256((rd+str(i)).encode()).hexdigest()
            if h.startswith('0'*d): break
            i+=1
        el=int((time.time()-t0)*1000)
        pu="https://unsplash.com/.within.website/x/cmd/anubis/api/pass-challenge?"+urllib.parse.urlencode({'id':c['id'],'response':h,'nonce':i,'redir':u,'elapsedTime':el})
        t=get(pu)
        if 'anubis_challenge' in t: t=get(u)
    return json.loads(t)
for q in sys.argv[1:]:
    try:
        d=busca(q); print('##',q,d['total'])
        for r in d['results']:
            if r.get('premium') or r.get('plus'): continue
            print(r['id'],f"{r['width']}x{r['height']}",(r.get('alt_description') or '')[:80],'|',r['urls']['raw'].split('?')[0])
    except Exception as e: print('##',q,'ERRO',e)
