/**
 * Vult een lege database met demodata: drie trainers, klanten in alle
 * statussen, contactmomenten, InBody-metingen en geplande taken.
 *
 *   npm run db:seed
 *
 * Draait alleen als er nog geen accounts bestaan, zodat echte data nooit
 * wordt overschreven.
 */
import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient, type ContactType } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

const DEMO_PASSWORD = "welkom123";
const DAY = 24 * 60 * 60 * 1000;

function hash(password: string) {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function daysAgo(days: number, hour = 10) {
  const d = new Date(Date.now() - days * DAY);
  d.setUTCHours(hour - 2, 0, 0, 0);
  return d;
}

function dueInDays(days: number) {
  const d = new Date(Date.now() + days * DAY);
  return new Date(`${d.toISOString().slice(0, 10)}T00:00:00Z`);
}

async function main() {
  if ((await prisma.user.count()) > 0) {
    console.log("Er bestaan al accounts; seed overgeslagen.");
    return;
  }

  const [anna, mark, sanne] = await Promise.all([
    prisma.user.create({
      data: { name: "Anna de Vries", email: "anna@ptstudio.nl", role: "ADMIN", passwordHash: hash(DEMO_PASSWORD) },
    }),
    prisma.user.create({
      data: { name: "Mark Jansen", email: "mark@ptstudio.nl", role: "TRAINER", passwordHash: hash(DEMO_PASSWORD) },
    }),
    prisma.user.create({
      data: { name: "Sanne Bakker", email: "sanne@ptstudio.nl", role: "TRAINER", passwordHash: hash(DEMO_PASSWORD) },
    }),
  ]);

  type Seed = {
    first: string;
    last: string;
    trainers: string[];
    contacts: [daysAgo: number, type: ContactType, trainer: string, notes: string][];
  };

  const clients: Seed[] = [
    {
      first: "Lisa",
      last: "Visser",
      trainers: [anna.id],
      contacts: [
        [2, "WHATSAPP", anna.id, "Gevraagd hoe de eerste week voedingsschema ging. Gaat goed, wel moeite met ontbijt."],
        [9, "INBODY", anna.id, "Startmeting gedaan."],
      ],
    },
    {
      first: "Tom",
      last: "de Boer",
      trainers: [anna.id, mark.id],
      contacts: [[10, "TELEFONISCH", mark.id, "Knieklachten besproken, oefeningen aangepast."]],
    },
    {
      first: "Fatima",
      last: "El Amrani",
      trainers: [mark.id],
      contacts: [
        [20, "PT_SESSIE", mark.id, "Squat-techniek verbeterd."],
        [35, "INBODY", mark.id, "Nameting: 1,2 kg spiermassa erbij."],
      ],
    },
    {
      first: "Pieter",
      last: "Smit",
      trainers: [anna.id],
      contacts: [[0, "PT_SESSIE", anna.id, "Goede sessie, nieuw PR op deadlift."]],
    },
    { first: "Eva", last: "Mulder", trainers: [sanne.id], contacts: [] },
    {
      first: "Jeroen",
      last: "Hendriks",
      trainers: [sanne.id, anna.id],
      contacts: [[13, "EMAIL", sanne.id, "Weekmenu gestuurd."]],
    },
    {
      first: "Noor",
      last: "Dekker",
      trainers: [mark.id, sanne.id],
      contacts: [[4, "WHATSAPP", sanne.id, "Herinnering waterinname gestuurd 💧"]],
    },
    {
      first: "Daan",
      last: "Peters",
      trainers: [anna.id],
      contacts: [[16, "OVERIG", anna.id, "Kort gesproken bij de balie."]],
    },
  ];

  const created: Record<string, string> = {};
  for (const c of clients) {
    const client = await prisma.client.create({
      data: {
        firstName: c.first,
        lastName: c.last,
        email: `${c.first.toLowerCase()}@voorbeeld.nl`,
        phone: `06${String(Math.floor(10000000 + Math.random() * 89999999))}`,
        ptSessionsPerWeek: 2,
        ptSessionMinutes: 60,
        startDate: daysAgo(90),
        trainers: { create: c.trainers.map((trainerId) => ({ trainerId })) },
        contactMoments: {
          create: c.contacts.map(([d, type, trainerId, notes]) => ({ type, trainerId, notes, date: daysAgo(d) })),
        },
      },
    });
    const dates = c.contacts.map(([d]) => daysAgo(d));
    await prisma.client.update({
      where: { id: client.id },
      data: { lastContactDate: dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null },
    });
    created[c.first] = client.id;
  }

  await prisma.inBodyMeasurement.createMany({
    data: [
      { clientId: created.Fatima, date: daysAgo(95), weightKg: 68.4, skeletalMuscleMassKg: 26.1, bodyFatPercent: 29.8 },
      { clientId: created.Fatima, date: daysAgo(35), weightKg: 67.1, skeletalMuscleMassKg: 27.3, bodyFatPercent: 27.2 },
      { clientId: created.Lisa, date: daysAgo(9), weightKg: 74.0, skeletalMuscleMassKg: 28.0, bodyFatPercent: 31.5 },
    ],
  });

  await prisma.scheduledTask.createMany({
    data: [
      { clientId: created.Lisa, trainerId: anna.id, dueDate: dueInDays(0), note: "Checken hoe de spierpijn is na de eerste beentraining" },
      { clientId: created.Daan, trainerId: anna.id, dueDate: dueInDays(-2), note: "Bellen: motivatie bespreken, al 2 weken weinig contact" },
      { clientId: created.Fatima, trainerId: mark.id, dueDate: dueInDays(0), note: "InBody nameting inplannen" },
      { clientId: created.Tom, trainerId: anna.id, dueDate: dueInDays(3), note: "Vragen hoe de knie reageert op de aangepaste oefeningen" },
      { clientId: created.Eva, trainerId: sanne.id, dueDate: dueInDays(0), note: "Kennismakingsappje sturen" },
      { clientId: created.Lisa, trainerId: anna.id, dueDate: dueInDays(21), note: "InBody nameting (4 weken na start)" },
    ],
  });

  console.log("Demodata aangemaakt. Log in met bijv.:");
  console.log(`  anna@ptstudio.nl / ${DEMO_PASSWORD}  (beheerder)`);
  console.log(`  mark@ptstudio.nl / ${DEMO_PASSWORD}`);
  console.log(`  sanne@ptstudio.nl / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
