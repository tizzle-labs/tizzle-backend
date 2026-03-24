import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
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

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  private readonly maxFileSize: number;
  private readonly allowedImageTypes: string[];

  constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {
    this.maxFileSize = this.configService.get<number>('upload.maxFileSize');
    this.allowedImageTypes = this.configService.get<string[]>(
      'upload.allowedImageTypes',
    );
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload image to R2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'type'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
        type: {
          type: 'string',
          enum: Object.values(ImageType),
          description: 'Type of image',
          example: ImageType.USER_AVATAR,
        },
        customFileName: {
          type: 'string',
          description: 'Custom filename (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: ImageType,
    @Body('customFileName') customFileName?: string,
  ): Promise<UploadResponseDto> {
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

    // Map ImageType to StorageFolder
    const folder = this.getStorageFolder(type);

    // Upload file
    const url = await this.storageService.uploadFile(
      file,
      folder,
      customFileName,
    );

    return {
      url,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };
  }

  @Post('upload/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload user avatar' })
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
        customFileName: {
          type: 'string',
          description: 'Custom filename (optional)',
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
    @UploadedFile() file: Express.Multer.File,
    @Body('customFileName') customFileName?: string,
  ): Promise<UploadResponseDto> {
    return this.uploadImage(file, ImageType.USER_AVATAR, customFileName);
  }

  @Post('upload/organization-avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload organization avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Organization avatar image file',
        },
        customFileName: {
          type: 'string',
          description: 'Custom filename (optional)',
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
    @UploadedFile() file: Express.Multer.File,
    @Body('customFileName') customFileName?: string,
  ): Promise<UploadResponseDto> {
    return this.uploadImage(
      file,
      ImageType.ORGANIZATION_AVATAR,
      customFileName,
    );
  }

  @Post('upload/event-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload event image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Event image file',
        },
        customFileName: {
          type: 'string',
          description: 'Custom filename (optional)',
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
    @UploadedFile() file: Express.Multer.File,
    @Body('customFileName') customFileName?: string,
  ): Promise<UploadResponseDto> {
    return this.uploadImage(file, ImageType.EVENT_IMAGE, customFileName);
  }

  @Post('upload/badge-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload badge image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Badge image file',
        },
        customFileName: {
          type: 'string',
          description: 'Custom filename (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Badge image uploaded successfully',
    type: UploadResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadBadgeImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('customFileName') customFileName?: string,
  ): Promise<UploadResponseDto> {
    return this.uploadImage(file, ImageType.BADGE_IMAGE, customFileName);
  }

  @Delete(':fileUrl')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete file from R2' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteFile(@Param('fileUrl') fileUrl: string): Promise<void> {
    // Decode URL parameter
    const decodedUrl = decodeURIComponent(fileUrl);
    await this.storageService.deleteFile(decodedUrl);
  }

  private getStorageFolder(type: ImageType): StorageFolder {
    switch (type) {
      case ImageType.USER_AVATAR:
        return StorageFolder.USER_AVATARS;
      case ImageType.ORGANIZATION_AVATAR:
        return StorageFolder.ORGANIZATION_AVATARS;
      case ImageType.EVENT_IMAGE:
        return StorageFolder.EVENT_IMAGES;
      case ImageType.BADGE_IMAGE:
        return StorageFolder.BADGE_IMAGES;
      default:
        throw new BadRequestException('Invalid image type');
    }
  }
}
