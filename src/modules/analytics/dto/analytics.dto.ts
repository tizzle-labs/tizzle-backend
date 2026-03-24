import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateAnalyticsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventPda: string;

  @ApiProperty()
  @IsDateString()
  snapshotTime: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalRegistered: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalCheckedIn: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalRefunded: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  tvlAmount: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  attendanceRate: number;
}

export class AnalyticsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventPda: string;

  @ApiProperty()
  snapshotTime: Date;

  @ApiProperty()
  totalRegistered: number;

  @ApiProperty()
  totalCheckedIn: number;

  @ApiProperty()
  totalRefunded: number;

  @ApiProperty()
  tvlAmount: number;

  @ApiProperty()
  attendanceRate: number;

  @ApiProperty()
  createdAt: Date;
}
