import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'app.nodeEnv': 'test',
        'solana.network': 'devnet',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('environment', 'test');
    });
  });

  describe('getReadiness', () => {
    it('should return readiness status', () => {
      const result = appController.getReadiness();
      expect(result).toHaveProperty('status', 'ready');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('checks');
      expect(result.checks).toHaveProperty('database', 'ok');
      expect(result.checks).toHaveProperty('redis', 'ok');
      expect(result.checks).toHaveProperty('solana', 'ok');
    });
  });

  describe('getInfo', () => {
    it('should return API information', () => {
      const result = appController.getInfo();
      expect(result).toHaveProperty('name', 'Tizzle API');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('network', 'devnet');
      expect(result).toHaveProperty('documentation', '/docs');
    });
  });
});
