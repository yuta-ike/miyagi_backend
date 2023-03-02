import express from "express";
import cors from "cors";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

app.use(cors());

const port = process.env.PORT ?? 3000;

app.use(express.json());
app.post(`/dairy`, async (req, res) => {

  const { tags, body, emotion } = req.body;
  const result = await prisma.dairy.create({
    data: {
      tag: tags,
      body,
      emotion,
      user_id: req.headers.authorization as string,
      bot_response_id: 1,
    },
  });
  res.json(result);
});


app.get("/dairy/:date", async (req, res) => {
  const { date } = req.params;
  const target = new Date(date)
  const dairys = await prisma.dairy.findMany({
      where: {
        user_id: req.headers.authorization as string,
        created_at: target,
      },
    });

  res.json(dairys);
});

// app.get(`/calendar`, async (req, res) => {
//   const data = await prisma.dairy.findMany({
//     where: { id: Number(id) },
//   });

//   res.json(data);
// });

app.get("/user-recommend", async (req, res) => {
  res.json({
    "tags": [
      "string"
    ],
    "users": [
      {
        "nickname": "string",
        "ageDecades": 0,
        "postedTags": [
          {
            "tag": "string",
            "count": 0
          }
        ],
        "matchingId": "string"
      }
    ]
  });
});

app.get("/bot/home", async (req, res) => {
  res.json({
    "botResponse": {
    "type": "NOT_POSTED",
    "comment": "string",
    "link": "http://example.com"
    }
    });
});

app.post("/chat", async (req, res) => {
  res.json({
    "user": {
      "nickname": "string"
    },
    "tags": [
      "string"
    ]
  });
});



const server = app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}`)
);
