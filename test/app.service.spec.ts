import { AppService } from '../src/app.service';

describe('AppService', () => {
  let service: AppService;
  let originalVersion: string | undefined;

  beforeEach(() => {
    originalVersion = process.env.APP_VERSION;
    service = new AppService();
  });

  afterEach(() => {
    if (originalVersion === undefined) {
      delete process.env.APP_VERSION;
      return;
    }
    process.env.APP_VERSION = originalVersion;
  });

  it('returns the app version from env', () => {
    process.env.APP_VERSION = '1.2.3';
    expect(service.getHello()).toBe('1.2.3');
  });

  it('throws when APP_VERSION is missing', () => {
    delete process.env.APP_VERSION;
    expect(() => service.getHello()).toThrow('APP_VERSION is required');
  });

  it('throws when APP_VERSION is empty', () => {
    process.env.APP_VERSION = '';
    expect(() => service.getHello()).toThrow('APP_VERSION is required');
  });

  it('returns a health payload', () => {
    expect(service.getHealth()).toEqual({
      status: 'ok',
      service: 'nestjs-ci-sample',
    });
  });
});
