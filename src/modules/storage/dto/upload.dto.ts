import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ImageType {
  USER_AVATAR = 'user_avatar',
  ORGANIZATION_AVATAR = 'organization_avatar',
  EVENT_IMAGE = 'event_image',
}

export class UploadImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload',
  })
  file: Express.Multer.File;

  @ApiProperty({
    enum: ImageType,
    description: 'Type of image being uploaded',
    example: ImageType.USER_AVATAR,
  })
  @IsEnum(ImageType)
  type: ImageType;

  @ApiProperty({
    description: 'Custom filename (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  customFileName?: string;
}

export class UploadResponseDto {
  @ApiProperty({
    description: 'URL of the uploaded file',
    example: 'https://pub-xxx.r2.dev/avatars/users/abc123.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'File MIME type',
    example: 'image/jpeg',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'avatar.jpg',
  })
  originalName: string;
}
