import { Review } from '../models/Review.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { paginate } from '../utils/pagination.js';
import { env } from '../config/env.js';

export class ReviewRepository {
  async findAll(page = 1, size = env.pageSize): Promise<{ rows: Review[]; count: number }> {
    return Review.findAndCountAll({ include: [{ model: User }, { model: Product }], ...paginate(page, size) });
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return Review.findAll({ where: { productId, visible: true }, include: [{ model: User }] });
  }

  async findById(id: string): Promise<Review | null> {
    return Review.findByPk(id, { include: [{ model: User }, { model: Product }] });
  }

  async create(data: Partial<Review>): Promise<Review> {
    return Review.create(data as any);
  }

  async update(id: string, data: Partial<Review>): Promise<[number]> {
    return Review.update(data, { where: { id } });
  }

  async delete(id: string): Promise<number> {
    return Review.destroy({ where: { id } });
  }
}

export const reviewRepository = new ReviewRepository();
