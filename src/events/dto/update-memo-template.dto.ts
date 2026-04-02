import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemoTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  template: string;
}
