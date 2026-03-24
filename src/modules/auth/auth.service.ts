import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { sign } from 'tweetnacl';
import bs58 from 'bs58';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '@/database/database.module';
import * as schema from '@/database/schema';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {}

  /**
   * Generate nonce for wallet authentication
   */
  async generateNonce(
    walletAddress: string,
  ): Promise<{ nonce: string; message: string }> {
    // Generate random nonce
    const nonce = randomBytes(32).toString('hex');

    // Check if user exists
    const [existingUser] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.walletAddress, walletAddress))
      .limit(1);

    if (existingUser) {
      // Update nonce for existing user
      await this.db
        .update(schema.users)
        .set({ nonce })
        .where(eq(schema.users.walletAddress, walletAddress));
    } else {
      // Create new user with nonce
      await this.db.insert(schema.users).values({
        walletAddress,
        nonce,
      });
    }

    // Cache nonce for 5 minutes
    await this.cacheService.set(`nonce:${walletAddress}`, nonce, 300);

    const message = `Sign this message to authenticate with Tizzle.\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;

    return { nonce, message };
  }

  /**
   * Verify signature and generate JWT token
   */
  async verifyAndLogin(
    walletAddress: string,
    signature: string,
    message: string,
  ): Promise<{ accessToken: string; user: any }> {
    // Get user from database
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.walletAddress, walletAddress))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException(
        'User not found. Please request a nonce first.',
      );
    }

    // Verify nonce matches
    const cachedNonce = await this.cacheService.get<string>(
      `nonce:${walletAddress}`,
    );
    if (!cachedNonce || !message.includes(user.nonce)) {
      throw new UnauthorizedException('Invalid or expired nonce');
    }

    // Verify signature
    const isValid = this.verifySignature(message, signature, walletAddress);
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Generate new nonce for next login
    const newNonce = randomBytes(32).toString('hex');
    await this.db
      .update(schema.users)
      .set({ nonce: newNonce })
      .where(eq(schema.users.walletAddress, walletAddress));

    // Delete used nonce from cache
    await this.cacheService.del(`nonce:${walletAddress}`);

    // Generate JWT token
    const payload = {
      walletAddress: user.walletAddress,
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(payload);

    // Cache user data
    await this.cacheService.cacheUser(walletAddress, user);

    return {
      accessToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
      },
    };
  }

  /**
   * Verify Solana wallet signature
   */
  private verifySignature(
    message: string,
    signature: string,
    publicKey: string,
  ): boolean {
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = bs58.decode(publicKey);

      return sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch {
      return false;
    }
  }

  /**
   * Validate JWT token and return user
   */
  async validateUser(walletAddress: string): Promise<any> {
    // Try cache first
    const cachedUser = await this.cacheService.getCachedUser(walletAddress);
    if (cachedUser) {
      return cachedUser;
    }

    // Fetch from database
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.walletAddress, walletAddress))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Cache user
    await this.cacheService.cacheUser(walletAddress, user);

    return user;
  }

  /**
   * Refresh access token
   */
  async refreshToken(walletAddress: string): Promise<{ accessToken: string }> {
    const user = await this.validateUser(walletAddress);

    const payload = {
      walletAddress: user.walletAddress,
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
