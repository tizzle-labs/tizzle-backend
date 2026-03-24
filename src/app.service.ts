import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private _configService: ConfigService) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this._configService.get('app.nodeEnv'),
    };
  }

  getInfo() {
    return {
      name: 'Tizzle API',
      version: '1.0.0',
      description: 'Refundable Staking Ticketing Protocol on Solana',
      network: this._configService.get('solana.network'),
      documentation: '/docs',
    };
  }
}
