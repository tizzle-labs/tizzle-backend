import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(ownerWalletAddress: string, dto: CreateOrganizationDto) {
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

  async update(organizationPda: string, dto: UpdateOrganizationDto) {
    const [updated] = await this.db
      .update(organizations)
      .set(dto)
      .where(eq(organizations.organizationPda, organizationPda))
      .returning();

    if (!updated) {
      throw new NotFoundException('Organization not found');
    }

    return updated;
  }
}
