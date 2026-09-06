# Inspectra – Offline kontrolplatform

<p align="center">
  <img src="src/banner.png" alt="Inspectra" width="840">
</p>

Statisk web-app til at bygge og udføre digitale kontroller. Kører uden backend – alt lagres i browseren (`localStorage`). Virksomheden ejer sine data; Inspectra behøver ikke modtage eller opbevare kontroldata.

**Live:** [kontrol.toeffe.uk](https://kontrol.toeffe.uk)

Appen leveres med indbyggede **Maskiner**- og **Rengøring**-kontroller. Referencefotos ligger som filer under `src/`.

## Grundprincip

En kontrolskabelon (**Kontrol**) bygges i [builder.html](builder.html): egne felter, egne svarmuligheder, eget layout. Skabelonen eksporteres som en `.inspectra`-fil og importeres på den enhed, der skal udføre kontrollen ([index.html](index.html)) – typisk PC bygger, telefon/tablet udfører. Enhederne behøver ikke kende hinanden.

```
PC (builder.html)                 Telefon/tablet (index.html)
Byg kontrol                       Importér .inspectra
  │                                     │
  ▼                                     ▼
Eksportér .inspectra  ───(fil)───>  Udfør kontrol offline
                                        │
                                        ▼
                                   Historik + PDF lokalt
```

## Datamodel

```
Template (Kontrol)
  referenceId      permanent, virksomheden vælger selv (fx "AVA2-PK-001")
  version          øges ved hver eksport
  executionView    "oversigt" | "punktvisning" | "begge"
  groups: Group[]

Group                          (fysisk maskine/område)
  points: Kontrolpunkt[]

Kontrolpunkt
  rows: Row[]                  visuel række/kolonne-grid

Row
  columns: 1 | 2 | 3
  fields: Field[]
```

Svarmuligheder er aldrig hardcodet: et **AnswerSet** er et navngivet, genbrugeligt sæt (fx "Tilstand": OK/Slidt/Kritisk), som Enkeltvalg-, Checkbokse- og Dropdown-felter peger på.

De indbyggede kontroller bruger `executionView: "begge"`, så både **Oversigt** og **Punktvisning** virker. Standardvisningen er Punktvisning (ét kontrolpunkt ad gangen).

### Felttyper

| Type | Dansk navn | Bemærkning |
|---|---|---|
| `heading` | Overskrift | Ren sektionstekst, intet svar |
| `short_text` / `long_text` | Kort/lang tekst | Fritekst |
| `comment` | Kommentar | Fritekst, samme render som lang tekst |
| `number` | Tal | Valgfri enhed |
| `yesno` | Ja/Nej | Fast to-valg |
| `single_choice` | Enkeltvalg | Fra et AnswerSet |
| `multi_choice` | Checkbokse | Fra et AnswerSet, flere valg |
| `dropdown` | Dropdown | Fra et AnswerSet |
| `date` | Dato | |
| `photo` | Kontrolbillede | Kamera/galleri/begge, ét eller flere billeder |
| `reference_image` | Referencebillede | Sat ved opbygning, skrivebeskyttet ved udførelse |
| `signature` | Signatur | Frihånds-underskrift på canvas |

Hvert felt kan markeres **påkrævet**. Maskiner-kontrollerne kræver kommentar + foto på hvert punkt; Rengøring kræver status, foto er valgfrit.

## Indbyggede kontroller

Første load uden installerede skabeloner installerer [`js/seed-templates.js`](js/seed-templates.js) (Maskiner + Rengøring).

Kilden er [`src/data.js`](src/data.js). Efter ændring:

```bash
node scripts/gen-seed.mjs
```

Referencefotos: `src/pakkemaskine-a1*.jpg`, `src/highlight*.png` / `.jpg`, `src/kort.png`.

## Byg en kontrol

1. Åbn [builder.html](builder.html) (live: [kontrol.toeffe.uk/builder.html](https://kontrol.toeffe.uk/builder.html)).
2. Opret en kontrol, tilføj grupper (maskiner/områder) og kontrolpunkter.
3. Byg hvert kontrolpunkts layout: tilføj rækker (1–3 kolonner), placér felter, sæt svarmuligheder op.
4. **Eksportér .inspectra** – øger versionsnummeret og downloader `{referenceId}_v{version}.inspectra`. Reference-ID låses efter første eksport.
5. Overfør filen til målenheden og **importér** den i [index.html](index.html).

Findes Reference-ID'et allerede, vises version-sammenligning og **Opdater kontrol**. Gennemførte kontroller i historikken påvirkes ikke – de gemmer et snapshot af den skabelon, de blev udført med.

## Udfør en kontrol

1. **Log ind** – Arbejds-ID (gemmes i `localStorage`)
2. **Vælg kategori og kontrol** på dashboardet
3. **Gennemgå kontrolpunkter** – svar gemmes løbende
   - **Punktvisning:** **Forrige** / **Næste** i bundlinjen. Næste går videre til næste punkt og næste gruppe. Sidste punkt bliver **Afslut**, når alt er udfyldt.
   - **Oversigt:** alle punkter på én side. **←** tilbage til gruppelisten.
4. **Afslut** gemmer i historik; **PDF** genereres on-demand (også fra historik)

## Historik

Hver gennemført kontrol gemmes med et fuldt snapshot af skabelonen plus svar, fotos og signatur. En senere opdatering af skabelonen ændrer aldrig en tidligere gemt kontrol. PDF'en genereres fra snapshottet.

## Auto-update

Efter hver Pages-deploy skrives `_site/version.json` med git SHA (10 tegn) + UTC-tid. Åbne telefoner tjekker hvert 5. minut og ved fokus, og viser **Ny version klar / Genindlæs**.

## localStorage-nøgler

| Nøgle | Indhold |
|---|---|
| `inspectra_templates` | `{ referenceId: Template }` – installerede kontroller |
| `inspectra_answersets` | `{ id: AnswerSet }` – svarmuligheder |
| `inspectra_history` | `{ id: HistoryEntry }` – gennemførte kontroller med snapshot |
| `inspectra_done` | `{ userId: { referenceId: { period, at } } }` – "udført denne periode" |
| `inspectra_user` | Arbejds-ID |
| `inspectra_theme` | `dark` / `light` |
| `inspectra_category_filter` | Sidst valgte kategori-fane |
| `inspectra_view_pref` | Sidst valgte Oversigt/Punktvisning ved "Begge" |

## Installér som app (iPhone/Android)

- **iPhone (Safari):** Del-ikon → **Føj til hjemmeskærm**
- **Android (Chrome):** Menu → **Installer app** / **Føj til startskærm**

`index.html` = **Inspectra** (udførelse), `builder.html` = **Inspectra Byg**. Ingen service worker; besøg siden med netværk mindst én gang, derefter kører appen offline.

## Tema

Kun sort / hvid (+ grøn til **Udført**). Skift mørk ↔ lys (gemmes). Første besøg følger `prefers-color-scheme`.

## Projektstruktur

```
index.html              # Udførelse: dashboard, punktvisning, PDF, historik
builder.html            # Kontrolværktøj
manifest.json           # Web App Manifest (Inspectra)
manifest-builder.json   # Web App Manifest (Inspectra Byg)
version.json            # Lokal stub; Pages overskriver med SHA ved deploy
src/icons/              # App-ikoner
src/data.js             # Kilde til indbyggede kontroller
src/*.jpg               # Referencefotos
src/kort.png            # Plantegning (Rengøring)
css/styles.css
css/builder.css
js/app.js
js/builder.js
js/fields.js
js/signature.js
js/store.js
js/inspectra-io.js
js/migrate.js           # Installerer indbyggede skabeloner ved første load
js/seed-templates.js    # Maskiner + Rengøring (genereret)
js/update-checker.js    # Poller version.json
js/util.js
js/theme.js
js/image.js
scripts/gen-seed.mjs    # node scripts/gen-seed.mjs
CNAME                   # kontrol.toeffe.uk
.github/workflows/pages.yml
```

## Kør lokalt

```bash
npx serve .
```

Åbn URL'en på telefonen via samme Wi-Fi, eller deploy til Pages for kamera/HTTPS.

## Udgiv (GitHub Pages)

Push til `main` kører [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Workflow kopierer HTML, manifests, `CNAME`, `css/`, `js/` og `src/`, og stamper `version.json`.

**Første gang:** Settings → Pages → Source: GitHub Actions.

**Custom domain** (`kontrol.toeffe.uk`): `CNAME` i roden, DNS CNAME → `toeffe.github.io`, Enforce HTTPS.

## Ikke i denne version

Ingen cloud, central brugerkonto, live synkronisering, service worker, web-dashboard, avanceret statistik, eller central administration af enheder.
