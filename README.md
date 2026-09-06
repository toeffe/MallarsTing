# Inspectra – Offline kontrolplatform

<p align="center">
  <img src="src/banner.png" alt="Inspectra" width="840">
</p>

Statisk web-app til at bygge og udføre digitale kontroller. Kører uden backend – alt lagres i browseren (`localStorage`). Virksomheden ejer sine data; Inspectra behøver ikke modtage eller opbevare kontroldata.

**Live:** [kontrol.toeffe.uk](https://kontrol.toeffe.uk)

Mallars Ting leveres med indbyggede **Maskiner**- og **Rengøring**-kontroller genereret fra [`src/data.js`](src/data.js). Referencefotos ligger som filer under `src/` (ikke base64).

## Grundprincip

En kontrolskabelon (**Kontrol**) bygges frit i [builder.html](builder.html): egne felter, egne svarmuligheder, eget layout. Skabelonen eksporteres som en `.inspectra`-fil og importeres på den enhed, der skal udføre kontrollen ([index.html](index.html)) – typisk PC bygger, telefon/tablet udfører. Enhederne behøver ikke kende hinanden.

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

Svarmuligheder er aldrig hardcodet: et **AnswerSet** er et navngivet, genbrugeligt sæt af muligheder (fx "Tilstand": OK/Slidt/Kritisk), som Enkeltvalg-, Checkbokse- og Dropdown-felter peger på.

Builtin Mallars-kontroller bruger `executionView: "begge"`, så både **Oversigt** og **Punktvisning** (ét kontrolpunkt ad gangen) virker. Standardvisningen på telefonen er Punktvisning.

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

Hvert felt kan markeres **påkrævet**. Maskiner-seedet kræver kommentar + foto på hvert punkt; Rengøring-seedet kræver status, foto er valgfrit.

## Builtin seed (Mallars Ting)

Første load uden installerede skabeloner kører `ensureTemplatesInstalled()`:

1. Hvis `inspectra_builder_draft` findes (gammelt ruteværktøj) → konverter ruterne, slet udkastet
2. Ellers installer [`js/seed-templates.js`](js/seed-templates.js)

Seedet er `ROUTES` fra [`src/data.js`](src/data.js) kørt gennem `convertLegacyRoute` (`js/migrate.js`). IDs som `rute-1-produktionshal-a` bevares som `referenceId`, så gamle `inspectra_done`-badges stadig matcher.

Efter ændring af `src/data.js`:

```bash
node scripts/gen-seed.mjs
```

Referencefotos: `src/pakkemaskine-a1*.jpg`, `src/highlight*.png` / `.jpg`, `src/kort.png`.

## Byg en kontrol

1. Åbn [builder.html](builder.html) (live: [kontrol.toeffe.uk/builder.html](https://kontrol.toeffe.uk/builder.html)).
2. Opret en kontrol, tilføj grupper (maskiner/områder) og kontrolpunkter.
3. Byg hvert kontrolpunkts layout: tilføj rækker (1–3 kolonner), placér felter, sæt svarmuligheder op.
4. **Eksportér .inspectra** – dette øger versionsnummeret og downloader `{referenceId}_v{version}.inspectra`. Reference-ID låses efter første eksport.
5. Overfør filen til målenheden og **importér** den i [index.html](index.html)'s dashboard.

Findes Reference-ID'et allerede på enheden, vises version-sammenligning og et **Opdater kontrol**-valg. Allerede gennemførte kontroller (historik) påvirkes aldrig af en opdatering – de gemmer et snapshot af den skabelon, de blev udført med.

## Udfør en kontrol

1. **Log ind** – Arbejds-ID (gemmes i `localStorage`)
2. **Vælg kategori og kontrol** på dashboardet
3. **Gennemgå grupper og kontrolpunkter** – Oversigt, Punktvisning (ét ad gangen), eller Begge (skift undervejs)
4. **Afslut gruppe** når alle påkrævede felter er udfyldt, derefter **Afslut kontrol**
5. **Historik** gemmer resultatet permanent; **PDF** genereres on-demand (også fra historik)

## Historik

Hver gennemført kontrol gemmes med et fuldt snapshot af den anvendte skabelon plus alle svar, fotos og signatur. En senere opdatering af skabelonen ændrer aldrig en tidligere gemt kontrol. PDF'en genereres fra snapshottet.

## Auto-update

Efter hver Pages-deploy skrives `_site/version.json` med git SHA (10 tegn) + UTC-tid. Åbne telefoner poller hvert 5. minut og ved fokus, og viser **Ny version klar / Genindlæs**.

## localStorage-nøgler

| Nøgle | Indhold |
|---|---|
| `inspectra_templates` | `{ referenceId: Template }` – alle installerede kontroller |
| `inspectra_answersets` | `{ id: AnswerSet }` – delt bibliotek af svarmuligheder |
| `inspectra_history` | `{ id: HistoryEntry }` – gennemførte kontroller med snapshot |
| `inspectra_done` | `{ userId: { referenceId: { period, at } } }` – "udført denne periode"-badge |
| `inspectra_user` | Arbejds-ID |
| `inspectra_theme` | `dark` / `light` |
| `inspectra_category_filter` | Sidst valgte kategori-fane |
| `inspectra_view_pref` | Sidst valgte Oversigt/Punktvisning ved "Begge" |

`inspectra_builder_draft` er det gamle ruteværktøjs udkast. Første load konverterer det og sletter nøglen.

## Installér som app (iPhone/Android)

- **iPhone (Safari):** Del-ikon → **Føj til hjemmeskærm**
- **Android (Chrome):** Menu → **Installer app** / **Føj til startskærm**

`index.html` = **Inspectra** (udførelse), `builder.html` = **Inspectra Byg**. Ingen service worker; besøg siden med netværk mindst én gang, derefter kører appen offline.

## Tema

Kun sort / hvid (+ grøn til **Udført**). Skift mørk ↔ lys (gemmes). Første besøg følger `prefers-color-scheme`.

## Projektstruktur

```
index.html              # Udførelse: dashboard, gruppe/punkt-visning, PDF, historik
builder.html            # Kontrolværktøj: skabelon-, felt- og svarmuligheds-editor
manifest.json           # Web App Manifest for index.html
manifest-builder.json   # Web App Manifest for builder.html
version.json            # Lokal stub; Pages overskriver med SHA ved deploy
src/icons/              # App-ikoner
src/data.js             # Seed-kilde (legacy ROUTES) — regenerér seed efter ændring
src/*.jpg               # Referencefotos til kontrolpunkter
src/kort.png            # Plantegning (Rengøring)
css/styles.css
css/builder.css
js/app.js
js/builder.js
js/fields.js
js/signature.js
js/store.js
js/inspectra-io.js
js/migrate.js           # convertLegacyRoute + ensureTemplatesInstalled
js/seed-templates.js    # Builtin Maskiner + Rengøring (genereret)
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

Ingen Inspectra-cloud, central brugerkonto, live synkronisering, service worker, web-dashboard, avanceret statistik, eller central administration af kundens enheder.
