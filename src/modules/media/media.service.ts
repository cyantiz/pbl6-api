import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { media } from '@prisma/client';
import { FirebaseService } from 'src/modules/firebase/firebase.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateMediaFromExternalURLDto, UpdateMediaDto } from './dto/req.dto';

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

  async createFromExternalUrl(params: CreateMediaFromExternalURLDto) {
    const { url, alt } = params;

    const media = await this.prisma.media.create({
      data: {
        externalUrl: url,
        alt,
      },
    });

    return media;
  }

  async getMediaUrl(mediaId: number): Promise<string>;
  async getMediaUrl(media: media): Promise<string>;
  async getMediaUrl(input: number | media): Promise<string> {
    if (typeof input === 'number') {
      const media: media = await this.prisma.media.findUnique({
        where: {
          id: input,
        },
      });
      return this.getMediaUrlFromFileName(media.fileName);
    } else {
      return this.getMediaUrlFromFileName(input.fileName);
    }
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
