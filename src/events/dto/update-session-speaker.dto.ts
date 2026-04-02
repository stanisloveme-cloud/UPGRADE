import { IsBoolean, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSessionSpeakerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  needs_zoom?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasPresentation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerComment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  programThesis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  newsletterQuote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presenceStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companySnapshot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  positionSnapshot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifiedEmail?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifiedTg?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  exportToWebsite?: boolean;
}
