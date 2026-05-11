import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eventAnalytics } from '../../database/schema/analytics.schema';
import { events } from '../../database/schema/events.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Auto-generate analytics snapshot from current event metrics.
   * Called internally after registration, check-in, or refund events.
   */
  async createSnapshotForEvent(eventPda: string) {
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.eventPda, eventPda))
      .limit(1);

    if (!event) return;

    const attendanceRate =
      event.totalRegistered > 0
        ? Math.round((event.totalCheckedIn / event.totalRegistered) * 10000) // stored as percentage * 100
        : 0;

    await this.db.insert(eventAnalytics).values({
      eventPda,
      snapshotTime: new Date(),
      totalRegistered: event.totalRegistered,
      totalCheckedIn: event.totalCheckedIn,
      totalRefunded: event.totalRefunded,
      tvlAmount: event.totalStaked,
      attendanceRate,
    });
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
