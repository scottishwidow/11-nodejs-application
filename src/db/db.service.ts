import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';

export interface MessageRow {
  id: number;
  body: string;
  created_at: string;
}

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool(this.buildPoolConfig());
  }

  async onModuleInit() {
    await this.pool.query('select 1');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async listMessages(limit: number) {
    const result = await this.pool.query<MessageRow>(
      'select id, body, created_at from app_messages order by id desc limit $1',
      [limit],
    );
    return result.rows;
  }

  async createMessage(body: string) {
    const result = await this.pool.query<MessageRow>(
      'insert into app_messages (body) values ($1) returning id, body, created_at',
      [body],
    );
    return result.rows[0];
  }

  async deleteMessage(id: number) {
    await this.pool.query('delete from app_messages where id = $1', [id]);
  }

  private buildPoolConfig(): PoolConfig {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      return { connectionString };
    }

    if (!process.env.DATABASE_HOST || !process.env.DATABASE_USER || !process.env.DATABASE) {
      throw new Error('DATABASE_HOST, DATABASE_USER, and DATABASE must be set for Postgres');
    }

    const port = process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined;
    return {
      host: process.env.DATABASE_HOST,
      port: Number.isNaN(port) ? undefined : port,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
    };
  }
}
