import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class UserStrategy extends PassportStrategy(Strategy, 'user') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { email: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
        bannedAt: null,
      },
    });

    if (!user) return null;

    delete user.password;
    if (
      user.role === Role.USER ||
      user.role === Role.EDITOR ||
      user.role === Role.ADMIN ||
      user.role === Role.MODERATOR
    )
      return user;
  }
}

@Injectable()
export class EditorStrategy extends PassportStrategy(Strategy, 'editor') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { email: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
        bannedAt: null,
      },
    });

    if (!user) return null;

    delete user.password;
    if (
      user.role === Role.EDITOR ||
      user.role === Role.ADMIN ||
      user.role === Role.MODERATOR
    )
      return user;
  }
}

@Injectable()
export class ModeratorStrategy extends PassportStrategy(Strategy, 'moderator') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { email: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
        bannedAt: null,
      },
    });

    if (!user) return null;

    delete user.password;
    if (user.role === Role.ADMIN || user.role === Role.MODERATOR) return user;
  }
}

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { email: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
        bannedAt: null,
      },
    });

    if (!user) return null;

    delete user.password;
    if (user.role === Role.ADMIN) return user;
  }
}
