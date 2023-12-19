import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role as PrismaUserRole } from '@prisma/client';
import { ErrorMessages } from 'src/helpers';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async approveEditorRegisterRequest(params: { id: number }) {
    const req = await this.prismaService.editor_reg_request.findFirst({
      where: {
        id: params.id,
      },
    });

    if (!req)
      throw new BadRequestException(
        ErrorMessages.USER.EDITOR_REG_REQUEST_INVALID,
      );

    const existedUser = await this.prismaService.user.findFirst({
      where: {
        id: req.userId,
      },
    });

    if (!existedUser)
      throw new BadRequestException(ErrorMessages.USER.USER_INVALID);

    await this.prismaService.user.update({
      where: {
        id: req.userId,
      },
      data: {
        role: PrismaUserRole.EDITOR,
      },
    });

    await this.prismaService.editor_reg_request.update({
      where: {
        id: params.id,
      },
      data: {
        approvedAt: new Date(),
      },
    });
  }

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
}
