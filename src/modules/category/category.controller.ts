import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { APISummaries } from 'src/helpers';
import { CategoryService } from './category.service';
import { CategoryRespDto } from './res.dto';

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
}