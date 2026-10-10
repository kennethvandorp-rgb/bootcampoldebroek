# CRM & retentiesysteem PT Studio Oldebroek

Een webgebaseerd CRM voor personal trainers om klantcontact **buiten de PT-sessies** te
monitoren, zodat geen enkele klant uit beeld raakt. Werkt op mobiel en desktop.

## Functionaliteit

### Trainers & klanten
- **Trainer-accounts** — elke trainer logt in met een eigen e-mailadres en wachtwoord.
  Beheerders kunnen trainers toevoegen, deactiveren en wachtwoorden resetten (pagina *Trainers*).
- **Multi-assign** — een klant kan aan één of meerdere trainers tegelijk gekoppeld worden.
  Met "Mijn klant maken" op de klantpagina koppel je jezelf snel.
- **Filters** — overal te filteren op *Mijn klanten* / *Alle klanten*, op een specifieke trainer
  en op status (groen/oranje/rood). Filters staan in de URL, dus een selectie is te bookmarken.

### Contactmomenten (interactielog)
- Typen: WhatsApp, E-mail, Telefonisch, InBody-meting, PT-sessie, Overig.
- Per contact: type, datum én tijd, uitvoerende trainer en notitie/inhoud van het gesprek.
- **Quick Log** op elke klantkaart: klik op *⚡ Quick log* en daarna op het type — binnen
  2 klikken is een appje of meting gelogd (nu, door jou; optioneel met korte notitie).
- Complete **tijdlijn** per klant, inclusief gekoppelde InBody-waarden.

### Automatische status
Berekend op basis van het **laatste** contactmoment:

| Status | Betekenis | Regel |
| --- | --- | --- |
| 🟢 Groen | Actief | contact < 7 dagen geleden |
| 🟠 Oranje | Aandacht nodig | contact 7 t/m 14 dagen geleden |
| 🔴 Rood | Actie vereist | > 14 dagen geen contact, of nog nooit contact |

De datum van het laatste contact wordt opgeslagen op de klant (`lastContactDate`); de status
zelf wordt bij elke weergave berekend, zodat die nooit verouderd is.

### Taken & reminders (doorplannen)
- Plan per klant een vervolgcontact of taak in met streefdatum, toegewezen trainer en
  instructie (bijv. "InBody nameting inplannen" of "Checken hoe de spierpijn is").
- Op de streefdatum verschijnt de taak in **Vandaag te doen** op het dashboard van die trainer;
  verlopen taken blijven staan met het label *Te laat*.
- Bij *Afronden* kies je direct een contacttype: de taak wordt dan omgezet in een gelogd
  contactmoment (en de klantstatus springt weer op groen). Alleen afronden kan ook.

### Overig
- InBody-historie met verschil t.o.v. de vorige meting, voedingsanalyses, doelen en actiepunten.
- Automatische controle met optionele waarschuwingsmail (zie hieronder).

## Datamodel

| Model | Velden (kern) |
| --- | --- |
| `User` (trainer) | id, name, email, role (`ADMIN`/`TRAINER`), passwordHash, active |
| `Client` | id, firstName, lastName, email, phone, lastContactDate, active (+ status berekend) |
| `ClientTrainer` | clientId, trainerId — many-to-many |
| `ContactMoment` (interactielog) | id, clientId, trainerId, type, date (datum+tijd), notes |
| `ScheduledTask` | id, clientId, trainerId, dueDate, note, completed, completedAt, contactMomentId |

Alle tijden worden weergegeven en ingevoerd in de tijdzone `Europe/Amsterdam`, ongeacht de
tijdzone van de server.

## Techstack

- [Next.js](https://nextjs.org) (App Router, Server Actions) + TypeScript
- [Prisma ORM](https://www.prisma.io) met SQLite (via de `@libsql` driver adapter)
- Tailwind CSS

## Aan de slag

```bash
npm install                 # installeert ook de Prisma client (postinstall)
cp .env.example .env
npm run db:migrate          # database aanmaken / bijwerken
npm run db:seed             # optioneel: demodata (alleen als er nog geen accounts zijn)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Met demodata:** log in als `anna@ptstudio.nl` (beheerder), `mark@ptstudio.nl` of
  `sanne@ptstudio.nl`, wachtwoord `welkom123`.
- **Zonder demodata:** de loginpagina vraagt je het eerste beheerdersaccount aan te maken.
  Daarna voeg je via *Trainers* de andere trainers toe.

### Upgraden vanaf de vorige versie (gedeeld wachtwoord, 4-6 weken-interval)

`npm run db:migrate` zet bestaande data automatisch om: contacttype *Belafspraak* wordt
*Telefonisch*, *Persoonlijk gesprek* wordt *Overig*, en de laatste contactdatum per klant wordt
gevuld. Het instelbare contactinterval (4-6 weken) is vervangen door de vaste 7/14-dagenregel.
`APP_PASSWORD` is niet meer nodig. Bij de eerste keer openen maak je een beheerdersaccount
aan; bestaande klanten hebben dan nog geen trainer — koppel ze via *Alle klanten* →
klant → *Mijn klant maken* of *Bewerken*.

## Beveiliging

- Wachtwoorden worden gehasht met scrypt; sessies staan in de database (httpOnly-cookie,
  30 dagen geldig). Deactiveren van een trainer logt die direct uit.
- Alle pagina's en server actions controleren de sessie server-side.
- Alle trainers kunnen alle klanten inzien (nodig voor "Alle klanten" en overdracht);
  alleen beheerders kunnen trainer-accounts beheren.

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
npx prisma migrate dev --config prisma7.config.ts --name <omschrijving>
```
