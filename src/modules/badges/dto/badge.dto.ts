import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum BadgeType {
  ORGANIZER = 'organizer',
  ATTENDEE = 'attendee',
  SPECIAL = 'special',
}

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export class CreateBadgeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: BadgeType })
  @IsEnum(BadgeType)
  type: BadgeType;

  @ApiProperty({ enum: BadgeTier })
  @IsEnum(BadgeTier)
  tier: BadgeTier;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requirement: string;
}

export class AwardBadgeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  badgeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}
