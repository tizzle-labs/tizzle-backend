import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { StorageService, StorageFolder } from './storage.service';
import { ImageType, UploadResponseDto } from './dto/upload.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { users } from '../../database/schema/users.schema';
import { organizations } from '../../database/schema/organizations.schema';
import { events } from '../../database/schema/events.schema';
import { eq } from 'drizzle-orm';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  private readonly maxFileSize: number;
  private readonly allowedImageTypes: string[];

  constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {
    this.maxFileSize = this.configService.get<number>('upload.maxFileSize');
    this.allowedImageTypes = this.configService.get<string[]>(
      'upload.allowedImageTypes',
    );
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Validate file type
    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedImageTypes.join(', ')}`,
      );
    }
  }

  /**
   * Get old file URL from database based on type and user
   */
  private async getOldFileUrl(
    type: ImageType,
    walletAddress: string,
    resourceId?: string,
  ): Promise<string | null> {
    try {
      switch (type) {
        case ImageType.USER_AVATAR: {
          const [user] = await this.db
            .select({ avatarUrl: users.avatarUrl })
            .from(users)
            .where(eq(users.walletAddress, walletAddress))
            .limit(1);
          return user?.avatarUrl || null;
        }

        case ImageType.ORGANIZATION_AVATAR: {
          if (!resourceId) return null;
          const [org] = await this.db
            .select({ avatarUrl: organizations.avatarUrl })
            .from(organizations)
            .where(eq(organizations.organizationPda, resourceId))
            .limit(1);
          return org?.avatarUrl || null;
        }

        case ImageType.EVENT_IMAGE: {
          if (!resourceId) return null;
          const [event] = await this.db
            .select({ imageUrl: events.imageUrl })
            .from(events)
            .where(eq(events.eventPda, resourceId))
            .limit(1);
          return event?.imageUrl || null;
        }

        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  @Post('upload/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload user avatar',
    description:
      'Upload user avatar. If user already has an avatar, the old one will be deleted automatically.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar uploaded successfully',
    type: UploadResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    this.validateFile(file);

    // Get old avatar URL
    const oldAvatarUrl = await this.getOldFileUrl(
      ImageType.USER_AVATAR,
      user.walletAddress,
    );

    // Upload new file and delete old one
    const url = await this.storageService.replaceFile(
      oldAvatarUrl,
      file,
      StorageFolder.USER_AVATARS,
    );

    // Update user avatar URL in database
    await this.db
      .update(users)
      .set({ avatarUrl: url, updatedAt: new Date() } as any)
      .where(eq(users.walletAddress, user.walletAddress));

    return {
      url,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };
  }

  @Post('upload/organization-avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload organization avatar',
    description:
      'Upload organization avatar. Requires organizationPda in request body. If organization already has an avatar, the old one will be deleted automatically. Only organization owner can upload.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'organizationPda'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Organization avatar image file',
        },
        organizationPda: {
          type: 'string',
          description: 'Organization PDA',
          example: 'ABC123...',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Organization avatar uploaded successfully',
    type: UploadResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadOrganizationAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('organizationPda') organizationPda: string,
  ): Promise<UploadResponseDto> {
    this.validateFile(file);

    if (!organizationPda) {
      throw new BadRequestException('organizationPda is required');
    }

    // Verify user owns the organization
    const [org] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.organizationPda, organizationPda))
      .limit(1);

    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    if (org.ownerWalletAddress !== user.walletAddress) {
      throw new BadRequestException(
        'Only organization owner can upload avatar',
      );
    }

    // Get old avatar URL
    const oldAvatarUrl = await this.getOldFileUrl(
      ImageType.ORGANIZATION_AVATAR,
      user.walletAddress,
      organizationPda,
    );

    // Upload new file and delete old one
    const url = await this.storageService.replaceFile(
      oldAvatarUrl,
      file,
      StorageFolder.ORGANIZATION_AVATARS,
    );

    // Update organization avatar URL in database
    await this.db
      .update(organizations)
      .set({ avatarUrl: url, updatedAt: new Date() } as any)
      .where(eq(organizations.organizationPda, organizationPda));

    return {
      url,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };
  }

  @Post('upload/event-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload event image',
    description:
      'Upload event image. Requires eventPda in request body. If event already has an image, the old one will be deleted automatically. Only event organizer can upload.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'eventPda'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Event image file',
        },
        eventPda: {
          type: 'string',
          description: 'Event PDA',
          example: 'XYZ789...',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Event image uploaded successfully',
    type: UploadResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadEventImage(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('eventPda') eventPda: string,
  ): Promise<UploadResponseDto> {
    this.validateFile(file);

    if (!eventPda) {
      throw new BadRequestException('eventPda is required');
    }

    // Verify user is the event organizer
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.eventPda, eventPda))
      .limit(1);

    if (!event) {
      throw new BadRequestException('Event not found');
    }

    if (event.organizerWalletAddress !== user.walletAddress) {
      throw new BadRequestException('Only event organizer can upload image');
    }

    // Get old image URL
    const oldImageUrl = await this.getOldFileUrl(
      ImageType.EVENT_IMAGE,
      user.walletAddress,
      eventPda,
    );

    // Upload new file and delete old one
    const url = await this.storageService.replaceFile(
      oldImageUrl,
      file,
      StorageFolder.EVENT_IMAGES,
    );

    // Update event image URL in database
    await this.db
      .update(events)
      .set({ imageUrl: url, updatedAt: new Date() } as any)
      .where(eq(events.eventPda, eventPda));

    return {
      url,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };
  }
}
