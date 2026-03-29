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
import { registrations } from '../../database/schema/registrations.schema';
import {
  CreateRegistrationDto,
  UpdateRegistrationDto,
} from './dto/registration.dto';
import { SolanaService } from '../solana/solana.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
    private solanaService: SolanaService,
  ) {}

  async create(attendeeWalletAddress: string, dto: CreateRegistrationDto) {
    // Step 1: Verify registration PDA exists on-chain and matches event and attendee
    const verification = await this.solanaService.verifyRegistrationPda(
      dto.registrationPda,
      dto.eventPda,
      attendeeWalletAddress,
    );

    if (!verification.valid) {
      throw new BadRequestException(
        `On-chain verification failed: ${verification.error}`,
      );
    }

    // Step 2: Check if registration PDA already exists in database (prevent duplicate)
    const existing = await this.db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationPda, dto.registrationPda))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(
        'Registration with this PDA already exists in database',
      );
    }

    // Step 3: Verify stake amount matches on-chain data
    const onChainReg = verification.data;
    if (onChainReg.stakeAmount.toNumber() !== dto.stakeAmount) {
      throw new BadRequestException(
        'Stake amount does not match on-chain data',
      );
    }

    // Step 4: Create registration in database
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

  async update(
    registrationPda: string,
    attendeeWalletAddress: string,
    dto: UpdateRegistrationDto,
  ) {
    // Step 1: Find existing registration
    const [existing] = await this.db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationPda, registrationPda))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Registration not found');
    }

    // Step 2: Verify ownership - only attendee can update their own registration
    if (existing.attendeeWalletAddress !== attendeeWalletAddress) {
      throw new ForbiddenException('You can only update your own registration');
    }

    // Step 3: If updating check-in status, verify on-chain
    if (dto.checkedIn !== undefined && dto.checkedIn === true) {
      const checkInVerification = await this.solanaService.verifyCheckInStatus(
        existing.eventPda,
        attendeeWalletAddress,
      );

      if (!checkInVerification.valid) {
        throw new BadRequestException(
          `On-chain check-in verification failed: ${checkInVerification.error}`,
        );
      }

      if (!checkInVerification.checkedIn) {
        throw new BadRequestException(
          'Attendee has not checked in on-chain yet',
        );
      }
    }

    // Step 4: Update only allowed fields
    const updateData: any = { updatedAt: new Date() };

    // Only allow updating check-in and refund status
    if (dto.checkedIn !== undefined) {
      updateData.checkedIn = dto.checkedIn;
      if (dto.checkedIn && dto.checkedInAt) {
        updateData.checkedInAt = new Date(dto.checkedInAt);
      }
    }

    if (dto.refunded !== undefined) {
      updateData.refunded = dto.refunded;
      if (dto.refunded && dto.refundedAt) {
        updateData.refundedAt = new Date(dto.refundedAt);
      }
    }

    const [updated] = await this.db
      .update(registrations)
      .set(updateData)
      .where(eq(registrations.registrationPda, registrationPda))
      .returning();

    return updated;
  }
}
