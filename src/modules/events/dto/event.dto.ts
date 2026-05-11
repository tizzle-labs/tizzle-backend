import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { EVENT_CATEGORIES } from '../../../common/constants/event-categories';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventPda: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationPda: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gatekeeperAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  venueImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationDetail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ enum: EVENT_CATEGORIES })
  @IsOptional()
  @IsIn([...EVENT_CATEGORIES])
  category?: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  stakeAmount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stakeTokenMint: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stakeTokenSymbol?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  stakeTokenDecimals?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hostFeeEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  hostFeePercent?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  platformFeePaid: number;

  @ApiProperty()
  @IsDateString()
  startTime: string;

  @ApiProperty()
  @IsDateString()
  endTime: string;

  @ApiProperty()
  @IsDateString()
  unlockTime: string;
}

export class UpdateEventDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  venueImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  organizerWithdrawn?: boolean;
}
