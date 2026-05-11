import { Module } from '@nestjs/common';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { SolanaModule } from '../solana/solana.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [SolanaModule, AnalyticsModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
