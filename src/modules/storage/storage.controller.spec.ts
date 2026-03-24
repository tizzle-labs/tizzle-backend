import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { ImageType } from './dto/upload.dto';

describe('StorageController', () => {
  let controller: StorageController;
  let storageService: StorageService;

  const mockStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'upload.maxFileSize') return 5242880; // 5MB
      if (key === 'upload.allowedImageTypes')
        return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        { provide: StorageService, useValue: mockStorageService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<StorageController>(StorageController);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024000,
      buffer: Buffer.from('test'),
      stream: null,
      destination: '',
      filename: '',
      path: '',
    };

    it('should upload image successfully', async () => {
      const expectedUrl = 'https://pub-xxx.r2.dev/avatars/users/test.jpg';
      mockStorageService.uploadFile.mockResolvedValue(expectedUrl);

      const result = await controller.uploadImage(
        mockFile,
        ImageType.USER_AVATAR,
      );

      expect(result).toEqual({
        url: expectedUrl,
        size: mockFile.size,
        mimeType: mockFile.mimetype,
        originalName: mockFile.originalname,
      });
      expect(storageService.uploadFile).toHaveBeenCalled();
    });

    it('should throw error if no file provided', async () => {
      await expect(
        controller.uploadImage(null, ImageType.USER_AVATAR),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if file size exceeds limit', async () => {
      const largeFile = { ...mockFile, size: 10000000 }; // 10MB

      await expect(
        controller.uploadImage(largeFile, ImageType.USER_AVATAR),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if file type is invalid', async () => {
      const invalidFile = { ...mockFile, mimetype: 'application/pdf' };

      await expect(
        controller.uploadImage(invalidFile, ImageType.USER_AVATAR),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadAvatar', () => {
    it('should call uploadImage with USER_AVATAR type', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'avatar.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024000,
        buffer: Buffer.from('test'),
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      const expectedUrl = 'https://pub-xxx.r2.dev/avatars/users/avatar.jpg';
      mockStorageService.uploadFile.mockResolvedValue(expectedUrl);

      const result = await controller.uploadAvatar(mockFile);

      expect(result.url).toBe(expectedUrl);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const fileUrl = 'https://pub-xxx.r2.dev/avatars/users/test.jpg';
      mockStorageService.deleteFile.mockResolvedValue(undefined);

      await controller.deleteFile(encodeURIComponent(fileUrl));

      expect(storageService.deleteFile).toHaveBeenCalledWith(fileUrl);
    });
  });
});
