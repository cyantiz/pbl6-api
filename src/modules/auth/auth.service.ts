import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, user } from '@prisma/client';
import * as argon from 'argon2';
import { pick } from 'lodash';
import { ErrorMessages, genRandomString, PlainToInstance } from 'src/helpers';
import { MailService } from 'src/modules/mail/mail.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { EUserMe } from './auth.entity';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  RequestResetPasswordDto,
  ResetPasswordDto,
  VerifyUserDto,
} from './dto/req.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}

  private readonly jwtSecret = this.config.get('JWT_SECRET');

  async register(dto: RegisterDto) {
    const hashedPassword = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: hashedPassword,
          name: dto.name,
          verifyToken: genRandomString(20),
          avatarUrl: this.config.get('defaultAvatar'),
        },
      });

      return this.signToken(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (!user)
      throw new ForbiddenException(ErrorMessages.AUTH.CREDENTIALS_INCORRECT);
    if (user.bannedAt)
      throw new ForbiddenException(ErrorMessages.AUTH.USER_BANNED);

    const passwordMatches = await argon.verify(user.password, dto.password);

    if (!passwordMatches)
      throw new ForbiddenException(ErrorMessages.AUTH.CREDENTIALS_INCORRECT);

    return this.signToken(user);
  }

  async verify(
    query: VerifyUserDto,
    options: {
      email: string;
      username: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: options.username,
      },
      select: {
        verifyToken: true,
      },
    });

    if (query.token === user.verifyToken) {
      await this.prisma.user.update({
        where: {
          username: options.username,
        },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      return 'User verified successfully';
    }

    return 'Verify user failed';
  }

  async resetPasswordRequest(dto: RequestResetPasswordDto): Promise<void> {
    const resetToken = genRandomString(10);

    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (!user) return;

    await this.prisma.user.update({
      data: {
        resetToken: resetToken,
      },
      where: {
        email: dto.email,
      },
    });

    await this.mailService.sendResetPasswordEmail(
      {
        email: user.email,
        name: user.name,
      },
      resetToken,
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    if (!dto.token)
      throw new BadRequestException(ErrorMessages.AUTH.INVALID_TOKEN);

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
      },
    });

    if (!user) throw new BadRequestException(ErrorMessages.AUTH.INVALID_TOKEN);

    const hashedPassword = await argon.hash(dto.password);

    await this.prisma.user.update({
      data: {
        password: hashedPassword,
        resetToken: null,
      },
      where: {
        email: user.email,
      },
    });
  }

  async signToken(
    user: user,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const pickedFields: string[] = ['id', 'email', 'name', 'role', 'username'];
    const payload = pick(user, pickedFields);

    const accessToken: string = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: this.jwtSecret,
    });

    const refreshToken: string = await this.jwt.signAsync(payload, {
      expiresIn: '30d',
      secret: this.jwtSecret,
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const payload = await this.jwt.verify(dto.refreshToken, {
      secret: this.jwtSecret,
    });

    delete payload.iat;
    delete payload.exp;

    const accessToken: string = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: this.jwtSecret,
    });

    return {
      accessToken: accessToken,
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return PlainToInstance(EUserMe, user);
  }
}
