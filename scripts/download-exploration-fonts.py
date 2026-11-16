from pathlib import Path
import urllib.request,re,concurrent.futures
out=Path('apps/web/public/exploracao-fontes');out.mkdir(exist_ok=True)
fonts=['Newsreader','Source Sans 3','IBM Plex Sans','IBM Plex Mono','Archivo','Public Sans','IBM Plex Serif','Chivo','Asap','Fraunces','Work Sans','Epilogue','Karla','Barlow Semi Condensed','Barlow','General Sans','Satoshi']
def fetch(font):
 url='https://api.fontshare.com/v2/css?f[]='+font.lower().replace(' ','-')+'@400,600,700&display=swap' if font in ['General Sans','Satoshi'] else 'https://fonts.googleapis.com/css2?family='+font.replace(' ','+')+':wght@400;600;700&display=swap'
 source=urllib.request.urlopen(url,timeout=30).read().decode()
 for i,u in enumerate(dict.fromkeys(re.findall(r'url\([\"\x27]?(https[^)\"\x27]+)',source))):
  name=font.replace(' ','-')+'-'+str(i)+'.woff2'
  out.joinpath(name).write_bytes(urllib.request.urlopen(u,timeout=30).read());source=source.replace(u,'/exploracao-fontes/'+name)
 return source
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: css=list(pool.map(fetch,fonts))
Path('apps/web/src/features/exploracao/fonts.css').write_text('\n'.join(css),encoding='utf-8')
print('Fontes locais:',len(list(out.iterdir())))
