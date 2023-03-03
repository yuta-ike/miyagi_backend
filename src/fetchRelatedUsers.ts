import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
    postedTags: {
      tag: string;
      count: number;
    }[];
  }[] = [];

  for (const user of usersWithTags) {
    const tagCount: Record<string, number> = {};

    for (const { tag } of user.dairies.flat()) {
      for (const { id } of tag) {
        tagCount[id] = (tagCount[id] || 0) + 1;
      }
    }

    const postedTags = Object.entries(tagCount).map(([id, count]) => ({
      tag: id,
      count,
    }));

    userTags.push({
      userId: user.id,
      postedTags,
    });
  }

  return userTags;
};
