# Shiny Bubble Offerte Wizard

Dit project bevat de offerte-wizard module voor Shiny Bubble.  
Gebouwd met **React + Vite + TailwindCSS**.

## Installatie

1. Pak dit zip-bestand uit.
2. Open een terminal in de projectmap.
3. Installeer dependencies:
   ```bash
   npm install
   ```
4. Start de ontwikkelserver:
   ```bash
   npm run dev
   ```
   De app draait nu lokaal op http://localhost:5173

5. Voor een productie build:
   ```bash
   npm run build
   ```
   De gecompileerde bestanden komen in de `dist/` map.

## Gebruik in WordPress

- De `dist/` bestanden kunnen in WordPress ingebouwd worden via een plugin of shortcode die de gebuilde JS/CSS laadt.
- Backend endpoint `/wp-json/sb-offerte/v1/send-quote` moet aanwezig zijn voor het versturen van offertes.

## Belangrijkste bestanden

- `src/OffertePaginaVoorbeeld.tsx` → de complete wizard code
- `src/main.tsx` → mount point
- `src/index.css` → Tailwind styles
- `index.html` → startpunt Vite

## Opmerkingen

- Alle prijzen worden incl. btw getoond.
- PTFE upsell verschijnt alleen bij totaal ≥ €400 en als 'Alleen wassen' gekozen is.
- Coating opties: PTFE (6 maanden), Keramisch (3 jaar, met popup uitleg), of Geen coating.
- Samenvatting bevat toggles per optie en mogelijkheid om offerte naar e-mail te sturen.

---

© Shiny Bubble
