import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eventAnalytics } from '../../database/schema/analytics.schema';
import { CreateAnalyticsDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(dto: CreateAnalyticsDto) {
    const [analytics] = await this.db
      .insert(eventAnalytics)
      .values({
        ...dto,
        snapshotTime: new Date(dto.snapshotTime),
      })
      .returning();

    return analytics;
  }

  async findByEvent(eventPda: string) {
    return this.db
      .select()
      .from(eventAnalytics)
      .where(eq(eventAnalytics.eventPda, eventPda))
      .orderBy(desc(eventAnalytics.snapshotTime));
  }

  async getLatestByEvent(eventPda: string) {
    const [latest] = await this.db
      .select()
      .from(eventAnalytics)
      .where(eq(eventAnalytics.eventPda, eventPda))
      .orderBy(desc(eventAnalytics.snapshotTime))
      .limit(1);

    if (!latest) {
      throw new NotFoundException('Analytics not found for this event');
    }

    return latest;
  }
}
