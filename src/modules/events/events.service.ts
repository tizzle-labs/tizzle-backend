import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { events } from '../../database/schema/events.schema';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(organizerWalletAddress: string, dto: CreateEventDto) {
    const [event] = await this.db
      .insert(events)
      .values({
        ...dto,
        organizerWalletAddress,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        unlockTime: new Date(dto.unlockTime),
      })
      .returning();

    return event;
  }

  async findAll() {
    return this.db.select().from(events).orderBy(desc(events.createdAt));
  }

  async findByPda(eventPda: string) {
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.eventPda, eventPda))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findByOrganization(organizationPda: string) {
    return this.db
      .select()
      .from(events)
      .where(eq(events.organizationPda, organizationPda))
      .orderBy(desc(events.createdAt));
  }

  async update(eventPda: string, dto: UpdateEventDto) {
    const [updated] = await this.db
      .update(events)
      .set(dto)
      .where(eq(events.eventPda, eventPda))
      .returning();

    if (!updated) {
      throw new NotFoundException('Event not found');
    }

    return updated;
  }
}
