import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateChangeRequestDto,
  CreatePostDto,
  GetAllPostDto,
} from './dto/post.dto';
import { PostModel } from './model/post.model';
import { Role } from 'src/enum/role.enum';
import { PaginationHandle } from 'src/prisma/helper/prisma.helper';
import { PlainToInstance } from 'src/helpers/helpers';
import { PostStatus } from 'src/enum/post-status.enum';
import { category, post, subcategory } from '@prisma/client';

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

  private async checkPostPermission(
    postId: number,
    options: {
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<post> {
    const post = await this.getPostById(postId, options);

    if (!post) throw new NotFoundException('Post not found');

    if (options.role === Role.USER && post.userId !== options.userId) {
      throw new UnauthorizedException('Permission denied');
    }

    return post;
  }

  async getAllPosts(
    query: GetAllPostDto,
    options: {
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<PostModel[]> {
    const condition = {
      status: 'ACTIVE',
    };

    if (query.status !== PostStatus.ACTIVE && options.role === Role.ADMIN) {
      condition['status'] = query.status;
    }

    const dbQuery = {
      where: condition,
    };

    PaginationHandle(dbQuery, query.page, query.pageSize);

    const posts = await this.prismaService.post.findMany(dbQuery);

    return PlainToInstance(PostModel, posts);
  }

  async getPostById(
    postId: number,
    options: {
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<PostModel> {
    const post = await this.prismaService.post.findFirst({
      where: {
        id: postId,
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

    if (post.status !== PostStatus.ACTIVE && options.role !== Role.ADMIN)
      throw new NotFoundException('Post not found');

    return PlainToInstance(PostModel, post);
  }

  async createPost(
    dto: CreatePostDto,
    options: {
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<PostModel> {
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

    return PlainToInstance(PostModel, post);
  }

  async deletePostById(
    postId: number,
    options: {
      role?: string;
      username?: string;
      userId?: number;
    },
  ): Promise<void> {
    const post = await this.checkPostPermission(postId, options);

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
    const post = await this.checkPostPermission(dto.postId, options);

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

      case PostStatus.ACTIVE:
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
