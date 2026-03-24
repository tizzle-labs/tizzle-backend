import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any): Promise<UserResponseDto> {
    return this.usersService.findByWallet(user.walletAddress);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(user.walletAddress, updateDto);
  }

  @Get(':walletAddress')
  @ApiOperation({ summary: 'Get user by wallet address' })
  async getUser(
    @Param('walletAddress') walletAddress: string,
  ): Promise<UserResponseDto> {
    return this.usersService.findByWallet(walletAddress);
  }
}
