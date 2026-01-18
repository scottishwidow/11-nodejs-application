import { BadRequestException } from '@nestjs/common';
import { DbController } from '../src/db/db.controller';
import { DbService } from '../src/db/db.service';

describe('DbController', () => {
  let controller: DbController;
  let dbService: jest.Mocked<DbService>;

  beforeEach(() => {
    dbService = {
      listMessages: jest.fn(),
      createMessage: jest.fn(),
      deleteMessage: jest.fn(),
    } as unknown as jest.Mocked<DbService>;
    controller = new DbController(dbService);
  });

  describe('listMessages', () => {
    it('uses default limit when not provided', async () => {
      dbService.listMessages.mockResolvedValueOnce([]);
      await controller.listMessages();
      expect(dbService.listMessages).toHaveBeenCalledWith(50);
    });

    it('parses a valid limit value', async () => {
      dbService.listMessages.mockResolvedValueOnce([]);
      await controller.listMessages('25');
      expect(dbService.listMessages).toHaveBeenCalledWith(25);
    });

    it('rejects invalid limit values', async () => {
      await expect(controller.listMessages('0')).rejects.toThrow(
        new BadRequestException('limit must be an integer between 1 and 200'),
      );
      await expect(controller.listMessages('201')).rejects.toThrow(
        new BadRequestException('limit must be an integer between 1 and 200'),
      );
      await expect(controller.listMessages('nope')).rejects.toThrow(
        new BadRequestException('limit must be an integer between 1 and 200'),
      );
    });
  });

  describe('createMessage', () => {
    it('rejects missing or empty bodies', async () => {
      await expect(controller.createMessage()).rejects.toThrow(
        new BadRequestException('body is required'),
      );
      await expect(controller.createMessage('')).rejects.toThrow(
        new BadRequestException('body is required'),
      );
      await expect(controller.createMessage('   ')).rejects.toThrow(
        new BadRequestException('body is required'),
      );
    });

    it('trims and forwards the message body', async () => {
      const created = { id: 1, body: 'hello', created_at: 'now' };
      dbService.createMessage.mockResolvedValueOnce(created);
      await expect(controller.createMessage('  hello  ')).resolves.toEqual(created);
      expect(dbService.createMessage).toHaveBeenCalledWith('hello');
    });
  });

  describe('deleteMessage', () => {
    it('rejects invalid ids', async () => {
      await expect(controller.deleteMessage()).rejects.toThrow(
        new BadRequestException('id must be a positive integer'),
      );
      await expect(controller.deleteMessage('0')).rejects.toThrow(
        new BadRequestException('id must be a positive integer'),
      );
      await expect(controller.deleteMessage('nope')).rejects.toThrow(
        new BadRequestException('id must be a positive integer'),
      );
    });

    it('deletes a message and returns a confirmation', async () => {
      dbService.deleteMessage.mockResolvedValueOnce(undefined);
      await expect(controller.deleteMessage('12')).resolves.toEqual({ deleted: true });
      expect(dbService.deleteMessage).toHaveBeenCalledWith(12);
    });
  });
});
