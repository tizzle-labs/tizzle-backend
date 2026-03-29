import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create organization' })
  async create(@CurrentUser() user: any, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(user.walletAddress, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  async findAll() {
    return this.organizationsService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my organizations' })
  async findMy(@CurrentUser() user: any) {
    return this.organizationsService.findByOwner(user.walletAddress);
  }

  @Get(':organizationPda')
  @ApiOperation({ summary: 'Get organization by PDA' })
  async findOne(@Param('organizationPda') organizationPda: string) {
    return this.organizationsService.findByPda(organizationPda);
  }

  @Put(':organizationPda')
  @ApiOperation({ summary: 'Update organization' })
  async update(
    @CurrentUser() user: any,
    @Param('organizationPda') organizationPda: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(
      organizationPda,
      user.walletAddress,
      dto,
    );
  }
}
