#!/usr/bin/env python3
"""Import verified assets from the public tender listing into the microsite.
Requires GitHub Actions network access; does not claim success for failed files.
"""
import json, os, pathlib, subprocess, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
base = pathlib.Path(__file__).resolve().parent
site = base / "pyatnitskaya-15"
manifest_file=site/"media.json"
data=json.loads(manifest_file.read_text())
photos=site/"assets"/"photos"
docs=site/"assets"/"documents"
plans=site/"assets"/"plans"
for d in [photos,docs,plans]: d.mkdir(parents=True,exist_ok=True)
agent="Mozilla/5.0 (compatible; PyatnitskayaMicrosite/1.0)"
def download(url, path, expected, minsize=300):
    for attempt in range(2):
        try:
            request=urllib.request.Request(url, headers={"User-Agent":agent,"Referer":"https://torgi.mos.ru/tender/20182722","Accept":"*/*"})
            with urllib.request.urlopen(request,timeout=10) as response:
                ctype=response.headers.get("Content-Type","")
                body=response.read(70_000_000)
            if len(body)<minsize: raise ValueError(f"Too small: {len(body)}")
            if expected=="image" and not body.startswith((b"\xff\xd8\xff",b"\x89PNG",b"RIFF")): raise ValueError("Non-image response")
            if expected=="pdf" and not body.startswith(b"%PDF"): raise ValueError("Non-PDF response")
            path.write_bytes(body)
            return True
        except Exception as exc:
            print(f"FAILED {path.name} attempt {attempt+1}: {exc}",flush=True)
            time.sleep(1)
    return False
def take_photo(task):
    i,item=task
    path=photos/f"photo-{i:03d}.jpg"
    return i, download(item["url"],path,"image")
photos_ok=0
with ThreadPoolExecutor(max_workers=12) as pool:
    for i,ok in pool.map(take_photo,enumerate(data["gallery"],1)):
        if ok:
            data["gallery"][i-1]["url"]=f"assets/photos/photo-{i:03d}.jpg"
            photos_ok+=1
docfiles={6539559:"bti-floor-plans.pdf",6539558:"bti-explication.pdf",6539563:"heritage-documents.pdf",6539564:"land-egrn.pdf",6539560:"bti-condition.pdf",6539565:"bti-technical-passport.pdf",6539562:"encumbrances.pdf",6539561:"building-egrn.pdf"}
def take_doc(item):
    link=item["url"]
    try: id=int(link.split("attachmentId=")[1].split("&")[0])
    except: return None,False
    if id not in docfiles:return None,False
    dest=docs/docfiles[id]
    return id,download(link,dest,"pdf",minsize=500)
doc_ok=0
with ThreadPoolExecutor(max_workers=8) as pool:
    for item,(id,ok) in zip(data["documents"],pool.map(take_doc,data["documents"])):
        if ok:
            item["url"]="assets/documents/"+docfiles[id]
            item["note"]="Просмотр на сайте • PDF"
            doc_ok+=1
if (docs/"bti-floor-plans.pdf").is_file():
    try:
        prefix=plans/"bti"
        subprocess.run(["pdftoppm","-f","1","-l","4","-scale-to","1400","-jpeg",str(docs/"bti-floor-plans.pdf"),str(prefix)],timeout=90,check=True)
        generated=sorted(plans.glob("bti-*.jpg"))
        data["plans"]=[{"url":"assets/plans/"+p.name,"title":f"БТИ — лист {i+1}"} for i,p in enumerate(generated)]
    except Exception as e:print("Plan rendering failed:",str(e))
manifest_file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
report={"photos_saved":photos_ok,"photos_expected":len(data["gallery"]),"pdf_saved":doc_ok,"pdf_expected":len(docfiles),"plan_images":len(data.get("plans",[]))}
(base/"pyatnitskaya-15"/"import-status.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
print("ASSET IMPORT RESULT:",report)
