import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, desc, sql, or } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { events } from '../../database/schema/events.schema';
import { organizations } from '../../database/schema/organizations.schema';
import { users } from '../../database/schema/users.schema';
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

    // Step 5: Increment organization totalEvents
    await this.db.execute(
      sql`UPDATE organizations SET total_events = total_events + 1, updated_at = NOW() WHERE organization_pda = ${dto.organizationPda}`,
    );

    return event;
  }

  private get eventWithOrgFields() {
    return {
      id: events.id,
      eventPda: events.eventPda,
      eventId: events.eventId,
      organizationPda: events.organizationPda,
      organizerWalletAddress: events.organizerWalletAddress,
      gatekeeperAddress: events.gatekeeperAddress,
      title: events.title,
      description: events.description,
      imageUrl: events.imageUrl,
      venueImageUrl: events.venueImageUrl,
      location: events.location,
      locationDetail: events.locationDetail,
      latitude: events.latitude,
      longitude: events.longitude,
      category: events.category,
      tags: events.tags,
      capacity: events.capacity,
      stakeAmount: events.stakeAmount,
      stakeTokenMint: events.stakeTokenMint,
      stakeTokenSymbol: events.stakeTokenSymbol,
      stakeTokenDecimals: events.stakeTokenDecimals,
      hostFeeEnabled: events.hostFeeEnabled,
      hostFeePercent: events.hostFeePercent,
      platformFeePaid: events.platformFeePaid,
      startTime: events.startTime,
      endTime: events.endTime,
      unlockTime: events.unlockTime,
      totalRegistered: events.totalRegistered,
      totalCheckedIn: events.totalCheckedIn,
      totalStaked: events.totalStaked,
      totalRefunded: events.totalRefunded,
      organizerWithdrawn: events.organizerWithdrawn,
      isPublished: events.isPublished,
      isFeatured: events.isFeatured,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      organizationName: organizations.name,
      organizationAvatarUrl: organizations.avatarUrl,
    };
  }

  // Upcoming events first (soonest at top), then settlement events (most recent at top)
  private get startTimeOrder() {
    return [
      sql`CASE WHEN ${events.startTime} >= NOW() THEN 0 ELSE 1 END`,
      sql`CASE WHEN ${events.startTime} >= NOW() THEN EXTRACT(EPOCH FROM ${events.startTime}) ELSE -EXTRACT(EPOCH FROM ${events.startTime}) END`,
    ] as const;
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'created_at' | 'start_time';
    category?: string;
  }) {
    const limit = Math.min(options?.limit ?? 20, 100);
    const offset = options?.offset ?? 0;
    const byStartTime = options?.sortBy === 'start_time';
    const whereClause = options?.category
      ? sql`LOWER(${events.category}) = LOWER(${options.category})`
      : undefined;

    return this.db
      .select(this.eventWithOrgFields)
      .from(events)
      .leftJoin(organizations, eq(events.organizationPda, organizations.organizationPda))
      .where(whereClause)
      .orderBy(...(byStartTime ? this.startTimeOrder : [desc(events.createdAt)]))
      .limit(limit)
      .offset(offset);
  }

  async findForUser(walletAddress: string, options?: { limit?: number; offset?: number }) {
    const [user] = await this.db
      .select({ interests: users.interests })
      .from(users)
      .where(eq(users.walletAddress, walletAddress))
      .limit(1);

    const interests = (user?.interests as string[] | null) ?? [];
    const limit = Math.min(options?.limit ?? 20, 100);
    const offset = options?.offset ?? 0;
    const whereClause =
      interests.length > 0
        ? or(...interests.map((i) => sql`LOWER(${events.category}) = LOWER(${i})`))
        : undefined;

    return this.db
      .select(this.eventWithOrgFields)
      .from(events)
      .leftJoin(organizations, eq(events.organizationPda, organizations.organizationPda))
      .where(whereClause)
      .orderBy(...this.startTimeOrder)
      .limit(limit)
      .offset(offset);
  }

  async findByPda(eventPda: string) {
    const [event] = await this.db
      .select(this.eventWithOrgFields)
      .from(events)
      .leftJoin(
        organizations,
        eq(events.organizationPda, organizations.organizationPda),
      )
      .where(eq(events.eventPda, eventPda))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findByOrganization(organizationPda: string) {
    return this.db
      .select(this.eventWithOrgFields)
      .from(events)
      .leftJoin(
        organizations,
        eq(events.organizationPda, organizations.organizationPda),
      )
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
    if (dto.venueImageUrl !== undefined)
      allowedUpdates.venueImageUrl = dto.venueImageUrl;
    if (dto.location !== undefined) allowedUpdates.location = dto.location;
    if (dto.isPublished !== undefined)
      allowedUpdates.isPublished = dto.isPublished;
    if (dto.isFeatured !== undefined)
      allowedUpdates.isFeatured = dto.isFeatured;
    if (dto.organizerWithdrawn !== undefined)
      allowedUpdates.organizerWithdrawn = dto.organizerWithdrawn;

    const [updated] = await this.db
      .update(events)
      .set(allowedUpdates)
      .where(eq(events.eventPda, eventPda))
      .returning();

    return updated;
  }
}
