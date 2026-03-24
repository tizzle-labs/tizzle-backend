import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getMint,
} from '@solana/spl-token';
import TizzleProgramIdl from './idl/tizzle_program.json';

// Define the program type
type TizzleProgram = Program<any>;

@Injectable()
export class SolanaService implements OnModuleInit {
  private readonly logger = new Logger(SolanaService.name);
  private connection: Connection;
  private program: TizzleProgram;
  private programId: PublicKey;

  constructor(private _configService: ConfigService) {}

  async onModuleInit() {
    const rpcUrl = this._configService.get<string>('solana.rpcUrl');
    const programIdStr = this._configService.get<string>('solana.programId');

    this.connection = new Connection(rpcUrl, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });

    this.programId = new PublicKey(programIdStr);

    // Initialize program without wallet for read-only operations
    const provider = new AnchorProvider(this.connection, {} as any, {
      commitment: 'confirmed',
    });

    this.program = new Program(
      TizzleProgramIdl as any,
      provider,
    ) as TizzleProgram;

    this.logger.log(
      `Solana service initialized on ${this._configService.get('solana.network')}`,
    );
    this.logger.log(`Program ID: ${this.programId.toString()}`);
  }

  getConnection(): Connection {
    return this.connection;
  }

  getProgram(): TizzleProgram {
    return this.program;
  }

  getProgramId(): PublicKey {
    return this.programId;
  }

  // Check if token mint is native SOL
  isNativeSol(mint: PublicKey): boolean {
    return mint.equals(SystemProgram.programId);
  }

  // Get token program from mint
  async getTokenProgram(mint: PublicKey): Promise<PublicKey> {
    if (this.isNativeSol(mint)) {
      return SystemProgram.programId;
    }

    const mintInfo = await this.connection.getAccountInfo(mint);
    if (!mintInfo) {
      throw new Error('Mint not found');
    }

    if (mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
      return TOKEN_2022_PROGRAM_ID;
    }

    return TOKEN_PROGRAM_ID;
  }

  // Get token mint info
  async getTokenMintInfo(mint: PublicKey) {
    if (this.isNativeSol(mint)) {
      return {
        decimals: 9,
        symbol: 'SOL',
        isNative: true,
      };
    }

    try {
      const tokenProgram = await this.getTokenProgram(mint);
      const mintInfo = await getMint(
        this.connection,
        mint,
        'confirmed',
        tokenProgram,
      );

      return {
        decimals: mintInfo.decimals,
        symbol: null, // Need to fetch from metadata
        isNative: false,
        tokenProgram: tokenProgram.toString(),
      };
    } catch (error: any) {
      this.logger.error(`Failed to get mint info: ${error.message}`);
      throw error;
    }
  }

  // Get or create associated token account
  async getOrCreateTokenAccount(
    mint: PublicKey,
    owner: PublicKey,
  ): Promise<{
    address: PublicKey;
    needsCreation: boolean;
    tokenProgram: PublicKey;
  }> {
    const tokenProgram = await this.getTokenProgram(mint);
    const ata = getAssociatedTokenAddressSync(mint, owner, true, tokenProgram);

    const accountInfo = await this.connection.getAccountInfo(ata);

    return {
      address: ata,
      needsCreation: !accountInfo,
      tokenProgram,
    };
  }

  // Derive PDA for config
  getConfigPda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      this.programId,
    );
  }

  // Derive PDA for organization
  getOrganizationPda(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('organization'), owner.toBuffer()],
      this.programId,
    );
  }

  // Derive PDA for event
  getEventPda(
    organization: PublicKey,
    eventId: PublicKey,
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('event'), organization.toBuffer(), eventId.toBuffer()],
      this.programId,
    );
  }

  // Derive PDA for registration
  getRegistrationPda(
    event: PublicKey,
    attendee: PublicKey,
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('registration'), event.toBuffer(), attendee.toBuffer()],
      this.programId,
    );
  }

  // Derive PDA for escrow vault
  getEscrowVaultPda(event: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), event.toBuffer()],
      this.programId,
    );
  }

  // Fetch event account
  async fetchEvent(eventPda: PublicKey) {
    try {
      return await (this.program.account as any).event.fetch(eventPda);
    } catch (error: any) {
      this.logger.error(`Failed to fetch event: ${error.message}`);
      return null;
    }
  }

  // Fetch registration account
  async fetchRegistration(registrationPda: PublicKey) {
    try {
      return await (this.program.account as any).registration.fetch(
        registrationPda,
      );
    } catch (error: any) {
      this.logger.error(`Failed to fetch registration: ${error.message}`);
      return null;
    }
  }

  // Fetch organization account
  async fetchOrganization(organizationPda: PublicKey) {
    try {
      return await (this.program.account as any).organization.fetch(
        organizationPda,
      );
    } catch (error: any) {
      this.logger.error(`Failed to fetch organization: ${error.message}`);
      return null;
    }
  }

  // Get event status from timestamps
  getEventStatus(event: any): string {
    const now = Math.floor(Date.now() / 1000);

    if (
      now >= event.unlockTime.toNumber() &&
      event.totalRefunded === event.totalRegistered &&
      event.organizerWithdrawn
    ) {
      return 'Closed';
    }

    if (now >= event.unlockTime.toNumber()) {
      return 'Settlement';
    }

    if (now >= event.endTime.toNumber()) {
      return 'Ended';
    }

    if (now >= event.startTime.toNumber()) {
      return 'Ongoing';
    }

    return 'Available';
  }

  // Verify transaction signature
  async verifyTransaction(signature: string): Promise<boolean> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      return tx && !tx.meta?.err;
    } catch (error: any) {
      this.logger.error(`Failed to verify transaction: ${error.message}`);
      return false;
    }
  }
}
