import importlib.util,html,subprocess,os
spec=importlib.util.spec_from_file_location('g','gerar_cv.py')
src=open('gerar_cv.py').read().split('def sem_bordas')[0]
ns={}; exec(src,ns); T=ns['T']
e=html.escape
CSS="""body{font-family:Arial,Helvetica,sans-serif;color:#222;margin:0;font-size:10pt}
.pg{padding:14mm 16mm}.logo{color:#0E4194;font-weight:bold;font-size:16pt}.logo span{color:#666;font-weight:normal;font-size:9.5pt;margin-left:8px}
h1{font-size:20pt;margin:10px 0 2px}.cargo{color:#0E4194;font-size:11pt;margin-bottom:8px}
table.kv{border-collapse:collapse;width:100%}table.kv td{vertical-align:top;padding:2px 0}td.k{width:38mm;color:#666;font-size:9pt}
h2{color:#0E4194;font-size:11pt;border-bottom:1.5px solid #0E4194;padding-bottom:2px;margin:14px 0 6px}
.cg{font-weight:bold;font-size:10.5pt}.emp{color:#0E4194;font-size:9.5pt}.ds{font-size:9.5pt;margin-bottom:6px}
ul{margin:2px 0 0 18px;padding:0}li{font-size:9.5pt;margin-bottom:1px}
table.lg{border-collapse:collapse;margin-top:4px}table.lg td,table.lg th{border:1px solid #bbb;padding:3px 8px;font-size:9pt;text-align:center}table.lg th{color:#0E4194}
.nota{color:#666;font-size:8pt;font-style:italic}"""
for lg,d in T.items():
  h=[f'<html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="pg">',
     f'<div class="logo">europass<span>{e(d["titulo"])}</span></div><h1>Allan Porto</h1><div class="cargo">{e(d["cargo"])}</div><table class="kv">']
  h+= [f'<tr><td class="k">{e(k)}</td><td>{e(v)}</td></tr>' for k,v in d['contato']]
  h.append(f'</table><p>{e(d["perfil"])}</p><h2>{e(d["sec_exp"])}</h2><table class="kv">')
  h+= [f'<tr><td class="k">{e(dt)}</td><td><div class="cg">{e(cg)}</div><div class="emp">{e(emp)}</div><div class="ds">{e(ds)}</div></td></tr>' for dt,cg,emp,ds in d['exp']]
  h.append(f'</table><h2>{e(d["sec_edu"])}</h2><table class="kv">')
  h+= [f'<tr><td class="k">{e(dt)}</td><td><div class="cg">{e(t)}</div><div class="emp">{e(i)}</div></td></tr>' for dt,t,i in d['edu']]
  h.append(f'</table><h2>{e(d["sec_cur"])}</h2><ul>'+''.join(f'<li>{e(x)}</li>' for x in d['cursos'])+'</ul>')
  h.append(f'<h2>{e(d["sec_lang"])}</h2><b>{e(d["lang_mae"])}</b><table class="lg"><tr>'+''.join(f'<th>{e(x)}</th>' for x in d['lang_hdr'])+'</tr><tr>'+''.join(f'<td>{e(x)}</td>' for x in d['lang_row'])+f'</tr></table><div class="nota">{e(d["lang_nota"])}</div>')
  h.append(f'<h2>{e(d["sec_dig"])}</h2><p class="ds">{e(d["dig"])}</p><h2>{e(d["sec_out"])}</h2><ul>'+''.join(f'<li>{e(x)}</li>' for x in d['out'])+'</ul></div></body></html>')
  base=d['arq'].replace('.docx','')
  open(base+'.html','w').write(''.join(h))
  subprocess.run(['/opt/pw-browsers/chromium-1194/chrome-linux/chrome','--headless','--no-sandbox','--disable-gpu','--no-pdf-header-footer',f'--print-to-pdf={os.getcwd()}/{base}.pdf',f'file://{os.getcwd()}/{base}.html'],capture_output=True)
  print(base, os.path.exists(base+'.pdf'))
