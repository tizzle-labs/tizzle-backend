import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GenerateNonceDto, VerifySignatureDto } from './dto/auth.dto';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Public()
  @Post('nonce')
  @ApiOperation({ summary: 'Generate nonce for wallet authentication' })
  @ApiResponse({ status: 200, description: 'Nonce generated successfully' })
  async generateNonce(@Body() dto: GenerateNonceDto) {
    return this._authService.generateNonce(dto.walletAddress);
  }

  @Public()
  @Post('verify')
  @ApiOperation({ summary: 'Verify signature and login' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid signature or nonce' })
  async verifySignature(@Body() dto: VerifySignatureDto) {
    return this._authService.verifyAndLogin(
      dto.walletAddress,
      dto.signature,
      dto.message,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refreshToken(@CurrentUser('walletAddress') walletAddress: string) {
    return this._authService.refreshToken(walletAddress);
  }
}
