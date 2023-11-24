import { PrismaClient } from '@prisma/client';

import {
  seedAdmins,
  seedCategories,
  seedModerators,
  seedPosts,
  seedUsers,
  seedVisits,
} from './seedData';
const prisma = new PrismaClient();

async function main() {
  seedCategories.forEach(async ({ name, slug, thumbnail }) => {
    await prisma.category.upsert({
      where: { slug: slug },
      update: {},
      create: {
        name: name,
        createdAt: new Date(),
        slug: slug,
        thumbnail: thumbnail,
      },
    });
  });

  await prisma.user.deleteMany({});

  await prisma.$transaction(
    [...seedUsers, ...seedAdmins, ...seedModerators].map(
      (
        {
          email,
          username,
          name,
          role,
          avatarUrl,
          password,
          isVerified,
          verifiedAt,
        },
        index,
      ) => {
        return prisma.user.upsert({
          where: { id: index + 1 },
          update: {},
          create: {
            id: index + 1,
            email,
            username,
            name,
            role,
            avatarUrl,
            password,
            isVerified,
            verifiedAt,
          },
        });
      },
    ),
  );

  await prisma.$transaction([
    prisma.post.deleteMany({}),
    ...seedPosts.map(
      (
        { title, body, userId, secondaryText, status, createdAt, categoryId },
        index,
      ) =>
        prisma.post.create({
          data: {
            id: index + 1,
            title,
            body,
            secondaryText,
            userId,
            status,
            createdAt,
            categoryId,
          },
        }),
    ),
  ]);

  await prisma.$transaction([
    ...seedVisits.map(({ postId, userId, percentage, IP }, index) =>
      prisma.visit.create({
        data: {
          id: index + 1,
          postId,
          userId,
          IP,
          percentage,
          visitAt: new Date(),
        },
      }),
    ),
  ]);
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
