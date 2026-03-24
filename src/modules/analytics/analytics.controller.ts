import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsDto, AnalyticsResponseDto } from './dto/analytics.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post()
  @ApiOperation({ summary: 'Create analytics snapshot' })
  async create(@Body() dto: CreateAnalyticsDto): Promise<AnalyticsResponseDto> {
    return this.analyticsService.create(dto);
  }

  @Get('event/:eventPda')
  @ApiOperation({ summary: 'Get analytics history for event' })
  async findByEvent(
    @Param('eventPda') eventPda: string,
  ): Promise<AnalyticsResponseDto[]> {
    return this.analyticsService.findByEvent(eventPda);
  }

  @Get('event/:eventPda/latest')
  @ApiOperation({ summary: 'Get latest analytics for event' })
  async getLatest(
    @Param('eventPda') eventPda: string,
  ): Promise<AnalyticsResponseDto> {
    return this.analyticsService.getLatestByEvent(eventPda);
  }
}
