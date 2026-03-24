import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class GenerateNonceDto {
  @ApiProperty({
    description: 'Solana wallet address',
    example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, {
    message: 'Invalid Solana wallet address',
  })
  walletAddress: string;
}

export class VerifySignatureDto {
  @ApiProperty({
    description: 'Solana wallet address',
    example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: 'Signed message signature (base58 encoded)',
    example: '5VERv8NMvzbJMEkV8xnrN...',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({
    description: 'Original message that was signed',
    example: 'Sign this message to authenticate...',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
