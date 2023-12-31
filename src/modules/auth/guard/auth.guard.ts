import { AuthGuard } from '@nestjs/passport';

export class UserGuard extends AuthGuard('user') {
  constructor() {
    super();
  }
}

export class ModeratorGuard extends AuthGuard('moderator') {
  constructor() {
    super();
  }
}

export class EditorGuard extends AuthGuard('editor') {
  constructor() {
    super();
  }
}

export class AdminGuard extends AuthGuard('admin') {
  constructor() {
    super();
  }
}
