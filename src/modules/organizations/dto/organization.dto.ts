import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'ABC123...' })
  @IsString()
  @IsNotEmpty()
  organizationPda: string;

  @ApiProperty({ example: 'DEF456...' })
  @IsString()
  @IsNotEmpty()
  treasuryAddress: string;

  @ApiProperty({ example: 'Tech Conference Organizers' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'We organize tech events' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.jpg' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'techconf' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  twitter?: string;

  @ApiPropertyOptional({ example: 'techconf' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  discord?: string;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  twitter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  discord?: string;
}
