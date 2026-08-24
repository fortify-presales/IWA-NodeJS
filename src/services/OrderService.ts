import { orderRepository } from '../repositories/OrderRepository.js';
import { Order } from '../models/Order.js';
import { env } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

export class OrderService {
  async findAll(page = 1, size = env.pageSize) {
    return orderRepository.findAll(page, size);
  }

  async findById(id: string) {
    return orderRepository.findById(id);
  }

  async findByUser(userId: string) {
    return orderRepository.findByUser(userId);
  }

  async create(data: Partial<Order>) {
    return orderRepository.create({ id: uuidv4(), ...data });
  }

  async update(id: string, data: Partial<Order>) {
    return orderRepository.update(id, data);
  }

  async delete(id: string) {
    return orderRepository.delete(id);
  }
}

export const orderService = new OrderService();
