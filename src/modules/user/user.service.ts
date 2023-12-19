import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PaginationQuery } from 'src/base/query';
import {
  ErrorMessages,
  genRandomString,
  PaginationHandle,
  PlainToInstance,
  PlainToInstanceList,
  sensitiveFields,
} from 'src/helpers';
import { MailService } from 'src/modules/mail/mail.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { UpdateUserDto } from './dto/user.dto';
import { UserModel } from './model/user.model';

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

  async getAllUsers(query: PaginationQuery): Promise<UserModel[]> {
    const dbQuery = {};

    PaginationHandle(dbQuery, query.page, query.pageSize);
    const users = await this.prismaService.user.findMany(dbQuery);

    return PlainToInstanceList(UserModel, users);
  }

  async GetAuthDataByUsername(
    username: string,
    user: {
      role: string;
      username: string;
    },
  ): Promise<UserModel> {
    let result: UserModel;
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

      result = PlainToInstance(UserModel, user);
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

      result = PlainToInstance(UserModel, user);
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
  ): Promise<UserModel> {
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

    return PlainToInstance(UserModel, updatedUser);
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

  async banUser(username: string): Promise<string> {
    await this.prismaService.user.update({
      where: {
        username: username,
      },
      data: {
        bannedAt: new Date(),
      },
    });

    return 'User banned';
  }

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
}
