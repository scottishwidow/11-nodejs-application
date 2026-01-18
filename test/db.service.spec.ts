import { Pool } from 'pg';
import { DbService, MessageRow } from '../src/db/db.service';

type PoolMockInstance = {
  __config: unknown;
  query: jest.Mock;
  end: jest.Mock;
};

jest.mock('pg', () => {
  const PoolMock = jest.fn().mockImplementation(function (this: PoolMockInstance, config: unknown) {
    this.__config = config;
    this.query = jest.fn();
    this.end = jest.fn();
  });

  return { Pool: PoolMock };
});

describe('DbService', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_HOST;
    delete process.env.DATABASE_USER;
    delete process.env.DATABASE_PASSWORD;
    delete process.env.DATABASE;
    delete process.env.DATABASE_PORT;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const getPoolInstance = () =>
    (Pool as unknown as jest.Mock).mock.instances[0] as PoolMockInstance;

  it('uses DATABASE_URL when provided', () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    new DbService();

    const poolInstance = getPoolInstance();
    expect(poolInstance.__config).toEqual({
      connectionString: 'postgres://user:pass@host/db',
    });
  });

  it('builds config from discrete env vars', () => {
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_USER = 'user';
    process.env.DATABASE_PASSWORD = 'secret';
    process.env.DATABASE = 'app_db';
    process.env.DATABASE_PORT = '5432';

    new DbService();

    const poolInstance = getPoolInstance();
    expect(poolInstance.__config).toEqual({
      host: 'localhost',
      port: 5432,
      user: 'user',
      password: 'secret',
      database: 'app_db',
    });
  });

  it('throws when required database env vars are missing', () => {
    expect(() => new DbService()).toThrow(
      'DATABASE_HOST, DATABASE_USER, and DATABASE must be set for Postgres',
    );
  });

  it('runs listMessages with the expected query', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    const service = new DbService();
    const poolInstance = getPoolInstance();

    const rows: MessageRow[] = [
      { id: 1, body: 'hi', created_at: 'now' },
      { id: 2, body: 'there', created_at: 'later' },
    ];
    poolInstance.query.mockResolvedValueOnce({ rows });

    await expect(service.listMessages(5)).resolves.toEqual(rows);
    expect(poolInstance.query).toHaveBeenCalledWith(
      'select id, body, created_at from app_messages order by id desc limit $1',
      [5],
    );
  });

  it('runs createMessage with the expected query', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    const service = new DbService();
    const poolInstance = getPoolInstance();

    const created: MessageRow = { id: 3, body: 'saved', created_at: 'now' };
    poolInstance.query.mockResolvedValueOnce({ rows: [created] });

    await expect(service.createMessage('saved')).resolves.toEqual(created);
    expect(poolInstance.query).toHaveBeenCalledWith(
      'insert into app_messages (body) values ($1) returning id, body, created_at',
      ['saved'],
    );
  });

  it('runs deleteMessage with the expected query', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    const service = new DbService();
    const poolInstance = getPoolInstance();

    poolInstance.query.mockResolvedValueOnce({ rows: [] });

    await expect(service.deleteMessage(9)).resolves.toBeUndefined();
    expect(poolInstance.query).toHaveBeenCalledWith('delete from app_messages where id = $1', [9]);
  });

  it('checks connectivity on module init and closes pool on destroy', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    const service = new DbService();
    const poolInstance = getPoolInstance();

    poolInstance.query.mockResolvedValueOnce({ rows: [] });

    await service.onModuleInit();
    expect(poolInstance.query).toHaveBeenCalledWith('select 1');

    await service.onModuleDestroy();
    expect(poolInstance.end).toHaveBeenCalled();
  });
});
