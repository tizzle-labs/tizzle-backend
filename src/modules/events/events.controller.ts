import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create event' })
  async create(@CurrentUser() user: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.walletAddress, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'organizationPda', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['created_at', 'start_time'] })
  async findAll(
    @Query('organizationPda') organizationPda?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sortBy') sortBy?: 'created_at' | 'start_time',
  ) {
    if (organizationPda) {
      return this.eventsService.findByOrganization(organizationPda);
    }
    return this.eventsService.findAll({ limit, offset, sortBy });
  }

  @Get(':eventPda')
  @ApiOperation({ summary: 'Get event by PDA' })
  async findOne(@Param('eventPda') eventPda: string) {
    return this.eventsService.findByPda(eventPda);
  }

  @Put(':eventPda')
  @ApiOperation({ summary: 'Update event' })
  async update(
    @CurrentUser() user: any,
    @Param('eventPda') eventPda: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(eventPda, user.walletAddress, dto);
  }
}
