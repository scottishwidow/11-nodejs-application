import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const version = process.env.APP_VERSION;
    if (!version) {
      throw new Error('APP_VERSION is required');
    }
    return version;
  }

  getHealth() {
    return { status: 'ok', service: 'nestjs-ci-sample' };
  }
}
