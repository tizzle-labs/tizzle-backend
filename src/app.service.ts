import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CacheService } from './modules/cache/cache.service';
import { SolanaService } from './modules/solana/solana.service';
import { DATABASE_CONNECTION } from './database/database.module';
import { sql } from 'drizzle-orm';

@Injectable()
export class AppService {
  constructor(
    private _configService: ConfigService,
    @Inject(DATABASE_CONNECTION) private _db: NodePgDatabase,
    private _cacheService: CacheService,
    private _solanaService: SolanaService,
  ) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this._configService.get('app.nodeEnv'),
    };
  }

  async getReadiness() {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      solana: await this.checkSolana(),
    };

    const allHealthy = Object.values(checks).every((status) => status === 'ok');

    return {
      status: allHealthy ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  private async checkDatabase(): Promise<string> {
    try {
      await this._db.execute(sql`SELECT 1`);
      return 'ok';
    } catch {
      return 'error';
    }
  }

  private async checkRedis(): Promise<string> {
    try {
      const isHealthy = await this._cacheService.isHealthy();
      return isHealthy ? 'ok' : 'error';
    } catch {
      return 'error';
    }
  }

  private async checkSolana(): Promise<string> {
    try {
      const connection = this._solanaService.getConnection();
      await connection.getVersion();
      return 'ok';
    } catch {
      return 'error';
    }
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
