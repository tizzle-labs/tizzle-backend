import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { organizations } from '../../database/schema/organizations.schema';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';
import { SolanaService } from '../solana/solana.service';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
    private solanaService: SolanaService,
  ) {}

  async create(ownerWalletAddress: string, dto: CreateOrganizationDto) {
    // Step 1: Verify organization PDA exists on-chain and matches the owner
    const verification = await this.solanaService.verifyOrganizationPda(
      dto.organizationPda,
      ownerWalletAddress,
    );

    if (!verification.valid) {
      throw new BadRequestException(
        `On-chain verification failed: ${verification.error}`,
      );
    }

    // Step 2: Check if organization PDA already exists in database (prevent duplicate)
    const existing = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.organizationPda, dto.organizationPda))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(
        'Organization with this PDA already exists in database',
      );
    }

    // Step 3: Create organization in database
    const [org] = await this.db
      .insert(organizations)
      .values({
        ...dto,
        ownerWalletAddress,
      })
      .returning();

    return org;
  }

  async findAll() {
    return this.db.select().from(organizations);
  }

  async findByPda(organizationPda: string) {
    const [org] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.organizationPda, organizationPda))
      .limit(1);

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async findByOwner(ownerWalletAddress: string) {
    return this.db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerWalletAddress, ownerWalletAddress));
  }

  async update(
    organizationPda: string,
    ownerWalletAddress: string,
    dto: UpdateOrganizationDto,
  ) {
    // Step 1: Find existing organization
    const [existing] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.organizationPda, organizationPda))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Organization not found');
    }

    // Step 2: Verify ownership - only owner can update
    if (existing.ownerWalletAddress !== ownerWalletAddress) {
      throw new ForbiddenException(
        'Only the organization owner can update this organization',
      );
    }

    // Step 3: Update only allowed fields (prevent updating critical fields)
    const allowedUpdates: any = { updatedAt: new Date() };
    if (dto.name !== undefined) allowedUpdates.name = dto.name;
    if (dto.description !== undefined)
      allowedUpdates.description = dto.description;
    if (dto.avatarUrl !== undefined) allowedUpdates.avatarUrl = dto.avatarUrl;
    if (dto.website !== undefined) allowedUpdates.website = dto.website;
    if (dto.twitter !== undefined) allowedUpdates.twitter = dto.twitter;
    if (dto.discord !== undefined) allowedUpdates.discord = dto.discord;

    const [updated] = await this.db
      .update(organizations)
      .set(allowedUpdates)
      .where(eq(organizations.organizationPda, organizationPda))
      .returning();

    return updated;
  }
}
