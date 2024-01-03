import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { category, PostStatus, Role } from '@prisma/client';
import * as fs from 'fs';
import { map, uniq } from 'lodash';
import mongoose from 'mongoose';
import { defaultHashedPassword } from 'prisma/seedData';
import { getSlug } from 'src/helpers';
import { PrismaService } from 'src/modules/prisma/prisma.service';

interface MArticle {
  title: string;
  sport_type: string;
  author: string;
  article: string | string[];
  image_0_url: string;
  image_0_alt: string;
  image_1_url: string;
  image_1_alt: string;
  image_2_url: string;
  image_2_alt: string;
  image_3_url: string;
  image_3_alt: string;
  image_4_url: string;
  image_4_alt: string;
  image_5_url: string;
  image_5_alt: string;
  image_6_url: string;
  image_6_alt: string;
  image_7_url: string;
  image_7_alt: string;
  image_8_url: string;
  image_8_alt: string;
  image_9_url: string;
  image_9_alt: string;
}
const MArticleSchema = new mongoose.Schema({
  title: String,
  sport_type: String,
  author: String,
  article: String,
  image_0_url: String,
  image_0_alt: String,
  image_1_url: String,
  image_1_alt: String,
  image_2_url: String,
  image_2_alt: String,
  image_3_url: String,
  image_3_alt: String,
  image_4_url: String,
  image_4_alt: String,
  image_5_url: String,
  image_5_alt: String,
  image_6_url: String,
  image_6_alt: String,
  image_7_url: String,
  image_7_alt: String,
  image_8_url: String,
  image_8_alt: String,
  image_9_url: String,
  image_9_alt: String,
});

const DanTriArticleModel = mongoose.model<MArticle>(
  'dantri',
  MArticleSchema,
  'dantri',
);
const VNExpressArticleModel = mongoose.model<MArticle>(
  'vnexpress',
  MArticleSchema,
  'vnexpress',
);

@Injectable()
export class ChoreService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // this.importMissingPosts();
  }

  private async connectToMongo() {
    console.log(
      `--- Connecting to ${this.configService.get('mongodb.article')}`,
    );

    await mongoose
      .connect(this.configService.get('mongodb.article'), {
        dbName: 'articles',
      })
      .then(() => {
        console.log('connected to mongodb');
      })
      .catch((err) => {
        console.log('Connect mongodb err:', err);
      });
  }

  private async importMissingPosts() {
    const randomAuthor = await this.prismaService.user.findFirst({
      where: {
        id: 279,
      },
    });

    const missingOidJson = fs.readFileSync(
      '/Users/hoangnhan1203/Downloads/missing_oid.json',
    );

    const missingOidStr = JSON.parse(missingOidJson.toString()) as string[];
    const missingOid = missingOidStr.map(
      (it) => new mongoose.Types.ObjectId(it),
    );
    await this.connectToMongo();

    // const dantriarticles = await DanTriArticleModel.find({
    //   _id: {
    //     $in: missingOid,
    //   },
    // });
    const dantriarticles = [];
    const vnexpressarticles = await VNExpressArticleModel.find({
      _id: {
        $in: missingOid,
      },
    });
    const articles = [...dantriarticles, ...vnexpressarticles];

    console.log(dantriarticles.length);
    console.log(vnexpressarticles.length);
    const categories = await this.prismaService.category.findMany({});
    const categoriesRecord: Record<string, category> = categories.reduce(
      (acc, category) => {
        acc[category.slug] = category;
        return acc;
      },
      {},
    );

    for (const article of articles) {
      console.log(article._id.toString());
      const postSlug = getSlug(article.title, '-');
      if (article._id.toString() === `6553924a92652daebb2d3194`) {
        console.log('123');
        article.article = [
          '"Tôi không biết làm điều đó bằng cách nào. Tôi có thể không bao giờ ngăn được Messi. Chúng tôi từng nhiều lần đối đầu ở các trận Siêu kinh điển. Khi ấy, Casemiro luôn là vũ khí tốt để vô hiệu hóa Messi, nhưng không phải lúc nào cũng thành công. Bạn cần tôn trọng Messi vì anh ấy là một trong những cầu thủ giỏi nhất thế giới", tờ Marca (Tây Ban Nha) dẫn lời Valverde.',
          'Uruguay sẽ làm khách của Argentina vào sáng thứ Sáu, 17/11 theo giờ Hà Nội. Trận đấu mang ý nghĩa quan trọng với cục diện vòng loại World Cup 2026 khu vực Nam Mỹ. Argentina đang dẫn đầu sau bốn trận toàn thắng, trong khi Uruguay đã vươn lên thứ hai nhờ chiến thắng Brazil 2-0 ở lượt trước.',
          'Valverde và Messi từng nhiều lần đối đầu ở cấp CLB. Trong khi Valverde khoác áo Real, Messi chơi cho Barca rồi PSG. Hè năm nay, Messi đầu quân cho Inter Miami. Tuy đã 36 tuổi, anh vẫn thể hiện đẳng cấp, góp phần quan trọng đưa Argentina vô địch World Cup 2022 rồi giành Quả Bóng Vàng thứ tám trong sự nghiệp.',
          '"Chúng tôi hiểu Argentina là đội bóng thế nào và đẳng cấp của Messi ra sao, dựa trên mọi thứ họ từng đạt được. Chúng tôi cần tôn trọng họ và cũng cần bảo vệ danh dự của mình", Valverde nhận định.',
          'Lần tập trung này, Uruguay chào đón tiền đạo kỳ cựu Luis Suarez trở lại đội hình. Dù chia tay bóng đá châu Âu từ năm ngoái, Suarez vẫn thi đấu ấn tượng trong màu áo Nacional rồi Gremio. Hôm 9/11, anh ghi hat-trick trong 19 phút, giúp Gremio đánh bại Botafogo 4-3 ở giải vô địch Brazil.',
          '"Hồi tôi mới lên tuyển, Suarez luôn hỗ trợ, giới thiệu giá trị, nguyên tắc và những yếu tố cần thiết để thành công, không chỉ ở đội tuyển mà trong bóng đá nói chung. Tôi rất vui vì anh ấy tập trung trở lại cùng đội và tham gia vào phòng thay đồ. Suarez là ngôi sao với các cầu thủ khác và là thần tượng ở Uruguay", Valverde nói.',
          'Valverde trưởng thành từ lò đào tạo trẻ của Penarol và được đôn lên đội một năm 2015. Một năm sau, Valverde gia nhập Real, lần lượt thi đấu cho đội dự bị Castilla và khoác áo Deportivo theo diện cho mượn trong hai mùa tiếp theo. Từ năm 2018, anh trở lại Real và dần chiếm chỗ đứng trong đội một. Dấu ấn lớn nhất của tiền vệ người Uruguay là pha kiến tạo để Vinicius ghi bàn duy nhất giúp Real thắng Liverpool ở chung kết Champions League năm 2022.',
        ];
      }
      const postImages = [
        { url: article?.image_0_url, alt: article?.image_0_alt },
        { url: article?.image_1_url, alt: article?.image_1_alt },
        { url: article?.image_2_url, alt: article?.image_2_alt },
        { url: article?.image_3_url, alt: article?.image_3_alt },
        { url: article?.image_4_url, alt: article?.image_4_alt },
        { url: article?.image_5_url, alt: article?.image_5_alt },
        { url: article?.image_6_url, alt: article?.image_6_alt },
        { url: article?.image_7_url, alt: article?.image_7_alt },
        { url: article?.image_8_url, alt: article?.image_8_alt },
        { url: article?.image_9_url, alt: article?.image_9_alt },
      ].filter((it) => it.url);

      console.log('article author', article.author);
      console.log('article author slug', getSlug(article.author));

      const post = await this.prismaService.post.upsert({
        where: {
          slug: postSlug,
        },
        create: {
          title: article.title,
          slug: postSlug,
          body: Array.isArray(article.article)
            ? article.article.join('\n')
            : article.article,
          // userId: randomAuthor.id,
          author: {
            connect: {
              id: randomAuthor.id,
            },
          },
          category: {
            connect: {
              id: categoriesRecord[article.sport_type].id,
            },
          },
          // categoryId: categoriesRecord[article.sport_type].id ?? 1,
          mongoOid: article._id.toString(),
          status: PostStatus.PUBLISHED,
        },
        update: {},
      });

      const images = await this.prismaService.$transaction(
        postImages.map((image) => {
          return this.prismaService.media.create({
            data: {
              externalUrl: image.url,
              alt: image.alt,
            },
          });
        }),
      );

      await this.prismaService.$transaction(
        images.map((image) => {
          return this.prismaService.post_media.create({
            data: {
              postId: post.id,
              mediaId: image.id,
            },
          });
        }),
      );
    }

    //   for (const article of articles) {
    //     const postSlug = getSlug(article.title, '-');
    //     const postImages = [
    //       { url: article?.image_0_url, alt: article?.image_0_alt },
    //       { url: article?.image_1_url, alt: article?.image_1_alt },
    //       { url: article?.image_2_url, alt: article?.image_2_alt },
    //       { url: article?.image_3_url, alt: article?.image_3_alt },
    //       { url: article?.image_4_url, alt: article?.image_4_alt },
    //       { url: article?.image_5_url, alt: article?.image_5_alt },
    //       { url: article?.image_6_url, alt: article?.image_6_alt },
    //       { url: article?.image_7_url, alt: article?.image_7_alt },
    //       { url: article?.image_8_url, alt: article?.image_8_alt },
    //       { url: article?.image_9_url, alt: article?.image_9_alt },
    //     ].filter((it) => it.url);

    //     console.log('article oid', article._id.toString());
    //     console.log('article author', article.author);
    //     console.log('article author slug', getSlug(article.author));
    //   }
  }

  async getFromDanTri() {
    await this.connectToMongo();
    console.log('--- Fetching articles from Mongodb');

    const articles = await DanTriArticleModel.find({
      sport_type: {
        $not: {
          $in: ['other', 'education'],
        },
      },
    });

    console.log(`--- Fetched ${articles.length} articles from mongodb`);

    const _authors = uniq(map(articles, (article) => getSlug(article.author)));
    const _authorsName = uniq(map(articles, 'author'));
    const _sportTypes = uniq(map(articles, 'sport_type'));

    // Create authors and categories
    await this.prismaService.$transaction(
      _authors.map((author, index) => {
        const nameSlug = getSlug(author);
        const email = 'dantri' + nameSlug + '@sportivefy.com';
        const username = 'dantri_' + nameSlug;
        const name = _authorsName[index];
        return this.prismaService.user.upsert({
          where: {
            username,
          },
          update: {
            name: author,
          },
          create: {
            username: username,
            email: email,
            password: defaultHashedPassword,
            name: name,
            role: Role.USER,
            isVerified: true,
            verifiedAt: new Date(),
            avatarUrl:
              'https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGxhbnQlMjBtaW5pbWFsfGVufDB8fDB8fHww',
          },
        });
      }),
    );
    await this.prismaService.$transaction(
      _sportTypes.map((sportType) => {
        return this.prismaService.category.upsert({
          where: {
            slug: sportType,
          },
          update: {},
          create: {
            name: sportType,
            slug: sportType,
            thumbnail: 'update-later',
          },
        });
      }),
    );

    const authors = await this.prismaService.user.findMany({});
    const categories = await this.prismaService.category.findMany({});

    const authorsRecord: Record<string, any> = authors.reduce((acc, author) => {
      acc[author.name] = author;
      return acc;
    }, {});
    const categoriesRecord: Record<string, category> = categories.reduce(
      (acc, category) => {
        acc[category.slug] = category;
        return acc;
      },
      {},
    );

    let index = 1;
    const biggestExistingPostId = await this.prismaService.post
      .findFirst({
        orderBy: {
          id: 'desc',
        },
      })
      .then((post) => post.id);
    for (const article of articles) {
      console.log(`--- Create posts: ${index++}/${articles.length}`);

      const postSlug = getSlug(article.title, '-');
      const postImages = [
        { url: article.image_0_url, alt: article.image_0_alt },
        { url: article.image_1_url, alt: article.image_1_alt },
        { url: article.image_2_url, alt: article.image_2_alt },
        { url: article.image_3_url, alt: article.image_3_alt },
        { url: article.image_4_url, alt: article.image_4_alt },
        { url: article.image_5_url, alt: article.image_5_alt },
        { url: article.image_6_url, alt: article.image_6_alt },
        { url: article.image_7_url, alt: article.image_7_alt },
        { url: article.image_8_url, alt: article.image_8_alt },
        { url: article.image_9_url, alt: article.image_9_alt },
      ].filter((it) => it.url);

      console.log('article author', article.author);
      console.log('article author slug', getSlug(article.author));
      const post = await this.prismaService.post.upsert({
        where: {
          slug: postSlug,
        },
        create: {
          title: article.title,
          slug: postSlug,
          body: Array.isArray(article.article)
            ? article.article.join('\n')
            : article.article,
          userId: authorsRecord[getSlug(article.author)].id ?? 1,
          categoryId: categoriesRecord[article.sport_type].id ?? 1,
          mongoOid: article._id.toString(),
          status: PostStatus.PUBLISHED,
        },
        update: {},
      });

      if (post.id < biggestExistingPostId) {
        continue;
      }

      const images = await this.prismaService.$transaction(
        postImages.map((image) => {
          return this.prismaService.media.create({
            data: {
              externalUrl: image.url,
              alt: image.alt,
            },
          });
        }),
      );

      await this.prismaService.$transaction(
        images.map((image) => {
          return this.prismaService.post_media.create({
            data: {
              postId: post.id,
              mediaId: image.id,
            },
          });
        }),
      );

      console.log('created post', post.mongoOid);
    }

    return;
  }

  async getFromVNExpress() {
    await this.connectToMongo();
    console.log('--- Fetching articles from Mongodb');

    const articles = await VNExpressArticleModel.find({
      sport_type: {
        $not: {
          $in: ['other', 'education'],
        },
      },
    });

    console.log(`--- Fetched ${articles.length} articles from mongodb`);

    const _authors = uniq(
      map(
        articles.filter((it) => it.author),
        (article) => getSlug(article.author).slice(0, 30),
      ),
    );
    const _sportTypes = uniq(map(articles, 'sport_type'));

    // Create authors and categories
    await this.prismaService.$transaction(
      _authors.map((author) => {
        // name max length is 30
        const nameSlug = getSlug(author).slice(0, 30);
        const email = 'vnexpress_' + nameSlug + '@sportivefy.com';
        const username = 'vnexpress_' + nameSlug;

        return this.prismaService.user.upsert({
          where: {
            username,
          },
          update: {
            name: author,
          },
          create: {
            username: username,
            email: email,
            password: defaultHashedPassword,
            name: author,
            role: Role.USER,
            isVerified: true,
            verifiedAt: new Date(),
            avatarUrl:
              'https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGxhbnQlMjBtaW5pbWFsfGVufDB8fDB8fHww',
          },
        });
      }),
    );
    await this.prismaService.$transaction(
      _sportTypes.map((sportType) => {
        return this.prismaService.category.upsert({
          where: {
            slug: sportType,
          },
          update: {},
          create: {
            name: sportType,
            slug: sportType,
            thumbnail: 'update-later',
          },
        });
      }),
    );

    const authors = await this.prismaService.user.findMany({});
    const categories = await this.prismaService.category.findMany({});

    const authorsRecord: Record<string, any> = authors.reduce((acc, author) => {
      acc[author.name] = author;
      return acc;
    }, {});
    const categoriesRecord: Record<string, category> = categories.reduce(
      (acc, category) => {
        acc[category.slug] = category;
        return acc;
      },
      {},
    );

    console.log('categoryRecord', categoriesRecord);

    let index = 1;
    const biggestExistingPostId = await this.prismaService.post
      .findFirst({
        orderBy: {
          id: 'desc',
        },
      })
      .then((post) => post.id);
    for (const article of articles) {
      console.log(`--- Create posts: ${index++}/${articles.length}`);

      const postSlug = getSlug(article.title, '-');

      const postImages = [
        { url: article.image_0_url, alt: article.image_0_alt },
        { url: article.image_1_url, alt: article.image_1_alt },
        { url: article.image_2_url, alt: article.image_2_alt },
        { url: article.image_3_url, alt: article.image_3_alt },
        { url: article.image_4_url, alt: article.image_4_alt },
        { url: article.image_5_url, alt: article.image_5_alt },
        { url: article.image_6_url, alt: article.image_6_alt },
        { url: article.image_7_url, alt: article.image_7_alt },
        { url: article.image_8_url, alt: article.image_8_alt },
        { url: article.image_9_url, alt: article.image_9_alt },
      ].filter((it) => it.url);

      let authorUserId = 1;
      try {
        authorUserId = authorsRecord[getSlug(article.author)].id ?? 1;
      } catch (error) {}

      console.log('sport type', article.sport_type);
      console.log('sport type slug', getSlug(article.sport_type));
      console.log('categoryId', categoriesRecord[article.sport_type]);
      const post = await this.prismaService.post.upsert({
        where: {
          slug: postSlug,
        },
        create: {
          title: article.title,
          slug: postSlug,
          body: Array.isArray(article.article)
            ? article.article.join('\n')
            : article.article,
          userId: authorUserId,
          categoryId: categoriesRecord[article.sport_type].id ?? 1,
          mongoOid: article._id.toString(),
          status: PostStatus.PUBLISHED,
        },
        update: {},
      });

      if (post.id < biggestExistingPostId) {
        continue;
      }

      const images = await this.prismaService.$transaction(
        postImages.map((image) => {
          return this.prismaService.media.create({
            data: {
              externalUrl: image.url,
              alt: image.alt,
            },
          });
        }),
      );

      await this.prismaService.$transaction(
        images.map((image) => {
          return this.prismaService.post_media.create({
            data: {
              postId: post.id,
              mediaId: image.id,
            },
          });
        }),
      );
    }

    console.log("--- Done! Don't forget to update thumbnail for categories");

    return;
  }
}
