import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { PlainToInstance, PlainToInstanceList } from 'src/helpers';
import { CategoryRespDto } from './dto/res.dto';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}

  async get(): Promise<CategoryRespDto[]> {
    const categories = await this.prismaService.category.findMany({});

    return PlainToInstanceList(CategoryRespDto, categories);
  }

  async getBySlug(slug: string): Promise<CategoryRespDto> {
    const category = await this.prismaService.category.findUnique({
      where: {
        slug,
      },
    });

    return PlainToInstance(CategoryRespDto, category);
  }
}
