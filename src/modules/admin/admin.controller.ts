import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@Controller('admin')
@ApiTags('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}
}
