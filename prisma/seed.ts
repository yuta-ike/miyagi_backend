import { PrismaClient } from "@prisma/client";
import { equal } from "assert";
const prisma = new PrismaClient();
async function main() {
  for (let i = 0; i < 5; i++) {
    await prisma.icon.upsert({
      where: {
        id: i,
      },
      create: {
        id: i,
        image_url: `/emote_${i}.png`,
      },
      update: {
        image_url: `/emote_${i}.png`,
      },
    });
  }

  await prisma.botResponse.upsert({
    where: {
      type: "NOT_POSTED",
    },
    create: {
      type: "NOT_POSTED",
      comment: "日記を投稿してね！",
      pattern: 0,
      link: "https://example.com",
    },
    update: {
      comment: "日記を投稿してね！",
      pattern: 0,
      link: "https://example.com",
    },
  });

  await prisma.botResponse.upsert({
    where: {
      type: "USER_RECOMMENDATION",
    },
    create: {
      type: "USER_RECOMMENDATION",
      comment: "ユーザーに相談しませんか?",
      link: "https://example.com",
    },
    update: {
      comment: "ユーザーに相談しませんか?",
      link: "https://example.com",
    },
  });

  await prisma.botResponse.upsert({
    where: {
      type: "ADMINISTRATIVE_SUPPORT_RECOMMENDATION",
    },
    create: {
      type: "ADMINISTRATIVE_SUPPORT_RECOMMENDATION",
      comment: "行政の支援がありますよ！",
      link: "https://example.com",
    },
    update: {
      comment: "行政の支援がありますよ！",
      link: "https://example.com",
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
