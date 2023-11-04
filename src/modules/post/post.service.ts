import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, category, post, subcategory } from '@prisma/client';
import { PostStatus } from 'src/enum/post.enum';
import { Role } from 'src/enum/role.enum';
import {
  PaginationHandle,
  PaginationQuery,
  PlainToInstance,
  PlainToInstanceList,
} from 'src/helpers';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateChangeRequestDto, CreatePostDto } from './req.dto';
import { PostRespDto } from './res.dto';

@Injectable()
export class PostService {
  constructor(private prismaService: PrismaService) {}

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
    subcategoryIds: number[],
  ): Promise<{ category: category; subcategories: subcategory[] }> {
    const category = await this.findCategoryById(categoryId);

    if (!category) throw new NotFoundException('Category not found');

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
  }): Promise<post> {
    const { postId, role, userId } = params;

    const post = await this.getById(postId);

    if (!post) throw new NotFoundException('Post not found');

    if (role === Role.USER && post.userId !== userId) {
      throw new UnauthorizedException('Permission denied');
    }

    return post;
  }

  async get(
    params: {
      status?: PostStatus;
      category?: string[];
    } & PaginationQuery,
  ): Promise<PostRespDto[]> {
    const { status, category, page, pageSize } = params;
    const dbQuery = {
      where: {
        status: status,
        category: category && {
          slug: {
            in: category,
          },
        },
      },
      include: {
        author: true,
        category: true,
      },
    } satisfies Prisma.postFindManyArgs;

    PaginationHandle(dbQuery, page, pageSize);

    const posts = await this.prismaService.post.findMany(dbQuery);

    return PlainToInstanceList(PostRespDto, posts);
  }

  async getById(id: number): Promise<PostRespDto> {
    const post = await this.prismaService.post.findFirst({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    return PlainToInstance(PostRespDto, post);
  }

  async create(
    dto: CreatePostDto,
    options: {
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<PostRespDto> {
    const { category, subcategories } = await this.checkCatSubCat(
      dto.categoryId,
      dto.subcategoryIds,
    );

    const post = await this.prismaService.post.create({
      data: {
        title: dto.title,
        body: dto.body,
        author: {
          connect: {
            id: options.userId,
          },
        },
        subcategories: {
          connect: subcategories,
        },
        category: {
          connect: category,
        },
      },
    });

    return PlainToInstance(PostRespDto, post);
  }

  async deletePostById(
    postId: number,
    options: {
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<void> {
    const post = await this.verifyPostAccessible({
      postId,
      role: options.role,
      userId: options.userId,
    });

    await this.prismaService.post.delete({
      where: {
        id: post.id,
      },
    });
  }

  async createChangeRequest(
    dto: CreateChangeRequestDto,
    options: {
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<void> {
    const post = await this.verifyPostAccessible({
      postId: dto.postId,
      role: options.role,
      userId: options.userId,
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
                id: options.userId,
              },
            },
          },
        });

        break;
    }
  }
}
