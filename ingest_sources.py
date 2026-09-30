#!/usr/bin/env python3
"""
MotorLab — ingest_sources.py
Coloca los 10 PDFs originales dentro de ./sources/ y ejecuta:
    python ingest_sources.py

Requisitos:
    pip install pymupdf pytesseract pillow
    además de Tesseract OCR instalado (con idioma spa).

Salida:
    data/games_full.json
    data/page_index.json
    data/review_queue.json

La extracción distingue dos casos:
1) PDF con texto: se usa el texto nativo.
2) PDF escaneado: se renderiza cada página y se aplica OCR.

No se elimina ninguna página: las páginas sin un juego detectado quedan en
review_queue.json para revisión manual. Esto evita que un juego quede fuera
silenciosamente por una mala lectura OCR.
"""
from pathlib import Path
import json, re, unicodedata, os
import fitz
import pytesseract
from PIL import Image

ROOT=Path(__file__).resolve().parent
SRC=ROOT/"sources"; DATA=ROOT/"data"; DATA.mkdir(exist_ok=True)
PDFS=list(SRC.glob("*.pdf"))

def clean(s):
    s=re.sub(r'\s+',' ',s or '').strip()
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]','',s)

def native_text(page):
    return clean(page.get_text("text"))

def ocr_text(page):
    pix=page.get_pixmap(matrix=fitz.Matrix(1.2,1.2), colorspace=fitz.csGRAY, alpha=False)
    img=Image.frombytes("L",[pix.width,pix.height],pix.samples)
    return clean(pytesseract.image_to_string(img,lang="spa",config="--psm 6"))

def detect_games(text, filename, page_no):
    out=[]
    # +120 Juegos: one game per page with Edad/Material/Descripción.
    if "Edad:" in text and "Material:" in text and "Descripción:" in text:
        lines=[x.strip() for x in text.splitlines() if x.strip()]
        try:
            ai=next(i for i,x in enumerate(lines) if x.startswith("Edad:"))
            mi=next(i for i,x in enumerate(lines) if x.startswith("Material:"))
            di=next(i for i,x in enumerate(lines) if x.startswith("Descripción:"))
            age=lines[ai].split(":",1)[1].strip()
            material=lines[mi].split(":",1)[1].strip()
            body=lines[di+1:]
            while body and body[-1].startswith("@"): body.pop()
            if body:
                title=body.pop()
                out.append({"title":title.title(),"age":age,"material":material,
                            "description":clean(" ".join(body)),"source":filename,"page":page_no})
        except StopIteration:
            pass
    # Session books: named games.
    pat=re.compile(r'Juego(?:\s+n[º°o]\s*\d+)?[,:\s]+[“"]([^”"]+)[”"]',re.I)
    for m in pat.finditer(text):
        title=clean(m.group(1))
        if 1 <= len(title) <= 100:
            out.append({"title":title,"age":"No especificada","material":"No especificado",
                        "description":clean(text[max(0,m.start()-120):m.end()+900]),
                        "source":filename,"page":page_no})
    # OCR-friendly fallback for headings such as JUEGO Nº 1 EL PELELE.
    pat2=re.compile(r'(?:JUEGO|JUEGO N[º°]?\s*\d+)\s+([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 \-]{2,70})',re.I)
    for m in pat2.finditer(text):
        title=clean(m.group(1)).strip(" .:-")
        if title and not any(x["title"].lower()==title.lower() for x in out):
            out.append({"title":title.title(),"age":"No especificada","material":"No especificado",
                        "description":clean(text[max(0,m.start()-80):m.end()+700]),
                        "source":filename,"page":page_no})
    return out

games=[]; pages=[]; review=[]
for pdf in PDFS:
    doc=fitz.open(pdf)
    for i,page in enumerate(doc,1):
        text=native_text(page)
        method="text"
        if len(text)<80:
            text=ocr_text(page); method="ocr"
        pages.append({"source":pdf.name,"page":i,"method":method,"text":text})
        found=detect_games(text,pdf.name,i)
        if found:
            games.extend(found)
        else:
            review.append({"source":pdf.name,"page":i,"method":method,"reason":"No se detectó un título de juego con las reglas automáticas."})
    doc.close()

# Stable IDs and deduplication only by exact source/page/title — repeated appearances are preserved.
for n,g in enumerate(games,1):
    g["id"]=f"src-{n:05d}"
    g["space"]="Pista / gimnasio"
    g["intensity"]="Media"

(DATA/"games_full.json").write_text(json.dumps(games,ensure_ascii=False,indent=2),encoding="utf-8")
(DATA/"page_index.json").write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding="utf-8")
(DATA/"review_queue.json").write_text(json.dumps(review,ensure_ascii=False,indent=2),encoding="utf-8")
print(f"Juegos detectados: {len(games)}")
print(f"Páginas indexadas: {len(pages)}")
print(f"Páginas para revisión: {len(review)}")
