import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from 'src/enum/role.enum';
import {
  ErrorMessages,
  PaginationHandle,
  PaginationQuery,
  PlainToInstance,
  PlainToInstanceList,
} from 'src/helpers';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { HandleReportDto, ReportDto } from './dto/report.dto';
import { ReportModel } from './model/report.model';

@Injectable()
export class ReportService {
  constructor(private prismaService: PrismaService) {}

  async getAllReports(
    query: PaginationQuery,
    user: {
      role: string;
      username: string;
      userId: number;
    },
  ): Promise<ReportModel[]> {
    const dbQuery = {
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    };
    if (!(user.role === Role.ADMIN))
      dbQuery['where'] = {
        userId: user.userId,
      };

    PaginationHandle(dbQuery, query.page, query.pageSize);
    return PlainToInstanceList(
      ReportModel,
      await this.prismaService.report.findMany(dbQuery),
    );
  }

  async getReportById(
    id: number,
    user: { role: string; userId: number; username: string },
  ): Promise<ReportModel> {
    const condition = {
      id: id,
    };

    if (!(user.role === Role.ADMIN)) condition['userId'] = user.userId;

    const report = await this.prismaService.report.findFirst({
      where: condition,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (report) {
      return PlainToInstance(ReportModel, report);
    } else {
      throw new NotFoundException(ErrorMessages.REPORT.REPORT_NOT_FOUND);
    }
  }

  async createReport(
    dto: ReportDto,
    user: { role: string; userId: number; username: string },
  ): Promise<ReportModel> {
    const post = await this.prismaService.post.findFirst({
      where: {
        id: dto.postId,
      },
    });

    if (!post) throw new NotFoundException(ErrorMessages.POST.POST_NOT_FOUND);

    const report = await this.prismaService.report.create({
      data: {
        userId: user.userId,
        postId: post.id,
        reason: dto.reason,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return PlainToInstance(ReportModel, report);
  }

  async handleReport(id: number, dto: HandleReportDto): Promise<ReportModel> {
    const report = await this.prismaService.report.findFirst({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!report)
      throw new NotFoundException(ErrorMessages.REPORT.REPORT_NOT_FOUND);

    await this.prismaService.report.update({
      where: {
        id: id,
      },
      data: {
        status: dto.status,
      },
    });

    report.status = dto.status;

    return PlainToInstance(ReportModel, report);
  }

  async deleteReportById(id: number): Promise<ReportModel> {
    const report = await this.prismaService.report.findFirst({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!report)
      throw new NotFoundException(ErrorMessages.REPORT.REPORT_NOT_FOUND);

    await this.prismaService.report.delete({
      where: {
        id: id,
      },
    });

    return PlainToInstance(ReportModel, report);
  }
}
