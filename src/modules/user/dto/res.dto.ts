import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { PaginationRespDto } from 'src/base/dto';
import { PlainToInstanceList } from 'src/helpers';
import { EUserModel } from 'src/modules/user/model/user.model';
export class GetMyVotedPostIdsRespDto {
  @Expose()
  @ApiProperty({ type: [Number] })
  upvotedPostIds: number[];

  @Expose()
  @ApiProperty({ type: [Number] })
  downvotedPostIds: number[];
}

export class PaginatedGetUsersRespDto extends PaginationRespDto {
  @Expose()
  @ApiProperty({ type: [EUserModel] })
  @Transform(({ obj }) => PlainToInstanceList(EUserModel, obj?.users))
  values: EUserModel[];
}
