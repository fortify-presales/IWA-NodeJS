import { Op } from 'sequelize';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { paginate } from '../utils/pagination.js';
import { env } from '../config/env.js';

export class OrderRepository {
  async findAll(page = 1, size = env.pageSize): Promise<{ rows: Order[]; count: number }> {
    return Order.findAndCountAll({ include: [{ model: User }], ...paginate(page, size) });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return Order.findAll({ where: { userId }, include: [{ model: User }] });
  }

  // INSECURE: no ownership check — IDOR (CWE-639)
  // Purpose: demonstrates broken object level authorization for Fortify DAST
  // Fix: Always verify the requesting user owns the resource
  async findById(id: string): Promise<Order | null> {
    return Order.findOne({
      where: {
        [Op.or]: [{ id }, { orderNum: id }],
      },
      include: [{ model: User }],
    });
  }

  async create(data: Partial<Order>): Promise<Order> {
    return Order.create(data as any);
  }

  async update(id: string, data: Partial<Order>): Promise<[number]> {
    return Order.update(data, { where: { id } });
  }

  async delete(id: string): Promise<number> {
    return Order.destroy({ where: { id } });
  }
}

export const orderRepository = new OrderRepository();
