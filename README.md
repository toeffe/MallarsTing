# Inspectra – Mobil kontrol

<p align="center">
  <img src="src/banner.png" alt="Inspectra" width="840">
</p>

Statisk smartphone-app til ruteinspektion og rengøring. Kører uden backend – alt lagres i browseren (`localStorage`).

**Live:** [kontrol.toeffe.uk](https://kontrol.toeffe.uk)

## Forløb

1. **Log ind** – Arbejds-ID (gemmes i `localStorage`)
2. **Vælg kategori** – **Maskiner** eller **Rengøring**
3. **Vælg rute/zone** – filtrér efter interval (daglig / ugentlig / månedlig / årlig)
4. **Gennemgå punkter** – status + evt. foto/bemærkning
5. **Afslut** – markeres **Udført** (grøn) · PDF · e-mail / del

## Kategorier

| Kategori | Indhold | Statusvalg |
|---|---|---|
| **Maskiner** | Inspektionsruter med maskiner | OK / Slidt / Kritisk |
| **Rengøring** | Zoner med områder + plantegning | Udført / Ikke aktuelt / Afvigelse |

### Maskiner

- **Slidt** og **Kritisk** kræver foto + bemærkning
- **Kritisk** kan markeres til udskiftning
- Progress: `x / y maskiner`

### Rengøring

- Plantegning: `src/kort.png` (Blå vask · Rød produktion · Brun toilet/utility)
- Ruter er knyttet til zonerne via `zoneLabel`
- **Ikke aktuelt** – ingen foto/bemærkning
- **Afvigelse** – bemærkning påkrævet, foto valgfrit
- Progress: `x / y områder`
- Ingen “markér til udskiftning”

## Udført-status (grøn)

Når en rute afsluttes, gemmes den som udført pr. arbejds-ID og interval:

| Interval | Gælder indtil |
|---|---|
| Daglig | Næste dag |
| Ugentlig | Næste ISO-uge |
| Månedlig | Næste måned |
| Årlig | Næste år |

Rute-/zonekort får grøn kant + badge **Udført**. Ruten kan stadig åbnes og køres igen (overskriver perioden).

## Foto

I fotodialogen:

- **Tag foto** – åbner kamera (`capture="environment"`)
- **Vælg foto** – galleri / filvælger

Billeder komprimeres i browseren (max ~1600 px, JPEG) før de indlejres i PDF.

Kræver kamera-tilladelse i browseren (Chrome/Safari/Firefox). HTTPS er påkrævet på telefonen.

## Rapport / deling

Efter afslutning:

1. **Download PDF** – sort/hvid layout, fotos indlejret, kategori + zone i header
2. **Send via e-mail**
   - Telefon (Web Share med filer): deleark → vælg Mail → PDF vedhæftes
   - Desktop: PDF downloades + `mailto:` med tekst (browsere kan **ikke** vedhæfte via `mailto:`)
3. **Del PDF** – Web Share, når understøttet

PDF genereres klient-side med [jsPDF](https://github.com/parallax/jsPDF) (CDN).

## localStorage-nøgler

| Nøgle | Indhold |
|---|---|
| `inspectra_user` | Arbejds-ID |
| `inspectra_theme` | `dark` / `light` |
| `inspectra_category` | `maskiner` / `rengoring` |
| `inspectra_done` | JSON: `{ [userId]: { [routeId]: { period, at } } }` |
| `inspectra_builder_draft` | Ruteværktøjets udkast (`builder.html`) |

## Tema

Kun sort / hvid (+ grøn til **Udført**).  
Skift mørk ↔ lys (gemmes). Første besøg følger `prefers-color-scheme`.

## Projektstruktur

```
index.html          # Views + fotomodal
builder.html        # Ruteværktøj (Maskiner + Rengøring)
css/styles.css      # Tema, layout, statusknapper
css/builder.css     # Desktop-layout til værktøjet
js/app.js           # Flow, PDF, share, done-status
js/builder.js       # Ruteværktøj
js/data.js          # Ruter, maskiner/områder, statuskoder
src/kort.png        # Plantegning (Rengøring)
src/banner.png      # README-banner
CNAME               # kontrol.toeffe.uk
.github/workflows/pages.yml
```

## Tilpas data

1. Åbn [builder.html](builder.html) (live: [kontrol.toeffe.uk/builder.html](https://kontrol.toeffe.uk/builder.html)).
2. Byg **Maskiner**-ruter og **Rengøring**-zoner.
3. **Download data.js** (eller kopiér) og erstat [`js/data.js`](js/data.js).
4. Udgiv (push til `main`).

Udkast gemmes i browseren. **Gendan fra data.js** kasserer udkastet. Statuskoder røres ikke.

Hver rute i `data.js`:

```js
{
  id: "clean-blue",
  name: "Blå zone – Vask",
  description: "…",
  schedule: "daily",          // daily | weekly | monthly | yearly
  category: "rengoring",      // maskiner | rengoring
  zoneLabel: "Blå · Vask",    // valgfri (vises på kort + i PDF)
  machines: [                 // maskiner eller rengøringsområder
    {
      id: "C-BL-1",
      name: "Vaskelinje vest",
      location: "Blå zone · venstre linje",
      checks: [
        { id: "floor", label: "Gulv og afløb" },
      ],
    },
  ],
}
```

Statuskoder (`STATUS` / `STATUS_LABEL`):

- Maskiner: `ok`, `worn`, `critical`
- Rengøring: `done`, `skip`, `issue`

## Kør lokalt

```bash
npx serve .
# eller en hvilken som helst statisk server
```

Åbn URL’en på telefonen via samme Wi‑Fi, eller deploy til Pages for kamera/HTTPS.

## Udgiv (GitHub Pages)

Push til `main` kører [`.github/workflows/pages.yml`](.github/workflows/pages.yml).  
Workflow kopierer `index.html`, `builder.html`, `CNAME`, `css/`, `js/` og `src/` til Pages.

**Første gang:**

1. Repo → **Settings** → **Pages**
2. **Source:** GitHub Actions
3. Push til `main` (eller kør workflowen under **Actions**)

**Custom domain** (`kontrol.toeffe.uk`):

- `CNAME` i roden
- DNS: **CNAME** → `toeffe.github.io`
- Slå **Enforce HTTPS** til, når certifikatet er klar
