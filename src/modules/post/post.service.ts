import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  category,
  PostStatus,
  Prisma,
  Role,
  subcategory,
} from '@prisma/client';
import { pick } from 'lodash';
import { PaginationQuery } from 'src/base/query';
import {
  getSlug,
  PaginationHandle,
  PlainToInstance,
  PlainToInstanceList,
} from 'src/helpers';
import { MediaService } from 'src/modules/media/media.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { getPaginationInfo } from './../../helpers/prisma';
import { CreateChangeRequestDto, CreatePostDto } from './req.dto';
import { ExtendedPostRespDto, GetPostsByFilterRespDto } from './res.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  private async findCategoryById(categoryId: number): Promise<category> {
    return await this.prismaService.category.findFirst({
      where: {
        id: categoryId,
      },
    });
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

  private async verifyPermissionAdjustPost(params: {
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

    if (!isAuthor) {
      throw new UnauthorizedException('Permission denied');
    }
  }

  async get(
    params: {
      status?: PostStatus;
      category?: string[];
      userId?: number;
    } & PaginationQuery,
  ): Promise<GetPostsByFilterRespDto> {
    const { status, category, page, pageSize, userId } = params;
    const dbQuery: Prisma.postFindManyArgs = {
      where: {
        status: status ?? undefined,
        category: category && {
          slug: {
            in: category,
          },
        },
        userId: userId ?? undefined,
      },
      include: {
        author: true,
        category: true,
        visits: true,
        thumbnailMedia: true,
      },
    };

    PaginationHandle(dbQuery, page, pageSize);

    const [count, posts] = await this.prismaService.$transaction([
      this.prismaService.post.count({
        where: dbQuery.where,
      }),
      this.prismaService.post.findMany(dbQuery),
    ]);

    return PlainToInstance(GetPostsByFilterRespDto, {
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
      },
    });

    if (!post?.id) throw new NotFoundException('Post not found');

    return PlainToInstance(ExtendedPostRespDto, post);
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

    const postSubcategories = subcategories.map((subcat) => ({
      postId: post.id,
      subcategoryId: subcat.id,
    }));

    await this.prismaService.post_subcategory.createMany({
      data: postSubcategories,
    });

    return PlainToInstance(ExtendedPostRespDto, post);
  }

  async deletePostById(
    postId: number,
    authData: {
      role?: Role;
      username?: string;
      userId?: number;
    },
  ): Promise<void> {
    const post = await this.verifyPermissionAdjustPost({
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
    const post = await this.verifyPermissionAdjustPost({
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
}
