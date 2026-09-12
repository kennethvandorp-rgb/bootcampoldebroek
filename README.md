# Klantvolgsysteem PT Studio Oldebroek

Een systeem om klanten van de PT-studio te monitoren op voeding en InBody-metingen,
met bewaking van het contactmoment-interval (elke 4-6 weken via WhatsApp, e-mail of
een InBody-meting).

## Functionaliteit

- **Klantbeheer** — klanten aanmaken/bewerken, met een instelbaar contactinterval (4, 5 of 6 weken).
- **Contactmomenten** — leg vast wanneer en hoe (WhatsApp, e-mail, InBody-meting, belafspraak,
  persoonlijk gesprek, overig) je contact had met een klant.
- **InBody-metingen** — registreer gewicht, spiermassa, vetpercentage, BMI, visceraal vet,
  lichaamswater en BMR per meting, met historie per klant. Een nieuwe InBody-meting kan
  automatisch ook als contactmoment worden geregistreerd.
- **Voedingsanalyses** — leg voedingsanalyses en adviezen vast, inclusief kcal- en
  macronutriëntendoelen.
- **Doelen en actiepunten** — leg doelen vast per klant (met status: open/bezig/behaald/gestopt)
  en koppel actiepunten met deadlines.
- **Dashboard** — ziet in één oogopslag welke klanten achterstallig zijn, binnenkort een
  contactmoment nodig hebben, of nog nooit zijn benaderd.

Het systeem berekent automatisch of een klant "op schema", "binnenkort" aan de beurt, of
"achterstallig" is, op basis van het laatste contactmoment en het ingestelde interval.

## Techstack

- [Next.js](https://nextjs.org) (App Router, Server Actions) + TypeScript
- [Prisma ORM](https://www.prisma.io) met SQLite (via de `@libsql` driver adapter)
- Tailwind CSS

## Aan de slag

1. Installeer dependencies:

   ```bash
   npm install
   ```

2. Kopieer `.env.example` naar `.env` en vul een wachtwoord in:

   ```bash
   cp .env.example .env
   ```

3. Zet de database klaar:

   ```bash
   npx prisma migrate deploy
   ```

4. Start de ontwikkelserver:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) en log in met het wachtwoord uit `.env`.

## Beveiliging

Toegang tot het systeem is beveiligd met één gedeeld wachtwoord (`APP_PASSWORD` in `.env`),
bedoeld voor intern gebruik binnen de studio. Dit is bewust eenvoudig gehouden; voor gebruik
door meerdere medewerkers met eigen accounts is een uitgebreidere authenticatie-oplossing nodig.

## Database

De data wordt lokaal opgeslagen in een SQLite-bestand (`dev.db`, genegeerd door git). Voor
productiegebruik: zorg voor een persistente schijf op de server waar dit bestand op staat, en
maak regelmatig een back-up van `dev.db`.

Schemawijzigingen worden beheerd via Prisma-migraties in `prisma/migrations`. Na een wijziging
in `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name <omschrijving>
```
