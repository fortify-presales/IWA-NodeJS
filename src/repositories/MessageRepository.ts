import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { paginate } from '../utils/pagination.js';
import { env } from '../config/env.js';

export class MessageRepository {
  async findAll(page = 1, size = env.pageSize): Promise<{ rows: Message[]; count: number }> {
    return Message.findAndCountAll({ include: [{ model: User }], ...paginate(page, size) });
  }

  async findByUser(userId: string): Promise<Message[]> {
    return Message.findAll({ where: { userId }, include: [{ model: User }] });
  }

  async findById(id: string): Promise<Message | null> {
    return Message.findByPk(id, { include: [{ model: User }] });
  }

  async countUnread(userId: string): Promise<number> {
    return Message.count({ where: { userId, read: false } });
  }

  async create(data: Partial<Message>): Promise<Message> {
    return Message.create(data as any);
  }

  async update(id: string, data: Partial<Message>): Promise<[number]> {
    return Message.update(data, { where: { id } });
  }

  async delete(id: string): Promise<number> {
    return Message.destroy({ where: { id } });
  }
}

export const messageRepository = new MessageRepository();
