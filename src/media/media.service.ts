import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { media } from '@prisma/client';
import { FirebaseService } from 'src/modules/firebase/firebase.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdateMediaDto } from './dto/req.dto';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly configService: ConfigService,
  ) {}

  async create(params: { file: Express.Multer.File }) {
    const { file } = params;

    const { file: firebaseFile, fileName } =
      await this.firebaseService.uploadFile({
        buffer: file.buffer,
        folder: 'media',
      });

    const media: media = await this.prisma.media.create({
      data: {
        fileName,
      },
    });

    return media;
  }

  async getMediaUrl(id: number) {
    const media: media = await this.prisma.media.findUnique({
      where: {
        id,
      },
    });

    return this.getMediaUrlFromFileName(media.fileName);
  }

  getMediaUrlFromFileName(fileName: string) {
    const firebaseBucket = this.configService.get<string>(
      'firebase.storageBucketName',
    );
    const url = `https://firebasestorage.googleapis.com/v0/b/${firebaseBucket}/o/media%2F${fileName}?alt=media`;

    return url;
  }

  findAll() {
    return `This action returns all media`;
  }

  findOne(id: number) {
    return `This action returns a #${id} media`;
  }

  update(id: number, dto: UpdateMediaDto) {
    return `This action updates a #${id} media`;
  }

  remove(id: number) {
    return `This action removes a #${id} media`;
  }
}
