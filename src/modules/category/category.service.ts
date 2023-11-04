import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import { PlainToInstanceList } from 'src/helpers';
import { CategoryRespDto } from './res.dto';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}

  async get(): Promise<CategoryRespDto[]> {
    // const sampleCategories = [
    //   {
    //     id: 1,
    //     name: 'Football',
    //     createdAt: '2023-11-04 00:10:10.097',
    //     thumbnail:
    //       'https://img.olympics.com/images/image/private/t_social_share_thumb/f_auto/primary/qjxgsf7pqdmyqzsptxju',
    //     slug: 'football',
    //   },
    //   {
    //     id: 2,
    //     name: 'Basketball',
    //     createdAt: '2023-11-04 00:10:10.112',
    //     thumbnail:
    //       'https://images.unsplash.com/photo-1627627256672-027a4613d028?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D',
    //     slug: 'basketball',
    //   },
    //   {
    //     id: 3,
    //     name: 'Car Sport',
    //     createdAt: '2023-11-04 00:10:10.126',
    //     thumbnail:
    //       'https://static.automotor.vn/images/upload/2021/06/16/lambo.jpeg',
    //     slug: 'car-sport',
    //   },
    //   {
    //     id: 4,
    //     name: 'Table Tennis',
    //     createdAt: '2023-11-04 00:10:10.135',
    //     thumbnail:
    //       'https://static.toiimg.com/thumb/resizemode-4,width-1200,height-900,msid-100824676/100824676.jpg',
    //     slug: 'table-tennis',
    //   },
    //   {
    //     id: 5,
    //     name: 'Tennis',
    //     createdAt: '2023-11-04 00:10:10.144',
    //     thumbnail:
    //       'https://cdn.britannica.com/57/183257-050-0BA11B4B/Roger-Federer-2012.jpg',
    //     slug: 'tennis',
    //   },
    //   {
    //     id: 6,
    //     name: 'Swimming',
    //     createdAt: '2023-11-04 00:10:22.294',
    //     thumbnail:
    //       'https://cdn.britannica.com/01/193601-050-F8F18A9B/Katie-Ledecky-American-lead-way-women-world-2016.jpg',
    //     slug: 'swimming',
    //   },
    //   {
    //     id: 7,
    //     name: 'Cycling',
    //     createdAt: '2023-11-04 00:10:34.812',
    //     thumbnail:
    //       'https://s3.amazonaws.com/usac-craft-uploads-production/assets/Road-Header.jpg',
    //     slug: 'cycling',
    //   },
    // ];

    // for (const category of sampleCategories) {
    //   await this.prismaService.category.create({
    //     data: {
    //       id: category.id,
    //       name: category.name,
    //       slug: category.slug,
    //       thumbnail: category.thumbnail,
    //     },
    //   });
    // }

    const categories = await this.prismaService.category.findMany({});

    return PlainToInstanceList(CategoryRespDto, categories);
  }
}
