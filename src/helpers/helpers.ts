import { plainToInstance } from 'class-transformer';

export const sensitiveFields = [
  'bannedAt',
  'verifiedAt',
  'isVerified',
  'createdAt',
  'role',
  'password',
  'email',
  'id',
];

export const ErrorMessages = {
  AUTH: {
    USER_BANNED: 'This user has been banned',
    CREDENTIALS_INCORRECT: 'Credentials incorrect',
    INVALID_TOKEN: 'Invalid token',
  },
  NOTIFICATION: {
    NOTI_NOT_FOUND: 'Notification not found',
  },
  REPORT: {
    REPORT_NOT_FOUND: 'Report not found',
    USERNAME_INVALID:
      "The report can't not be created, please verify the target username and reporter username",
  },
  USER: {
    USER_NOT_FOUND: 'User not found',
    USER_INVALID: 'User invalid',
    USER_INACTIVE: 'Please activate this user first',
  },
  POST: {
    POST_NOT_FOUND: 'Post not found',
  },
};

export const APISummaries = {
  UNAUTH: 'No token required',
  USER: 'User permission required',
  ADMIN: 'Admin permission required',
  MODERATOR: 'Moderator permission requried',
};

export function genRandomString(length = 6): string {
  let random = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength: number = characters.length;
  let counter = 0;

  while (counter < length) {
    random += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return random;
}

export function PlainToInstance(model: any, response: any): any {
  return plainToInstance(model, response, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
    strategy: 'excludeAll',
  });
}
