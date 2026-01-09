import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('AppController', () => {
  let controller: AppController;
  let originalVersion: string | undefined;

  beforeEach(async () => {
    originalVersion = process.env.APP_VERSION;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  afterEach(() => {
    if (originalVersion === undefined) {
      delete process.env.APP_VERSION;
      return;
    }
    process.env.APP_VERSION = originalVersion;
  });

  it('returns the version payload', () => {
    process.env.APP_VERSION = '2.0.0';
    expect(controller.getHello()).toEqual({
      message: '2.0.0',
    });
  });

  it('throws when APP_VERSION is missing', () => {
    delete process.env.APP_VERSION;
    expect(() => controller.getHello()).toThrow('APP_VERSION is required');
  });

  it('throws when APP_VERSION is empty', () => {
    process.env.APP_VERSION = '';
    expect(() => controller.getHello()).toThrow('APP_VERSION is required');
  });

  it('returns health payload', () => {
    expect(controller.getHealth()).toEqual({
      status: 'ok',
      service: 'nestjs-ci-sample',
    });
  });
});
