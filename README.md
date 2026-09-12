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
  contactmoment nodig hebben, of nog nooit zijn benaderd, met een waarschuwingsbanner zodra
  er klanten aandacht nodig hebben.
- **Slimme intervalsuggestie** — vul bij een klant in hoeveel keer per week en hoe lang die
  traint; het systeem stelt op basis daarvan een passend contactinterval voor (wie vaker
  traint boekt sneller voortgang en heeft baat bij kortere terugkoppeling).
- **Automatische controle en waarschuwing** — een cron-endpoint (`/api/cron/contact-check`)
  controleert periodiek welke klanten aandacht nodig hebben, legt dit vast, en kan optioneel
  een waarschuwingsmail sturen. Kan ook handmatig gestart worden via de knop "Controleer nu"
  op het dashboard.

Het systeem berekent automatisch of een klant "op schema", "binnenkort" aan de beurt, of
"achterstallig" is, op basis van het laatste contactmoment (datum én type: WhatsApp, e-mail,
InBody-meting, ...) en het ingestelde interval.

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

## Automatische waarschuwing koppelen

Het dashboard toont waarschuwingen zodra iemand het opent, en de knop "Controleer nu" logt
een controle en verstuurt (indien geconfigureerd) direct een mail. Om dit dagelijks
automatisch te laten lopen — ook als niemand inlogt — koppel je een externe scheduler aan
`/api/cron/contact-check`:

1. Zet `CRON_SECRET` in `.env` op een lange willekeurige waarde.
2. Configureer een gratis scheduler (bijv. [cron-job.org](https://cron-job.org) of een
   [GitHub Actions `schedule`-workflow](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#schedule))
   om dagelijks een GET-request te sturen naar:

   ```
   https://<jouw-domein>/api/cron/contact-check?secret=<CRON_SECRET>
   ```

   (of met header `Authorization: Bearer <CRON_SECRET>`).

3. Optioneel: wil je ook echt een waarschuwingsmail ontvangen (niet alleen een dashboard-melding),
   maak dan een gratis account op [Resend](https://resend.com) en zet in `.env`:

   ```
   RESEND_API_KEY="re_xxx"
   NOTIFY_EMAIL="jouw-email@voorbeeld.nl"
   NOTIFY_FROM_EMAIL="waarschuwingen@jouw-domein.nl"
   ```

   Zonder deze drie variabelen blijft de controle en het dashboard gewoon werken; er wordt
   dan alleen geen e-mail verstuurd.

Elke uitgevoerde controle (handmatig of via de cron) wordt gelogd, inclusief of er een mail
is verstuurd — zichtbaar onderaan het dashboard bij "Automatische controle".

## Database

De data wordt lokaal opgeslagen in een SQLite-bestand (`dev.db`, genegeerd door git). Voor
productiegebruik: zorg voor een persistente schijf op de server waar dit bestand op staat, en
maak regelmatig een back-up van `dev.db`.

Schemawijzigingen worden beheerd via Prisma-migraties in `prisma/migrations`. Na een wijziging
in `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name <omschrijving>
```
