import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { badges, userBadges } from '../../database/schema/badges.schema';
import { CreateBadgeDto, AwardBadgeDto } from './dto/badge.dto';

@Injectable()
export class BadgesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(dto: CreateBadgeDto) {
    const [badge] = await this.db.insert(badges).values(dto).returning();
    return badge;
  }

  async award(dto: AwardBadgeDto) {
    const [userBadge] = await this.db
      .insert(userBadges)
      .values({
        badgeId: dto.badgeId,
        walletAddress: dto.walletAddress,
      })
      .returning();

    return userBadge;
  }

  async findAll() {
    return this.db.select().from(badges);
  }

  async findByCode(code: string) {
    const [badge] = await this.db
      .select()
      .from(badges)
      .where(eq(badges.code, code))
      .limit(1);

    if (!badge) {
      throw new NotFoundException('Badge not found');
    }

    return badge;
  }

  async findUserBadges(walletAddress: string) {
    return this.db
      .select()
      .from(userBadges)
      .where(eq(userBadges.walletAddress, walletAddress));
  }
}
