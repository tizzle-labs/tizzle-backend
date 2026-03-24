import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { registrations } from '../../database/schema/registrations.schema';
import {
  CreateRegistrationDto,
  UpdateRegistrationDto,
} from './dto/registration.dto';

@Injectable()
export class RegistrationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(attendeeWalletAddress: string, dto: CreateRegistrationDto) {
    const [registration] = await this.db
      .insert(registrations)
      .values({
        ...dto,
        attendeeWalletAddress,
        registeredAt: new Date(dto.registeredAt),
      })
      .returning();

    return registration;
  }

  async findByEvent(eventPda: string) {
    return this.db
      .select()
      .from(registrations)
      .where(eq(registrations.eventPda, eventPda));
  }

  async findByUser(attendeeWalletAddress: string) {
    return this.db
      .select()
      .from(registrations)
      .where(eq(registrations.attendeeWalletAddress, attendeeWalletAddress));
  }

  async findByPda(registrationPda: string) {
    const [registration] = await this.db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationPda, registrationPda))
      .limit(1);

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async update(registrationPda: string, dto: UpdateRegistrationDto) {
    const updateData: any = { ...dto, updatedAt: new Date() };

    if (dto.checkedInAt) {
      updateData.checkedInAt = new Date(dto.checkedInAt);
    }
    if (dto.refundedAt) {
      updateData.refundedAt = new Date(dto.refundedAt);
    }

    const [updated] = await this.db
      .update(registrations)
      .set(updateData)
      .where(eq(registrations.registrationPda, registrationPda))
      .returning();

    if (!updated) {
      throw new NotFoundException('Registration not found');
    }

    return updated;
  }
}
