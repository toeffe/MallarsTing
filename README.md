# Inspectra – Mobil rutekontrol

Visuel, smartphone-først inspektionapp. Statisk site til **GitHub Pages**.

**Live:** [kontrol.toeffe.uk](https://kontrol.toeffe.uk)

## Forløb

1. **Log ind** – Arbejds-ID (kun localStorage)
2. **Ruter** – Foruddefinerede ruter + intervalfilter
3. **Maskiner** – Gå igennem maskinerne trin for trin
4. **Kontrolpunkter** – OK / Slidt / Kritisk  
   - Slidt og Kritisk kræver **foto + bemærkning**  
   - Kritisk kan **markeres til udskiftning**
5. **Afslut rute**
   - Opsummering
   - **Download PDF** (fast sort/hvid layout, fotos indlejret)
   - **mailto:** med tekstrapport + påmindelse om at vedhæfte PDF
   - **Web Share** (når understøttet) til at dele PDF-filen

## Tema

Kun sort / hvid.  
Skift mellem **mørk ↔ lys** tilstand (gemmes). Respekterer `prefers-color-scheme` ved første besøg.

## Kør lokalt

```bash
npx serve .
# eller en hvilken som helst statisk server
```

## Udgiv (GitHub Pages)

Push til `main` udløser workflowen `.github/workflows/pages.yml`.

**Første gang – aktiver Pages i GitHub:**

1. Åbn repo → **Settings** → **Pages**
2. Under **Build and deployment** → **Source**: vælg **GitHub Actions**
3. Push til `main` (eller kør workflowen manuelt under **Actions**)

**Custom domain** (`kontrol.toeffe.uk`):

- Filen `CNAME` i roden sætter domænet automatisk
- DNS hos din udbyder: **CNAME** → `toeffe.github.io`
- I Pages: slå **Enforce HTTPS** til, når certifikatet er klar

## Tilpas

Rediger `js/data.js` for ruter, maskiner og kontrolpunkter.
