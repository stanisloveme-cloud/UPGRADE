import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SessionSpeakerDto {
    @IsNotEmpty()
    @IsNumber()
    speakerId: number;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    companySnapshot?: string;

    @IsOptional()
    @IsString()
    positionSnapshot?: string;

    @IsOptional()
    @IsString()
    presentationTitle?: string;

    @IsOptional()
    @IsString()
    presentationUrl?: string;
}

export class SessionQuestionDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    body?: string;
}

export class SessionBriefingDto {
    @IsOptional()
    moderatorId?: number;

    @IsNotEmpty()
    datetime: string | Date;

    @IsOptional()
    @IsBoolean()
    isDone?: boolean;

    @IsOptional()
    @IsString()
    link?: string;

    @IsOptional()
    @IsString()
    comment?: string;
}

export class CreateSessionDto {
    @IsNotEmpty()
    @IsNumber()
    trackId: number;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    startTime: string;

    @IsNotEmpty()
    @IsString()
    endTime: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SessionSpeakerDto)
    speakers?: SessionSpeakerDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SessionQuestionDto)
    questions?: SessionQuestionDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SessionBriefingDto)
    briefings?: SessionBriefingDto[];

    @IsOptional()
    @IsBoolean()
    ignoreConflicts?: boolean;
}
