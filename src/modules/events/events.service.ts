import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { events } from '../../database/schema/events.schema';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { SolanaService } from '../solana/solana.service';

@Injectable()
export class EventsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
    private solanaService: SolanaService,
  ) {}

  async create(organizerWalletAddress: string, dto: CreateEventDto) {
    // Step 1: Verify event PDA exists on-chain and matches the organization
    const verification = await this.solanaService.verifyEventPda(
      dto.eventPda,
      dto.organizationPda,
    );

    if (!verification.valid) {
      throw new BadRequestException(
        `On-chain verification failed: ${verification.error}`,
      );
    }

    // Step 2: Check if event PDA already exists in database (prevent duplicate)
    const existing = await this.db
      .select()
      .from(events)
      .where(eq(events.eventPda, dto.eventPda))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(
        'Event with this PDA already exists in database',
      );
    }

    // Step 3: Verify organizer matches on-chain data
    const onChainEvent = verification.data;
    if (
      onChainEvent.organizer.toString() !== organizerWalletAddress &&
      onChainEvent.organization.toString() !== dto.organizationPda
    ) {
      throw new BadRequestException(
        'Organizer wallet or organization does not match on-chain data',
      );
    }

    // Step 4: Create event in database
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

  async update(
    eventPda: string,
    organizerWalletAddress: string,
    dto: UpdateEventDto,
  ) {
    // Step 1: Find existing event
    const [existing] = await this.db
      .select()
      .from(events)
      .where(eq(events.eventPda, eventPda))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    // Step 2: Verify ownership - only organizer can update
    if (existing.organizerWalletAddress !== organizerWalletAddress) {
      throw new ForbiddenException(
        'Only the event organizer can update this event',
      );
    }

    // Step 3: Update only allowed fields (prevent updating critical blockchain data)
    const allowedUpdates: any = { updatedAt: new Date() };
    if (dto.title !== undefined) allowedUpdates.title = dto.title;
    if (dto.description !== undefined)
      allowedUpdates.description = dto.description;
    if (dto.imageUrl !== undefined) allowedUpdates.imageUrl = dto.imageUrl;
    if (dto.location !== undefined) allowedUpdates.location = dto.location;
    if (dto.isPublished !== undefined)
      allowedUpdates.isPublished = dto.isPublished;
    if (dto.isFeatured !== undefined)
      allowedUpdates.isFeatured = dto.isFeatured;

    const [updated] = await this.db
      .update(events)
      .set(allowedUpdates)
      .where(eq(events.eventPda, eventPda))
      .returning();

    return updated;
  }
}
