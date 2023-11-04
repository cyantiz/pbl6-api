export const APISummaries = {
  UNAUTH: 'No token required',
  USER: 'User permission required',
  ADMIN: 'Admin permission required',
  MODERATOR: 'Moderator permission requried',
};

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
