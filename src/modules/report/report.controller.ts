import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQuery } from 'src/base/query';
import { APISummaries } from 'src/helpers';
import {
  AuthData,
  GetAuthData,
} from 'src/modules/auth/decorator/get-auth-data.decorator';
import { AdminGuard, UserGuard } from 'src/modules/auth/guard/auth.guard';
import { HandleReportDto, ReportDto } from './dto/report.dto';
import { ReportModel } from './model/report.model';
import { ReportService } from './report.service';

@ApiTags('REPORT')
@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: ReportModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get()
  getAllReports(
    @Query(new ValidationPipe({ transform: true })) query: PaginationQuery,
    @GetAuthData() authData: AuthData,
  ): Promise<ReportModel[]> {
    return this.reportService.getAllReports(query, {
      role: authData.role,
      username: authData.username,
      userId: authData.id,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: ReportModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get(':id')
  getReportById(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthData() authData: AuthData,
  ): Promise<ReportModel> {
    return this.reportService.getReportById(id, {
      role: authData.role,
      userId: authData.id,
      username: authData.username,
    });
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: APISummaries.USER })
  @ApiOkResponse({ type: ReportModel })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post()
  createReport(
    @Body() dto: ReportDto,
    @GetAuthData() authData: AuthData,
  ): Promise<ReportModel> {
    return this.reportService.createReport(dto, {
      role: authData.role,
      userId: authData.id,
      username: authData.username,
    });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: ReportModel })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Put(':id')
  handleReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: HandleReportDto,
  ): Promise<ReportModel> {
    return this.reportService.handleReport(id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.ADMIN })
  @ApiOkResponse({ type: ReportModel })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Delete(':id')
  deleteReportById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReportModel> {
    return this.reportService.deleteReportById(id);
  }
}
