import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { fetchRelatedUsers } from "./fetchRelatedUsers";
import { fetchRelatedWords } from "./fetchRelatedWords";

const prisma = new PrismaClient();
const app = express();

app.use(cors());

const port = process.env.PORT ?? 8000;

app.use(express.json());

app.get("/health", (req, res) => {
  console.log("Health Check");
  res.json({ result: "ok" });
});

app.post("/sign_up", async (req, res) => {
  const {
    name,
    address,
    birthday,
    child_name,
    child_birth,
    iconId,
    nickname,
  } = req.body;
  const subscriptionId = req.headers.authorization as string;

  await prisma.parent.upsert({//直した！
    where: {
      id: subscriptionId,
    },
    create: {
      id: subscriptionId,
      nickname,
      name,
      birthday,
      address,
      icon_id: iconId,
    },
    update: {
      nickname,
      name,
      birthday,
      address,
      icon_id: iconId,
    },
  });

  if (child_name && child_birth) {
    const date = new Date(
      parseInt(child_birth.slice(0, 4), 10),
      parseInt(child_birth.slice(5, 7), 10) - 1,
      parseInt(child_birth.slice(8, 10), 10)
    ); //表示する日付はこっち
    await prisma.chaildInfo.create({
      data: {
        parent_id: subscriptionId,
        name: child_name,
        barthday: date,
      },
    });
  }

  res.json({
    result: "ok",
  });
});
app.get("/auth-state", async (req, res) => {
  const subscriptionId = req.headers.authorization as string;
  const parent = await prisma.parent.findUnique({
    where: {
      id: subscriptionId,
    },
  });

  res.send({
    authed: parent != null,
  });
});

app.post(`/diary`, async (req, res) => {
  const { tags, body, emotion } = req.body;

  const result = await prisma.dairy.create({
    data: {
      tag: {
        connectOrCreate: tags.map((tag: string) => ({
          create: {
            id: tag,
          },
          where: {
            id: tag,
          },
        })),
      },
      body,
      emotion,
      user_id: req.headers.authorization as string,
      bot_response_type: "NOT_POSTED",
    },
  });
  res.json(result);
});

app.get("/diary/:date", async (req, res) => {
  const { date } = req.params;
  const target = new Date(
    parseInt(date.slice(0, 4), 10),
    parseInt(date.slice(5, 7), 10) - 1,
    parseInt(date.slice(8, 10), 10)
  ); //表示する日付はこっち
  const target2 = new Date(
    parseInt(date.slice(0, 4), 10),
    parseInt(date.slice(5, 7), 10) - 1,
    parseInt(date.slice(8, 10), 10) + 1
  );
  const dairys = await prisma.dairy.findMany({
    where: {
      user_id: req.headers.authorization as string,
      created_at: {
        gte: target,
        lt: target2,
      },
    },
  });

  res.json(dairys);
});

app.get(`/calendar`, async (req, res) => {
  const today = new Date();
  const tomorrow = new Date();
  today.setHours(0); //0時
  today.setMinutes(0); //0分
  today.setSeconds(0); //0秒
  tomorrow.setHours(0);
  tomorrow.setMinutes(0);
  tomorrow.setSeconds(0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const data = new Array();
  for (let i = 0; i < 30; i++) {
    //30日分まで遡って取得
    const dairy = await prisma.dairy.findFirst({
      where: {
        user_id: req.headers.authorization as string,
        created_at: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { created_at: "desc" }, //最新の投稿からEmotionを取得
      select: { emotion: true },
    });
    const formatted_date =
      today.getFullYear() +
      "-" +
      ("0" + (today.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + today.getDate()).slice(-2);
    const child_info = await prisma.chaildInfo.findFirst({
      where: { parent_id: req.headers.authorization as string },
      select: { barthday: true },
    });
    const flg = (child_info?.barthday.getDate() == today.getDate());
    data.push({
      date: formatted_date,
      emotion: dairy?.emotion,
      event: flg ? "誕生日" : undefined,
    });
    today.setDate(today.getDate() - 1);
    tomorrow.setDate(tomorrow.getDate() - 1);
  }
  console;
  res.json(data);
});

app.post("/suggest-tags", async (req, res) => {
  const userId = req.headers.authorization as string;
  // 本文からの抜き出し
  const sentence = req.body.sentence;

  const relatedWords = await fetchRelatedWords(sentence);

  const entries = Object.entries(relatedWords);
  entries.sort((a: any, b: any) => b[1] - a[1]);
  const retrievedTags = entries.map(([word]) => word);

  if (20 <= retrievedTags.length) {
    return res.json(retrievedTags.slice(0, 20));
  }

  // 該当ユーザーが多く利用するタグ
  const result2 = await prisma.tag.findMany({
    where: {
      dairy: {
        some: {
          user_id: userId,
        },
      },
    },
    orderBy: {
      dairy: {
        _count: "desc",
      },
    },
  });
  const mostUsedTags = result2.map((tag) => tag.id);

  if (20 <= retrievedTags.length + mostUsedTags.length) {
    return res.json([...retrievedTags, ...mostUsedTags].slice(0, 20));
  }

  // 全ユーザーが多く利用するタグ
  const result3 = await prisma.tag.findMany({
    select: {
      id: true,
    },
    orderBy: {
      dairy: {
        _count: "desc", // 記事数が多い順に並び替え
      },
    },
    distinct: ["id"], // タグ名が重複しないようにする
  });

  const popularTags = result3.map(({ id }) => id);

  if (20 <= retrievedTags.length + mostUsedTags.length + popularTags.length) {
    return res.json(
      [...retrievedTags, ...mostUsedTags, ...popularTags].slice(0, 20)
    );
  }
});

// app.post("/add-mock", async (req, res) => {
//   const subscriptionId = req.headers.authorization as string;
//   for (let i = 0; i < 100; i++) {
//     await prisma.dairy.create({
//       data: {
//         tag: {
//           connectOrCreate: {
//             create: {
//               id: "tag" + 1,
//             },
//             where: {
//               id: "tag" + 1,
//             },
//           },
//         },
//         body: "body" + i,
//         emotion: 1,
//         user_id: subscriptionId,
//         bot_response_type: "NOT_POSTED",
//       },
//     });
//   }
//   res.send({ res: "ok" });
// });

app.get("/user-recommend", async (req, res) => {
  const subscriptionId = req.headers.authorization as string;

  const result = await fetchRelatedUsers(subscriptionId);

  res.json(result);
});

app.get("/bot/home", async (req, res) => {
  const subscriptionId = req.headers.authorization as string;

  const recentDiary = await prisma.dairy.findFirst({
    where: {
      user_id: subscriptionId,
    },
    take: 1,
    orderBy: {
      created_at: "desc",
    },
    select: {
      tag: true,
    },
  });

  const tags = recentDiary?.tag.map(({ id }) => id) ?? [];

  if (tags.length === 0) {
    return res.json({
      botResponse: null,
    });
  }

  const users = await fetchRelatedUsers(subscriptionId);

  res.json({ botResponse: users?.users ?? [] });
});

app.post("/chat", async (req, res) => {
  res.json({
    user: {
      nickname: "string",
    },
    tags: ["string"],
  });
});

const server = app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}`)
);
