import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  registrationPda: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventPda: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  stakeAmount: number;

  @ApiProperty()
  @IsDateString()
  registeredAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionSignature?: string;
}

export class UpdateRegistrationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  checkedIn?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  refunded?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  checkedInAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  refundedAt?: string;
}
