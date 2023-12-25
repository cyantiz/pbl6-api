import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostStatus, Prisma, Role } from '@prisma/client';
import {
  ErrorMessages,
  genRandomString,
  getPaginationInfo,
  PaginationHandle,
  PlainToInstance,
  PlainToInstanceList,
  sensitiveFields,
} from 'src/helpers';
import { MailService } from 'src/modules/mail/mail.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { GetAllUsersQueryDto } from './dto/req.dto';
import {
  GetMyVotedPostIdsRespDto,
  PaginatedGetUsersRespDto,
} from './dto/res.dto';
import { UpdateUserDto } from './dto/user.dto';
import { EUserModel, LimitedUserModel } from './model/user.model';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
    private configService: ConfigService,
    private mediaService: MediaService,
  ) {}

  private async checkVerifiedUser(username: string): Promise<boolean> {
    const user = await this.prismaService.user.findFirst({
      where: {
        username: username,
        bannedAt: null,
        isVerified: true,
      },
      select: {
        isVerified: true,
      },
    });

    return user.isVerified;
  }

  async getTopContributors(limit: number): Promise<LimitedUserModel[]> {
    const users = await this.prismaService.user.findMany({
      where: {
        role: Role.EDITOR,
      },
      include: {
        posts: {
          where: {
            status: PostStatus.PUBLISHED,
          },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return PlainToInstanceList(LimitedUserModel, users);
  }

  async getMyVotedPostIds(userId: number): Promise<GetMyVotedPostIdsRespDto> {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        postVotes: true,
      },
    });

    const upvotedPostIds = user.postVotes
      .filter((vote) => vote.positive)
      .map((vote) => vote.postId);
    const downvotedPostIds = user.postVotes
      .filter((vote) => !vote.positive)
      .map((vote) => vote.postId);

    return { upvotedPostIds, downvotedPostIds };
  }

  async GetAuthDataByUsername(
    username: string,
    user: {
      role: string;
      username: string;
    },
  ): Promise<EUserModel> {
    let result: EUserModel;
    if (
      (user.role === Role.USER && username === user.username) ||
      (user.role === Role.EDITOR && username === user.username) ||
      (user.role === Role.MODERATOR && username === user.username) ||
      user.role === Role.ADMIN
    ) {
      const user = await this.prismaService.user.findFirst({
        where: {
          username: username,
          bannedAt: null,
        },
      });

      result = PlainToInstance(EUserModel, user);
    } else {
      const user = await this.prismaService.user.findFirst({
        where: {
          username: username,
          bannedAt: null,
        },
      });

      if (user) {
        sensitiveFields.map((field) => {
          delete user[field];
        });
      }

      result = PlainToInstance(EUserModel, user);
    }

    if (!result) throw new BadRequestException(ErrorMessages.USER.USER_INVALID);

    return result;
  }

  async updateUser(
    username: string,
    dto: UpdateUserDto,
    user: {
      role: string;
      username: string;
    },
  ): Promise<EUserModel> {
    const condition = {
      bannedAt: null,
    };

    if (
      (user.role === Role.USER && username === user.username) ||
      (user.role === Role.EDITOR && username === user.username) ||
      (user.role === Role.MODERATOR && username === user.username) ||
      (user.role === Role.ADMIN && username)
    )
      condition['username'] = username;
    else throw new BadRequestException(ErrorMessages.USER.USER_INVALID);

    await this.prismaService.user.updateMany({
      where: condition,
      data: dto,
    });

    const updatedUser = await this.prismaService.user.findFirst({
      where: condition,
    });

    return PlainToInstance(EUserModel, updatedUser);
  }

  // async deleteUser(
  //   username: string,
  //   user: {
  //     role: string;
  //     username: string;
  //   },
  // ): Promise<string> {
  //   const condition = {
  //     isDeleted: false,
  //   };

  //   if (
  //     (user.role === Role.USER && username === user.username) ||
  //     (user.role === Role.ADMIN && username)
  //   )
  //     condition['username'] = username;
  //   else throw new BadRequestException(ErrorMessages.USER.USER_INVALID);

  //   const deletedUsersCount = (
  //     await this.prismaService.user.updateMany({
  //       where: condition,
  //       data: {
  //         isDeleted: true,
  //       },
  //     })
  //   ).count;

  //   if (deletedUsersCount === 1)
  //     return 'This user has been deleted successfully';
  //   else
  //     throw new BadRequestException(
  //       'Username not match or user is already deleted',
  //     );
  // }

  async verifyUser(user: { email: string; username: string }): Promise<string> {
    const verifyToken = genRandomString(10);

    const existedUser = await this.prismaService.user.findFirst({
      where: {
        username: user.username,
      },
      select: {
        name: true,
      },
    });

    await this.prismaService.user.update({
      data: {
        verifyToken: verifyToken,
      },
      where: {
        username: user.username,
      },
    });

    this.mailService.sendEmailConfirmation(
      { email: user.email, name: existedUser.name },
      verifyToken,
    );

    return 'Verification email sended';
  }

  async changeAvatar(params: { file: Express.Multer.File; userId: number }) {
    const { file, userId } = params;
    const newMedia = await this.mediaService.create({
      file,
    });

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarUrl: await this.mediaService.getMediaUrl(newMedia),
      },
    });
  }

  async createEditorRegisterRequest(
    params: {
      message: string;
    },
    authData: {
      userId: number;
    },
  ) {
    const { message } = params;
    const { userId } = authData;

    const existedUser = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!existedUser)
      throw new BadRequestException(ErrorMessages.USER.USER_INVALID);

    await this.prismaService.editor_reg_request.create({
      data: {
        message,
        userId,
      },
    });
  }

  async getAllUsers(
    query: GetAllUsersQueryDto,
  ): Promise<PaginatedGetUsersRespDto> {
    const { page, pageSize } = query;

    const dbQuery: Prisma.userFindManyArgs = {
      where: {
        role: Role.USER,
        name: query?.partialName
          ? {
              contains: query.partialName,
            }
          : undefined,
      },
    };

    PaginationHandle(dbQuery, page, pageSize);

    const [count, users] = await this.prismaService.$transaction([
      this.prismaService.user.count({
        where: dbQuery.where,
      }),
      this.prismaService.user.findMany(dbQuery),
    ]);

    return PlainToInstance(PaginatedGetUsersRespDto, {
      users,
      ...getPaginationInfo({ count, page, pageSize }),
    });
  }

  async getAllEditors(
    query: GetAllUsersQueryDto,
  ): Promise<PaginatedGetUsersRespDto> {
    const { page, pageSize } = query;

    const dbQuery: Prisma.userFindManyArgs = {
      where: {
        role: Role.EDITOR,
        name: query?.partialName
          ? {
              contains: query.partialName,
            }
          : undefined,
      },
    };

    PaginationHandle(dbQuery, page, pageSize);

    const [count, users] = await this.prismaService.$transaction([
      this.prismaService.user.count({
        where: dbQuery.where,
      }),
      this.prismaService.user.findMany(dbQuery),
    ]);

    return PlainToInstance(PaginatedGetUsersRespDto, {
      users,
      ...getPaginationInfo({ count, page, pageSize }),
    });
  }

  async banUser(username: string) {
    await this.prismaService.user.update({
      where: {
        username: username,
      },
      data: {
        bannedAt: new Date(),
      },
    });
  }

  async unbanUser(username: string) {
    await this.prismaService.user.update({
      where: {
        username: username,
      },
      data: {
        bannedAt: null,
      },
    });
  }

  async promoteEditor(username: string) {
    await this.prismaService.user.update({
      where: {
        username: username,
      },
      data: {
        role: Role.EDITOR,
      },
    });
  }

  async removeEditorRights(username: string) {
    await this.prismaService.user.update({
      where: {
        username: username,
      },
      data: {
        role: Role.USER,
      },
    });
  }
}
