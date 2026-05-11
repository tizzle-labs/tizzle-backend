import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export enum StorageFolder {
  USER_AVATARS = 'avatars/users',
  ORGANIZATION_AVATARS = 'avatars/organizations',
  EVENT_IMAGES = 'images/events',
  EVENT_VENUE_IMAGES = 'images/events/venues',
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('r2.accountId');
    const accessKeyId = this.configService.get<string>('r2.accessKeyId');
    const secretAccessKey =
      this.configService.get<string>('r2.secretAccessKey');

    this.bucketName = this.configService.get<string>('r2.bucketName');
    this.publicUrl = this.configService.get<string>('r2.publicUrl');

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log('Storage service initialized with Cloudflare R2');
  }

  /**
   * Upload file to R2
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: StorageFolder,
    customFileName?: string,
  ): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = customFileName || `${randomUUID()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000',
      });

      await this.s3Client.send(command);

      const fileUrl = `${this.publicUrl}/${key}`;
      this.logger.log(`File uploaded successfully: ${fileUrl}`);

      return fileUrl;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new Error('File upload failed');
    }
  }

  /**
   * Delete file from R2
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract key from URL
      const key = fileUrl.replace(`${this.publicUrl}/`, '');

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch {
      this.logger.error(`Failed to delete file: ${fileUrl}`);
      // Don't throw error, just log it
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const key = fileUrl.replace(`${this.publicUrl}/`, '');

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate presigned URL for temporary access
   */
  async getPresignedUrl(
    fileUrl: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const key = fileUrl.replace(`${this.publicUrl}/`, '');

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`);
      throw new Error('Failed to generate presigned URL');
    }
  }

  /**
   * Delete old file when updating
   */
  async replaceFile(
    oldFileUrl: string | null,
    newFile: Express.Multer.File,
    folder: StorageFolder,
    customFileName?: string,
  ): Promise<string> {
    // Upload new file
    const newFileUrl = await this.uploadFile(newFile, folder, customFileName);

    // Delete old file if exists
    if (oldFileUrl) {
      await this.deleteFile(oldFileUrl);
    }

    return newFileUrl;
  }
}
