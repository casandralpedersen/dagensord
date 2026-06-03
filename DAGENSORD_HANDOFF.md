# Dagens Ord — Project Handoff

## Hvad er dette?

Mål: Åbn filen i en browser og den virker.

Projektet er bygget iterativt i Claude.ai chat og er klar til videreudvikling i VS Code.

---

## Fil-struktur

```
dagensord.html   ← hele appen (HTML + CSS + JS i én fil)
```

Ingen andre filer. Alt er inline.

> Note: Det er ikke en streng begrænsning, hvis du senere foretrækker at opdele appen i flere filer. Det er bare sådan prototypen er samlet lige nu.

---

## Design-beslutninger

**Æstetik:** Varm og organisk. Cremefarvet baggrund, runde hjørner, serif-fonte.

**Fonte (Google Fonts):**
- `Playfair Display` — ord-titler og headings (skarp, dramatisk serif)
- `EB Garamond` — brødtekst, definitioner, metadata (blød, klassisk)

**Farvepalette (CSS custom properties):**
```css
--bg:     #EDE8DF   /* varm creme baggrund */
--card:   #FAF7F2   /* kortets baggrund */
--ink:    #2D2520   /* primær tekst / knapper */
--muted:  #C0A890   /* dato, metadata */
--border: rgba(180,160,130,0.2)
--dashed: #D5C8B8   /* stiplede skillelinjer */
--def:    #6A5A4A   /* officiel definition */
/* kommentar: #B0A090 (lysere, stadig stående) */
/* citat:     #A8896A (kursiv, varm brun) */
```

---

## Data-model

Hvert ord gemmes som et objekt i `localStorage` under nøglen `dagensord-v1`:

```js
{
  id: 1747123456789,   // Date.now() timestamp
  word: "Lakonisk",
  date: "2. januar 2026",  // dansk formateret dato-streng
  def: "Kortfattet; ordknap.",             // officiel ordbogsdefinition
  comment: "Næsten kølig kommunikation.",  // brugerens egen kommentar
  quote: "Han svarede kun lakonisk: 'Det går.'"  // eksempel/citat
}
```

Listen gemmes som et array, **nyeste først** (index 0 = nyeste).

**Seed-data:** 35 ord er hardcodet i `SEED`-konstanten og indsættes automatisk første gang appen åbnes i en ny browser (når `localStorage` er tom).

---

## Funktionalitet — hvad er bygget

| Feature | Status |
|---|---|
| Vertikal kort-liste, nyeste øverst | ✅ |
| Klik for at folde ud (definition, kommentar, citat) | ✅ |
| Tre separate indholdslag på kortet | ✅ |
| Tilføj nyt ord (+ knap → modal nedefra) | ✅ |
| Rediger eksisterende ord (blyant-knap på udfoldet kort) | ✅ |
| Auto-kapitalisering af forbogstav | ✅ |
| Persistent storage via localStorage | ✅ |
| PWA-klar til iPhone hjemskærm | ✅ |
| iOS safe-area (notch + hjemknap) | ✅ |
| Tom-tilstand med velkomstbesked | ✅ |
| Ord-tæller i header | ✅ |
| Sortering (nyeste/alfabetisk) | ✅ |
| Swipe-slet af kort | ✅ |
| Søgning i ordlisten | ✅ |

---

## Hvad mangler (planlagt næste)

- **Delt liste** — pt. kun lokal. Fremtidig backend-integration (Supabase foreslået)
- **Ordklasse** — felt til fx "adjektiv", "substantiv" der vises i card-meta

---

## Sådan kører du det lokalt

1. Åbn `dagensord.html` direkte i Chrome eller Safari — ingen server nødvendig
2. localStorage virker fuldt ud med `file://` protokol
3. For at teste PWA-oplevelsen: brug en lokal server, fx `npx serve .` eller VS Code Live Server

---

## Sådan gemmes den til iPhone

1. Overfør `dagensord.html` til iPhone (AirDrop eller iCloud)
2. Åbn i **Safari** (ikke Chrome — kun Safari understøtter "Tilføj til hjemskærm")
3. Del-ikon → "Tilføj til hjemskærm"
4. Appen åbner uden browser-chrome og opfører sig som en native app

---

## Fremtidig deling med veninde

Når I skal dele listen er den naturlige næste skridt:
- Opret en gratis **Supabase**-database
- Erstat `localStorage` med Supabase-kald
- Tilføj simpel bruger-identifikation (fx et delt kodeord eller link)

Data-modellen er allerede kompatibel — det er kun storage-laget der skal udskiftes.

> Note: En delt backend er ikke et krav for selve appen. Det er en mulighed, hvis du vil gøre det nemmere at dele og synkronisere ord på tværs af enheder.

---

## Kode-noter til næste Claude

- Al logik er i én `<script>`-blok nederst i filen
- `createCard(entry)` bygger DOM for ét kort — rediger her for visuelle card-ændringer
- `renderAll()` tømmer og genrenderer hele listen fra localStorage
- `editingId` er `null` ved tilføj, og et tal ved redigering — `submitModal()` dispatcher til den rigtige funktion
- Seed-data er i `SEED`-konstanten og indsættes kun hvis `loadWords()` returnerer tom array
