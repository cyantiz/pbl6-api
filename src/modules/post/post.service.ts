import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, category, subcategory } from '@prisma/client';
import { pick } from 'lodash';
import { PostStatus } from 'src/enum/post.enum';
import { Role } from 'src/enum/role.enum';
import {
  PaginationHandle,
  PaginationQuery,
  PlainToInstance,
  PlainToInstanceList,
} from 'src/helpers';
import { MediaService } from 'src/media/media.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateChangeRequestDto, CreatePostDto } from './req.dto';
import { ExtendedPostRespDto } from './res.dto';

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

  private async verifyPostAccessible(params: {
    postId: number;
    role?: string;
    userId?: number;
  }) {
    const { postId, role, userId } = params;

    const post = await this.getById(postId);

    if (!post) throw new NotFoundException('Post not found');

    if ([Role.ADMIN, Role.MODERATOR].includes(role as Role)) return post;

    if (post.userId !== userId) {
      throw new UnauthorizedException('Permission denied');
    }

    return post;
  }

  async get(
    params: {
      status?: PostStatus;
      category?: string[];
      userId?: number;
    } & PaginationQuery,
  ): Promise<ExtendedPostRespDto[]> {
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

    const posts = await this.prismaService.post.findMany(dbQuery);

    return PlainToInstanceList(ExtendedPostRespDto, posts);
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

  async create(
    dto: CreatePostDto,
    thumbnailFile: Express.Multer.File,
    authData: {
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<ExtendedPostRespDto> {
    const permitted = [Role.ADMIN, Role.MODERATOR, Role.EDITOR].includes(
      authData.role as Role,
    );

    if (!permitted) throw new UnauthorizedException('Permission denied!');

    const { category, subcategories } = await this.checkCatSubCat(
      +dto.categoryId,
      dto.subcategoryIds ? dto.subcategoryIds.map((id) => +id) : undefined,
    );

    const thumbnailMedia = await this.mediaService.create({
      file: thumbnailFile,
    });

    console.log('thumbnailMedia', thumbnailMedia);

    const post = await this.prismaService.post.create({
      data: {
        title: dto.title,
        body: dto.body,
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
        subcategories: subcategories.length
          ? {
              connect: pick(subcategories, 'id'),
            }
          : undefined,
        category: {
          connect: pick(category, 'id'),
        },
      },
    });

    return PlainToInstance(ExtendedPostRespDto, post);
  }

  async deletePostById(
    postId: number,
    authData: {
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<void> {
    const post = await this.verifyPostAccessible({
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
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<void> {
    const post = await this.verifyPostAccessible({
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
            status: PostStatus.PENDING,
          },
        });

      case PostStatus.PENDING:
        await this.prismaService.post.update({
          where: {
            id: post.id,
          },
          data: {
            title: dto.title ?? undefined,
            body: dto.body ?? undefined,
            category: dto.categoryId
              ? {
                  connect: category,
                }
              : undefined,
            subcategories:
              dto.subcategoryIds?.length > 0
                ? {
                    connect: subcategories,
                  }
                : undefined,
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

  async approvePost(
    postId: number,
    authData: {
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<void> {
    const post = await this.verifyPostAccessible({
      postId,
      role: authData.role,
      userId: authData.userId,
    });

    const permitted = [Role.ADMIN, Role.MODERATOR].includes(
      authData.role as Role,
    );

    if (!permitted) throw new UnauthorizedException('Permission denied!');

    if (post.status !== PostStatus.PENDING)
      throw new BadRequestException('Post is not pending');

    await this.prismaService.post.update({
      where: {
        id: post.id,
      },
      data: {
        status: PostStatus.PUBLISHED,
        approverId: authData.userId,
      },
    });
  }
}
