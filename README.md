# Inspectra – Mobil rutekontrol

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

Push denne mappe → Settings → Pages → Deploy from branch / root.

## Tilpas

Rediger `js/data.js` for ruter, maskiner og kontrolpunkter.
