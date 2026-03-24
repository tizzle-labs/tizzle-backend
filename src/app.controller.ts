import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint for load balancers' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return this._appService.getHealth();
  }

  @Public()
  @Get('readiness')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  getReadiness() {
    return this._appService.getReadiness();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'API information' })
  @ApiResponse({ status: 200, description: 'API info retrieved' })
  getInfo() {
    return this._appService.getInfo();
  }
}
