import { IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SpeakerSortUpdateItem {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsInt()
  sortOrder: number;
}

export class UpdateSessionSpeakersSortDto {
  @ApiProperty({ type: [SpeakerSortUpdateItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpeakerSortUpdateItem)
  updates: SpeakerSortUpdateItem[];
}
