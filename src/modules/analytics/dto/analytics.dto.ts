import { ApiProperty } from '@nestjs/swagger';

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
