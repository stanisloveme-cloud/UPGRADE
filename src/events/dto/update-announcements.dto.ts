import { IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAnnouncementsDto {
  @ApiProperty({ isArray: true, type: Object })
  @IsArray()
  updates: any[];
}
