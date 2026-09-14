import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

interface FaqCategory {
  name: string;
  items: { question: string; answer: string }[];
}

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!email || !passwordHash) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD_HASH not set — skipping admin user seed.");
    return;
  }
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
  console.log(`Admin user ready: ${email}`);
}

/** Seeds FaqItem's "az" rows from messages/az.json — the same content already live on the public /faq page, now editable from the admin panel. */
async function seedFaqItems() {
  const existing = await prisma.faqItem.count({ where: { locale: "az" } });
  if (existing > 0) {
    console.log(`FaqItem already has ${existing} "az" rows — skipping.`);
    return;
  }

  const messagesPath = join(process.cwd(), "messages", "az.json");
  const messages = JSON.parse(readFileSync(messagesPath, "utf8"));
  const categories = messages.FaqPage?.categories as FaqCategory[] | undefined;
  if (!categories) {
    console.log("messages/az.json has no FaqPage.categories — skipping FaqItem seed.");
    return;
  }

  let order = 0;
  for (const category of categories) {
    for (const item of category.items) {
      await prisma.faqItem.create({
        data: {
          locale: "az",
          category: category.name,
          question: item.question,
          answer: item.answer,
          order: order++,
          isActive: true,
        },
      });
    }
  }
  console.log(`Seeded ${order} FaqItem rows ("az").`);
}

async function seedSiteContent() {
  const existing = await prisma.siteContent.count({ where: { locale: "az" } });
  if (existing > 0) {
    console.log(`SiteContent already has ${existing} "az" rows — skipping.`);
    return;
  }

  const messagesPath = join(process.cwd(), "messages", "az.json");
  const messages = JSON.parse(readFileSync(messagesPath, "utf8"));
  const hero = messages.Hero ?? {};

  const defaults: { key: string; value: string }[] = [
    { key: "hero_eyebrow", value: hero.eyebrow ?? "" },
    { key: "hero_title", value: hero.title ?? "" },
    { key: "hero_subtitle", value: hero.subtitle ?? "" },
    { key: "hero_cta", value: hero.cta ?? "" },
  ];

  for (const { key, value } of defaults) {
    if (!value) continue;
    await prisma.siteContent.create({ data: { key, locale: "az", value, type: "TEXT" } });
  }
  console.log(`Seeded ${defaults.length} SiteContent rows ("az").`);
}

async function main() {
  await seedAdminUser();
  await seedFaqItems();
  await seedSiteContent();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
