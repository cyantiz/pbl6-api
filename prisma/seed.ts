import { PrismaClient } from '@prisma/client';

import { getSlug } from '../src/helpers/string';

import {
  seedAdmins,
  seedCategories,
  seedEditors,
  seedMedias,
  seedModerators,
  seedPosts,
  seedUsers,
  seedVisits,
} from './seedData';
const prisma = new PrismaClient();

async function main() {
  console.log('SEED - START');

  console.log('SEED - Delete all category and user');
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('SEED -Seed category');
  await prisma.$transaction([
    ...seedCategories.map(({ name, thumbnail, slug }) =>
      prisma.category.upsert({
        where: { slug: slug },
        update: {},
        create: {
          slug,
          name,
          thumbnail,
          createdAt: new Date(),
        },
      }),
    ),
  ]);

  console.log('SEED - Seed accounts');
  await prisma.$transaction(
    [...seedUsers, ...seedAdmins, ...seedModerators, ...seedEditors].map(
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

  console.log('SEED - Seed media');
  await prisma.$transaction([
    ...seedMedias.map(({ createdAt, fileName }, index) =>
      prisma.media.upsert({
        where: { id: index + 1 },
        update: {},
        create: {
          fileName,
          createdAt,
        },
      }),
    ),
  ]);

  console.log('SEED - Seed posts');
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
            thumbnailMediaId: 1,
            title,
            slug: getSlug(title, '-'),
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

  console.log('SEED - Seed visits');
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

  console.log('Done seeding');
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
