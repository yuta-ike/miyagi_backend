import { prisma } from "./lib/prisma";

export const fetchRelatedUsers = async (userId: string) => {
  const recentDiary = await prisma.dairy.findFirst({
    where: {
      user_id: userId,
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
    return null;
  }

  const usersWithTags = await prisma.parent.findMany({
    include: {
      dairies: {
        select: {
          tag: {
            select: {
              id: true,
            },
          },
        },
        where: {
          tag: {
            some: {
              id: {
                in: tags,
              },
            },
          },
        },
      },
    },
    take: 10,
  });

  usersWithTags.sort(
    ({ dairies: diariesA }, { dairies: diariesB }) =>
      diariesB.length - diariesA.length
  );

  const userTags: {
    userId: string;
    nickname: string;
    iconId: number;
    ageDecades: number;
    postedTags: {
      tag: string;
      count: number;
    }[];
  }[] = [];

  for (const user of usersWithTags) {
    // 自分は除外
    if (user.id === userId) {
      continue;
    }
    const tagCount: Record<string, number> = {};

    let totalTagCount = 0;

    for (const { tag } of user.dairies.flat()) {
      for (const { id } of tag) {
        tagCount[id] = (tagCount[id] || 0) + 1;
        totalTagCount += 1;
      }
    }

    // タグが一つも存在しないユーザーは弾く
    if (totalTagCount < 1) {
      continue;
    }

    const postedTags = Object.entries(tagCount).map(([id, count]) => ({
      tag: id,
      count,
    }));

    userTags.push({
      userId: user.id,
      iconId: user.icon_id,
      nickname: user.nickname,
      // TODO: set
      ageDecades: 3,
      postedTags,
    });
  }

  return { users: userTags, tags };
};
