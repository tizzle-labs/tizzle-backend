import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  async findAll(@Query('organizationPda') organizationPda?: string) {
    if (organizationPda) {
      return this.eventsService.findByOrganization(organizationPda);
    }
    return this.eventsService.findAll();
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
