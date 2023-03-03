import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

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
  const { name, address, birthday, iconId, nickname } = req.body;
  const subscriptionId = req.headers.authorization as string;
  await prisma.parent.upsert({
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
        connectOrCreate: {
          create: {
            id: tags[0],
          },
          where: {
            id: tags[0],
          },
        },
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
  const yesterday = new Date();
  today.setHours(0);  //0時
  today.setMinutes(0);//0分
  today.setSeconds(0);//0秒
  yesterday.setHours(0);
  yesterday.setMinutes(0);
  yesterday.setSeconds(0);
  yesterday.setDate(yesterday.getDate() - 1);
  const data = new Array();
  for (let i = 0; i < 30; i++) {//30日分まで遡って取得
    const dairy = await prisma.dairy.findFirst({
      where: {
        user_id: req.headers.authorization as string,
        created_at: {
          gte: yesterday,
          lt: today,
        },
      },
      orderBy:{created_at:"desc"},//最新の投稿からEmotionを取得
      select: { emotion: true },
    })
    const formatted_date = today.getFullYear() + "-" +("0" + today.getMonth()+1).slice(-2) + "-" +("0" + today.getDate()).slice(-2)
    data.push(
      {
        "date": formatted_date,
        "emotion": dairy?.emotion,
        "event": "誕生日"
      })
      today.setDate(today.getDate() - 1);
      yesterday.setDate(yesterday.getDate() - 1);
  }
  res.json(data);
});

app.get("/user-recommend", async (req, res) => {
  res.json({
    tags: ["string"],
    users: [
      {
        nickname: "string",
        ageDecades: 0,
        postedTags: [
          {
            tag: "string",
            count: 0,
          },
        ],
        matchingId: "string",
      },
    ],
  });
});

app.get("/bot/home", async (req, res) => {
  res.json({
    botResponse: {
      type: "NOT_POSTED",
      comment: "string",
      link: "http://example.com",
    },
  });
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
