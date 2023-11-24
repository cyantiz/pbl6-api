import { PrismaClient } from '@prisma/client';

import {
  seedAdmins,
  seedCategories,
  seedModerators,
  seedPosts,
  seedUsers,
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

  await prisma.$transaction(
    [...seedUsers, ...seedAdmins, ...seedModerators].map(
      ({
        email,
        username,
        name,
        role,
        avatarUrl,
        password,
        isVerified,
        verifiedAt,
      }) => {
        return prisma.user.upsert({
          where: { username },
          update: {},
          create: {
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
    ...seedPosts.map(({ title, body, userId, status, createdAt, categoryId }) =>
      prisma.post.create({
        data: {
          title,
          body,
          userId,
          status,
          createdAt,
          categoryId,
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
