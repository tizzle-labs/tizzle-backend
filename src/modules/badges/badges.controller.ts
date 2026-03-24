import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { CreateBadgeDto, AwardBadgeDto } from './dto/badge.dto';

@ApiTags('Badges')
@ApiBearerAuth()
@Controller('badges')
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  @Post()
  @ApiOperation({ summary: 'Create badge' })
  async create(@Body() dto: CreateBadgeDto) {
    return this.badgesService.create(dto);
  }

  @Post('award')
  @ApiOperation({ summary: 'Award badge to user' })
  async award(@Body() dto: AwardBadgeDto) {
    return this.badgesService.award(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all badges' })
  async findAll() {
    return this.badgesService.findAll();
  }

  @Get('user/:walletAddress')
  @ApiOperation({ summary: 'Get user badges' })
  async findUserBadges(@Param('walletAddress') walletAddress: string) {
    return this.badgesService.findUserBadges(walletAddress);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get badge by code' })
  async findOne(@Param('code') code: string) {
    return this.badgesService.findByCode(code);
  }
}
