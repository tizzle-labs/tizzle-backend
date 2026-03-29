import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import {
  CreateRegistrationDto,
  UpdateRegistrationDto,
} from './dto/registration.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Registrations')
@ApiBearerAuth()
@Controller('registrations')
export class RegistrationsController {
  constructor(private registrationsService: RegistrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create registration' })
  async create(@CurrentUser() user: any, @Body() dto: CreateRegistrationDto) {
    return this.registrationsService.create(user.walletAddress, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get registrations by event or user' })
  async findAll(
    @Query('eventPda') eventPda?: string,
    @Query('userWallet') userWallet?: string,
  ) {
    if (eventPda) {
      return this.registrationsService.findByEvent(eventPda);
    }
    if (userWallet) {
      return this.registrationsService.findByUser(userWallet);
    }
    return [];
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my registrations' })
  async findMy(@CurrentUser() user: any) {
    return this.registrationsService.findByUser(user.walletAddress);
  }

  @Get(':registrationPda')
  @ApiOperation({ summary: 'Get registration by PDA' })
  async findOne(@Param('registrationPda') registrationPda: string) {
    return this.registrationsService.findByPda(registrationPda);
  }

  @Put(':registrationPda')
  @ApiOperation({ summary: 'Update registration' })
  async update(
    @CurrentUser() user: any,
    @Param('registrationPda') registrationPda: string,
    @Body() dto: UpdateRegistrationDto,
  ) {
    return this.registrationsService.update(
      registrationPda,
      user.walletAddress,
      dto,
    );
  }
}
