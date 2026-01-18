import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DbService } from './db.service';

@Controller('messages')
export class DbController {
  constructor(private readonly dbService: DbService) {}

  @Get()
  async listMessages(@Query('limit') limit?: string) {
    const parsedLimit = limit ? Number(limit) : 50;
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 200) {
      throw new BadRequestException('limit must be an integer between 1 and 200');
    }
    return this.dbService.listMessages(parsedLimit);
  }

  @Post()
  async createMessage(@Body('body') body?: string) {
    if (!body || typeof body !== 'string' || !body.trim()) {
      throw new BadRequestException('body is required');
    }
    return this.dbService.createMessage(body.trim());
  }

  @Delete(':id')
  async deleteMessage(@Param('id') id?: string) {
    const parsedId = id ? Number(id) : NaN;
    if (!Number.isInteger(parsedId) || parsedId < 1) {
      throw new BadRequestException('id must be a positive integer');
    }
    await this.dbService.deleteMessage(parsedId);
    return { deleted: true };
  }
}
