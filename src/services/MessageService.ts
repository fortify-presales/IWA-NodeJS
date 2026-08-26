import { messageRepository } from '../repositories/MessageRepository.js';
import { Message } from '../models/Message.js';
import { env } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

export class MessageService {
  async findAll(page = 1, size = env.pageSize) {
    return messageRepository.findAll(page, size);
  }

  async findById(id: string) {
    return messageRepository.findById(id);
  }

  async findByUser(userId: string) {
    return messageRepository.findByUser(userId);
  }

  async countUnread(userId: string) {
    return messageRepository.countUnread(userId);
  }

  async create(data: Partial<Message>) {
    return messageRepository.create({ id: uuidv4(), ...data });
  }

  async update(id: string, data: Partial<Message>) {
    return messageRepository.update(id, data);
  }

  async delete(id: string) {
    return messageRepository.delete(id);
  }
}

export const messageService = new MessageService();
