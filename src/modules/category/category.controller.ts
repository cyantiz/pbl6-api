import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { APISummaries } from 'src/helpers';
import { CategoryService } from './category.service';
import { CategoryRespDto } from './dto/res.dto';

@Controller('category')
@ApiTags('CATEGORY')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: CategoryRespDto, isArray: true })
  @Get()
  getAllPosts() {
    return this.categoryService.get();
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: APISummaries.UNAUTH })
  @ApiOkResponse({ type: CategoryRespDto, isArray: true })
  @Get('by-slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.categoryService.getBySlug(slug);
  }
}
