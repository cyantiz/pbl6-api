import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  category,
  PostStatus,
  Prisma,
  Role,
  subcategory,
  user,
} from '@prisma/client';
import { pick } from 'lodash';
import { PaginationQuery } from 'src/base/query';
import {
  ErrorMessages,
  getSlug,
  PlainToInstance,
  PlainToInstanceList,
} from 'src/helpers';
import { MediaService } from 'src/modules/media/media.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { getPaginationInfo, PaginationHandle } from './../../helpers/prisma';
import {
  CreateChangeRequestDto,
  CreatePostDto,
  GetReadPostsQueryDto,
  UpdatePostDto,
} from './dto/req.dto';
import {
  ExtendedPostRespDto,
  PaginatedGetCommentsRespDto,
  PaginatedGetPostsRespDto,
} from './dto/res.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mediaService: MediaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.abc();
  }

  async abc() {
    const defaultHashedPassword =
      '$argon2id$v=19$m=65536,t=3,p=4$xMDOC2bczA7juS7hW682Cw$48Wij7VciKxHrdITuuYPAFQtlDVIm72mjGtdYAcATZw'; //await argon.hash('Default-Password123');
    const seedAdmins: Partial<user>[] = Array.from({ length: 10 }).map(
      (_, i) => ({
        email: `nguyen.vh.nhan+${i + 2001}@gmail.com`,
        username: `seedadmin${i + 1}`,
        name: `Seed Admin ${i}`,
        role: 'ADMIN',
        avatarUrl:
          'https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGxhbnQlMjBtaW5pbWFsfGVufDB8fDB8fHww',
        password: defaultHashedPassword,
        isVerified: true,
        verifiedAt: new Date(),
      }),
    );
    const seedEditors: Partial<user>[] = Array.from({ length: 10 }).map(
      (_, i) => ({
        email: `nguyen.vh.nhan+${i + 4001}@gmail.com`,
        username: `seededitor${i + 1}`,
        name: `Seed Editor ${i}`,
        role: 'EDITOR',
        avatarUrl:
          'https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGxhbnQlMjBtaW5pbWFsfGVufDB8fDB8fHww',
        password: defaultHashedPassword,
        isVerified: true,
        verifiedAt: new Date(),
      }),
    );
    await this.prismaService.$transaction(
      [...seedAdmins, ...seedEditors].map(
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
          return this.prismaService.user.upsert({
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
  }

  async test() {
    const posts = await this.prismaService.post.findMany({});
    const suggestionsJson = fs.readFileSync(
      '/Users/hoangnhan1203/Downloads/corpus_final.json',
    );
    const suggestions = JSON.parse(suggestionsJson.toString());

    console.log('suggestions', suggestions.length);
    console.log('posts', posts.length);

    const postInSuggestionButNotinPosts = suggestions.filter(
      (suggestion) =>
        !posts.find((post) => post.mongoOid === suggestion.object_id),
    );

    // console.log(
    //   'postInSuggestionButNotinPosts',
    //   postInSuggestionButNotinPosts.forEach((missing) => {
    //     console.log(missing.query.slice(0, 11));
    //   }),
    // );

    // save post in suggestion but not in posts to path /Users/hoangnhan1203/Downloads/missing.json
    fs.writeFileSync(
      '/Users/hoangnhan1203/Downloads/missing_oid.json',
      JSON.stringify(
        postInSuggestionButNotinPosts.map((item) => item.object_id),
      ),
    );
  }

  private searchTextUrl = this.configService.get<string>('search.byTextUrl');
  private searchImageUrl = this.configService.get<string>('search.byImageUrl');
  private addArticleUrl = this.configService.get<string>(
    'search.addArticleUrl',
  );

  private async findCategoryById(categoryId: number): Promise<category> {
    return await this.prismaService.category.findFirst({
      where: {
        id: categoryId,
      },
    });
  }

  async verifyPermissionToReadPost(params: {
    postId?: number;
    slug?: string;
    role?: Role;
    userId?: number;
  }) {
    const { role, userId, postId, slug } = params;

    if (!postId && !slug) throw new BadRequestException('Post not found');

    const post = postId
      ? await this.getById(postId)
      : await this.getBySlug(slug);

    const isAdministrator = role === Role.ADMIN;
    const isAuthor = userId === post.userId;

    if (!isAdministrator && !isAuthor && post.status !== PostStatus.PUBLISHED) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  private async findSubCategoriesByIds(
    subcategoryIds: number[],
  ): Promise<subcategory[]> {
    return await this.prismaService.subcategory.findMany({
      where: {
        id: {
          in: subcategoryIds,
        },
      },
    });
  }

  private async checkCatSubCat(
    categoryId: number,
    subcategoryIds?: number[],
  ): Promise<{ category: category; subcategories: subcategory[] }> {
    const category = await this.findCategoryById(categoryId);

    if (!category) throw new NotFoundException('Category not found');

    if (!subcategoryIds) return { category, subcategories: [] };

    const subcategories = await this.findSubCategoriesByIds(subcategoryIds);

    if (subcategories.length !== subcategoryIds.length) {
      const existingSubcatIds = subcategories.map((subcat) => subcat.id);
      const notFoundSubcatIds = subcategoryIds.filter(
        (subcatId) => !existingSubcatIds.includes(subcatId),
      );

      throw new NotFoundException(
        `Subcategories not found: ${notFoundSubcatIds.join(', ')}`,
      );
    }

    return { category, subcategories };
  }

  private async verifyPermissionToAdjustPost(params: {
    postId: number;
    role?: Role;
    userId?: number;
  }) {
    const { postId, role, userId } = params;

    const post = await this.getById(postId);

    if (!post) throw new NotFoundException('Post not found');

    const alwaysPermittedRoles: Role[] = [Role.ADMIN, Role.MODERATOR];
    const isAuthor = post.author.id === userId;

    if (isAuthor || alwaysPermittedRoles.includes(role)) return post;

    throw new UnauthorizedException('Permission denied');
  }

  async get(
    params: {
      status?: PostStatus;
      category?: string[];
      userId?: number;
    } & PaginationQuery,
  ): Promise<PaginatedGetPostsRespDto> {
    const { status, category, page, pageSize, userId } = params;

    const dbQuery: Prisma.postFindManyArgs = {
      where: {
        status: status ?? undefined,
        category: category?.length
          ? {
              slug: {
                in: category,
              },
            }
          : undefined,
        userId: userId ?? undefined,
      },
      include: {
        author: true,
        category: true,
        visits: true,
        thumbnailMedia: true,
        post_media: {
          include: {
            media: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    };

    PaginationHandle(dbQuery, page, pageSize);

    const [count, posts] = await this.prismaService.$transaction([
      this.prismaService.post.count({
        where: dbQuery.where,
      }),
      this.prismaService.post.findMany(dbQuery),
    ]);

    return PlainToInstance(PaginatedGetPostsRespDto, {
      posts,
      ...getPaginationInfo({ count, page, pageSize }),
    });
  }

  async getById(id: number): Promise<ExtendedPostRespDto> {
    const post = await this.prismaService.post.findFirst({
      where: {
        id,
      },
      include: {
        author: true,
        category: true,
        visits: true,
        thumbnailMedia: true,
        post_media: {
          include: {
            media: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    return PlainToInstance(ExtendedPostRespDto, post);
  }

  async getBySlug(slug: string): Promise<ExtendedPostRespDto> {
    const post = await this.prismaService.post.findFirst({
      where: {
        slug,
      },
      include: {
        author: true,
        category: true,
        visits: true,
        thumbnailMedia: true,
        post_media: {
          include: {
            media: true,
          },
        },
      },
    });

    if (!post?.id) throw new NotFoundException('Post not found');

    return PlainToInstance(ExtendedPostRespDto, post);
  }

  async getFromSearchText(text: string): Promise<ExtendedPostRespDto[]> {
    const { data } = await this.httpService.axiosRef.get(
      `${this.searchTextUrl}?query=${text}`,
    );

    // const slugs = data?.response?.map((item) => getSlug(item.title));

    if (
      data?.response ===
      'your query does not seem to be related to sports content.'
    ) {
      throw new BadRequestException('NOT_SPORT_RELEVANT');
    }

    const titles = data?.response ?? [];
    console.log('response from ai length', titles.length);

    const posts = await this.prismaService.post.findMany({
      where: {
        title: {
          in: titles,
        },
      },
      include: {
        author: true,
        category: true,
        visits: true,
        thumbnailMedia: true,
        post_media: {
          include: {
            media: true,
          },
        },
      },
    });

    const sortedPosts = titles.map((title) => {
      const foundPost = posts.find((post) => post.title === title);
      if (!foundPost) console.log('NOT FOUND', title);
      return foundPost;
    });

    return PlainToInstanceList(ExtendedPostRespDto, sortedPosts);
  }

  async getFromSearchImage(
    file: Express.Multer.File,
  ): Promise<ExtendedPostRespDto[]> {
    console.log('filename', file.originalname);
    const formData = new FormData();

    console.log('filename', file.originalname);
    formData.append('file', Buffer.from(file.buffer), {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    console.log('filename', file.originalname);
    const { data } = await this.httpService.axiosRef.post(
      `${this.searchImageUrl}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': `${formData.getLengthSync()}`,
        },
      },
    );

    // const slugs = data?.response?.map((item) => getSlug(item.title));

    if (
      data?.response ===
      'your query does not seem to be related to sports content.'
    ) {
      throw new BadRequestException('NOT_SPORT_RELEVANT');
    }

    const titles = data?.response ?? [];

    console.log('response from ai length', titles.length);

    const posts = await this.prismaService.post.findMany({
      where: {
        title: {
          in: titles,
        },
      },
      include: {
        author: true,
        category: true,
        visits: true,
        thumbnailMedia: true,
        post_media: {
          include: {
            media: true,
          },
        },
      },
    });

    const sortedPosts = titles.map((title) => {
      const foundPost = posts.find((post) => post.title === title);
      // if (!foundPost) console.log('NOT FOUND', slug);
      return foundPost;
    });

    console.log('sortedPosts length', sortedPosts.length);

    return PlainToInstanceList(ExtendedPostRespDto, sortedPosts);
  }

  /**
   *
   * @returns {ExtendedPostRespDto} The most visited post in the last 30 days
   */
  async getFrontPagePost(): Promise<ExtendedPostRespDto> {
    const post = await this.prismaService.post.findFirst({
      where: {
        status: PostStatus.PUBLISHED,
      },
      include: {
        visits: {
          where: {
            visitAt: {
              gte: new Date(Date.now() - 1000 * 3600 * 24 * 30),
            },
          },
        },
        category: true,
        author: true,
        thumbnailMedia: true,
        post_media: {
          include: {
            media: true,
          },
        },
      },
      orderBy: {
        visits: {
          _count: 'desc',
        },
      },
    });

    return PlainToInstance(ExtendedPostRespDto, post);
  }

  /**
   *
   * @returns {ExtendedPostRespDto[]} The most visited posts in the last 30 days
   */
  async getPopularPosts(params: {
    take: number;
  }): Promise<ExtendedPostRespDto[]> {
    const { take } = params;
    const posts = await this.prismaService.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
      include: {
        visits: {
          where: {
            visitAt: {
              gte: new Date(Date.now() - 1000 * 3600 * 24 * 30),
            },
          },
        },
        category: true,
        author: true,
        thumbnailMedia: true,
        post_media: {
          include: {
            media: true,
          },
        },
      },
      orderBy: {
        visits: {
          _count: 'desc',
        },
      },
      skip: 1,
      take: +take,
    });

    return PlainToInstanceList(ExtendedPostRespDto, posts);
  }

  private verifyPermissionToCreate({ role }: { role?: Role }) {
    const permittedRoles: Role[] = [Role.ADMIN, Role.MODERATOR, Role.EDITOR];

    const permitted = permittedRoles.includes(role);

    if (!permitted) throw new UnauthorizedException('Permission denied!');
  }

  private async verifyUniqueSlug(slug: string) {
    const existed = await this.prismaService.post.findFirst({
      where: {
        slug,
      },
    });

    if (!!existed)
      throw new BadRequestException(
        'Title is duplicated with another post, please change it!',
      );

    return;
  }

  async create(
    dto: CreatePostDto,
    thumbnailFile: Express.Multer.File,
    authData: {
      role?: Role;
      username?: string;
      userId?: number;
    },
  ): Promise<ExtendedPostRespDto> {
    this.verifyPermissionToCreate({ role: authData.role });

    const { category, subcategories } = await this.checkCatSubCat(
      +dto.categoryId,
      dto.subcategoryIds ? dto.subcategoryIds.map((id) => +id) : undefined,
    );

    const slug = getSlug(dto.title, '-');

    await this.verifyUniqueSlug(slug);

    const thumbnailMedia = await this.mediaService.create({
      file: thumbnailFile,
    });

    console.log('thumbnailMedia', thumbnailMedia);

    const post = await this.prismaService.post.create({
      data: {
        title: dto.title,
        body: dto.body,
        secondaryText: dto.secondaryText,
        slug,
        thumbnailMedia: {
          connect: {
            id: thumbnailMedia.id,
          },
        },
        author: {
          connect: {
            id: authData.userId,
          },
        },
        category: {
          connect: pick(category, 'id'),
        },
        status: dto.status,
        createdAt: new Date(),
        publishedAt: dto.status === PostStatus.PUBLISHED ? new Date() : null,
      },
    });

    const thumbnailUrl = await this.mediaService.getMediaUrl(thumbnailMedia.id);
    console.log(
      `${this.addArticleUrl}?title=${dto.title}&content=${dto.body}&image_url=${thumbnailUrl}`,
    );
    await this.httpService.axiosRef
      .post(
        `${this.addArticleUrl}`,
        {
          title: dto.title,
          content: dto.body,
          image_url: await this.mediaService.getMediaUrl(thumbnailMedia.id),
        },
        {
          params: {
            title: dto.title,
            content: dto.body,
            image_url: await this.mediaService.getMediaUrl(thumbnailMedia.id),
          },
        },
      )
      .then((res) => {
        console.log('res', res.data);
      })
      .catch((err) => {
        console.log('err', err);
      });

    const postSubcategories = subcategories.map((subcat) => ({
      postId: post.id,
      subcategoryId: subcat.id,
    }));

    await this.prismaService.post_subcategory.createMany({
      data: postSubcategories,
    });

    return PlainToInstance(ExtendedPostRespDto, post);
  }

  async update(params: {
    postId: number;
    dto: Partial<UpdatePostDto>;
    thumbnailFile?: Express.Multer.File;
    authData: {
      role?: Role;
      username?: string;
      userId?: number;
    };
  }): Promise<ExtendedPostRespDto> {
    const { postId, dto, thumbnailFile, authData } = params;

    const post = await this.verifyPermissionToAdjustPost({
      postId: postId,
      role: authData.role,
      userId: authData.userId,
    });

    const { category } = await this.checkCatSubCat(+dto.categoryId);

    const slug = getSlug(dto.title, '-');

    if (slug !== post.slug) await this.verifyUniqueSlug(slug);

    const thumbnailMedia = thumbnailFile
      ? await this.mediaService.create({
          file: thumbnailFile,
        })
      : undefined;

    const post_media = thumbnailMedia
      ? {
          connect: {
            id: thumbnailMedia.id,
          },
        }
      : undefined;

    const updatedPost = await this.prismaService.post.update({
      where: {
        id: post.id,
      },
      data: {
        title: dto.title,
        body: dto.body,
        secondaryText: dto.secondaryText,
        slug,
        thumbnailMedia: post_media,
        category: {
          connect: pick(category, 'id'),
        },
        status: dto.status,
        updatedAt: new Date(),
      },
      include: {
        author: true,
        category: true,
        visits: true,
        thumbnailMedia: true,
        post_media: {
          include: {
            media: true,
          },
        },
      },
    });

    return PlainToInstance(ExtendedPostRespDto, updatedPost);
  }

  async deletePostById(
    postId: number,
    authData: {
      role?: Role;
      username?: string;
      userId?: number;
    },
  ): Promise<void> {
    const post = await this.verifyPermissionToAdjustPost({
      postId,
      role: authData.role,
      userId: authData.userId,
    });

    await this.prismaService.post.delete({
      where: {
        id: post.id,
      },
    });
  }

  async createChangeRequest(
    dto: CreateChangeRequestDto,
    authData: {
      role?: Role;
      username?: string;
      userId?: number;
    },
  ): Promise<void> {
    const post = await this.verifyPermissionToAdjustPost({
      postId: dto.postId,
      role: authData.role,
      userId: authData.userId,
    });

    const { category, subcategories } = await this.checkCatSubCat(
      dto.categoryId,
      dto.subcategoryIds,
    );

    switch (post.status) {
      case PostStatus.DENIED:
        await this.prismaService.post.update({
          where: {
            id: post.id,
          },
          data: {
            status: PostStatus.DRAFT,
          },
        });
        break;

      case PostStatus.DELETED:
        throw new BadRequestException('Cannot change deleted posts');

      case PostStatus.PUBLISHED:
        await this.prismaService.change_request.create({
          data: {
            body: dto.body,
            title: dto.title,
            subcategories: {
              connect: subcategories,
            },
            category: {
              connect: category,
            },
            post: {
              connect: post,
            },
            user: {
              connect: {
                id: authData.userId,
              },
            },
          },
        });

        break;
    }
  }

  async upvotePost(postId: number, userId: number) {
    const existed = await this.prismaService.post_vote.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existed) {
      if (existed.positive)
        await this.prismaService.$transaction([
          this.prismaService.post_vote.delete({
            where: {
              id: existed.id,
            },
          }),
          this.prismaService.post.update({
            where: {
              id: postId,
            },
            data: {
              upvote: {
                decrement: 1,
              },
            },
          }),
        ]);
      else
        await this.prismaService.$transaction([
          this.prismaService.post_vote.update({
            where: {
              id: existed.id,
            },
            data: {
              positive: true,
            },
          }),
          this.prismaService.post.update({
            where: {
              id: postId,
            },
            data: {
              upvote: {
                increment: 1,
              },
              downvote: {
                decrement: 1,
              },
            },
          }),
        ]);

      return;
    }

    await this.prismaService.$transaction([
      this.prismaService.post_vote.create({
        data: {
          positive: true,
          post: {
            connect: {
              id: postId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      }),
      this.prismaService.post.update({
        where: {
          id: postId,
        },
        data: {
          upvote: {
            increment: 1,
          },
        },
      }),
    ]);
  }

  async downvotePost(postId: number, userId: number) {
    const existed = await this.prismaService.post_vote.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existed) {
      if (!existed.positive)
        await this.prismaService.$transaction([
          this.prismaService.post_vote.delete({
            where: {
              id: existed.id,
            },
          }),
          this.prismaService.post.update({
            where: {
              id: postId,
            },
            data: {
              downvote: {
                decrement: 1,
              },
            },
          }),
        ]);
      else
        await this.prismaService.$transaction([
          this.prismaService.post_vote.update({
            where: {
              id: existed.id,
            },
            data: {
              positive: false,
            },
          }),
          this.prismaService.post.update({
            where: {
              id: postId,
            },
            data: {
              upvote: {
                decrement: 1,
              },
              downvote: {
                increment: 1,
              },
            },
          }),
        ]);

      return;
    }

    await this.prismaService.$transaction([
      this.prismaService.post_vote.create({
        data: {
          positive: false,
          post: {
            connect: {
              id: postId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      }),
      this.prismaService.post.update({
        where: {
          id: postId,
        },
        data: {
          downvote: {
            increment: 1,
          },
        },
      }),
    ]);
  }

  async commentToPost(params: {
    postId: number;
    userId: number;
    comment: string;
  }) {
    const { postId, userId, comment } = params;

    const post = await this.prismaService.post.findFirst({
      where: {
        id: postId,
      },
    });

    if (!post) throw new NotFoundException(ErrorMessages.POST.POST_NOT_FOUND);

    return await this.prismaService.comment.create({
      data: {
        text: comment,
        post: {
          connect: {
            id: postId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        parentComment: true,
        childComments: true,
      },
    });
  }

  async saveReadingProgress(params: {
    userId: number;
    postId: number;
    progress: number;
  }) {
    const { userId, postId, progress } = params;

    const existed = await this.prismaService.user_read_post.findFirst({
      where: {
        userId,
        postId,
      },
    });

    if (!existed) {
      return await this.prismaService.user_read_post.create({
        data: {
          progress,
          post: {
            connect: {
              id: postId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }

    return await this.prismaService.user_read_post.update({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      data: {
        progress,
      },
    });
  }

  async readPost(params: {
    postId: number;
    percentage?: number;
    userId?: number;
    IP?: string;
  }) {
    const { percentage, IP, userId, postId } = params;

    if (!userId && !IP) return;

    const query = {
      where: {
        postId,
      },
    };

    if (userId) {
      query.where['userId'] = userId;
    } else {
      query.where['IP'] = IP;
    }

    const existed = await this.prismaService.visit.findFirst({
      ...query,
    });

    if (existed) {
      await this.prismaService.visit.update({
        where: {
          id: existed.id,
        },
        data: {
          visitAt: new Date(),
          percentage: percentage ?? undefined,
        },
      });
      return;
    }

    await this.prismaService.visit.create({
      data: {
        percentage: percentage ?? undefined,
        post: {
          connect: {
            id: postId,
          },
        },
        user: userId
          ? {
              connect: {
                id: userId,
              },
            }
          : undefined,
        IP: userId ? undefined : IP,
      },
    });
  }

  async getReadPosts(query: GetReadPostsQueryDto) {
    const { IP, userId, page, pageSize } = query;

    if (!userId && !IP) return;

    const visitQuery: Prisma.visitFindManyArgs = {
      where: {
        userId: userId ? +userId : undefined,
        IP: userId ? null : IP,
      },
      orderBy: {
        visitAt: 'desc',
      },
      distinct: ['postId'],
    };
    PaginationHandle(visitQuery, page, pageSize);
    const existed = await this.prismaService.visit.findMany(visitQuery);

    console.log('read', existed.length);

    const dbQuery: Prisma.postFindManyArgs = {
      where: {
        id: {
          in: existed.map((visit) => visit.postId),
        },
      },
      include: {
        author: true,
        category: true,
        visits: true,
        thumbnailMedia: true,
        post_media: {
          include: {
            media: true,
          },
        },
      },
    };

    PaginationHandle(dbQuery, page, pageSize);

    const [count, posts] = await this.prismaService.$transaction([
      this.prismaService.post.count({
        where: dbQuery.where,
      }),
      this.prismaService.post.findMany(dbQuery),
    ]);

    // sort the posts by the order of the ids in existed

    const sortedPosts = existed.map((visit) => {
      const foundPost = posts.find((post) => post.id === visit.postId);
      if (!foundPost) console.log('NOT FOUND', visit.postId);
      return foundPost;
    });

    return PlainToInstance(PaginatedGetPostsRespDto, {
      posts: sortedPosts,
      ...getPaginationInfo({ count, page, pageSize }),
    });
  }

  async getPostComments(params: {
    postId: number;
    page: number;
    pageSize: number;
  }) {
    const { postId, page, pageSize } = params;

    const dbQuery: Prisma.commentFindManyArgs = {
      where: {
        postId,
      },
      include: {
        parentComment: true,
        childComments: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    };

    PaginationHandle(dbQuery, page, pageSize);

    const [count, comments] = await this.prismaService.$transaction([
      this.prismaService.comment.count({
        where: dbQuery.where,
      }),
      this.prismaService.comment.findMany(dbQuery),
    ]);

    return PlainToInstance(PaginatedGetCommentsRespDto, {
      comments,
      ...getPaginationInfo({ count, page, pageSize }),
    });
  }
}
