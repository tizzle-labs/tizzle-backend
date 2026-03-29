import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { users } from '../../database/schema/users.schema';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async findByWallet(walletAddress: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findById(id: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(walletAddress: string, updateDto: UpdateUserDto) {
    // Only allow updating profile fields, not wallet address or other credentials
    const allowedUpdates: any = {};

    if (updateDto.username !== undefined)
      allowedUpdates.username = updateDto.username;
    if (updateDto.email !== undefined) allowedUpdates.email = updateDto.email;
    if (updateDto.name !== undefined) allowedUpdates.name = updateDto.name;
    if (updateDto.bio !== undefined) allowedUpdates.bio = updateDto.bio;
    if (updateDto.avatarUrl !== undefined)
      allowedUpdates.avatarUrl = updateDto.avatarUrl;

    allowedUpdates.updatedAt = new Date();

    const [updated] = await this.db
      .update(users)
      .set(allowedUpdates)
      .where(eq(users.walletAddress, walletAddress))
      .returning();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }
}
