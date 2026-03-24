import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'johndoe' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscores and hyphens',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'Blockchain enthusiast' })
  @IsOptional()
  @IsString()
  bio?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  walletAddress: string;

  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
