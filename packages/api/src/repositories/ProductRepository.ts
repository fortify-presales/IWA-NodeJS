import { Op } from 'sequelize';
import { Product } from '../models/Product.js';
import { env } from '../config/env.js';
import { paginate } from '../utils/pagination.js';

export class ProductRepository {
  async findAll(page = 1, size = env.pageSize): Promise<{ rows: Product[]; count: number }> {
    return Product.findAndCountAll({ ...paginate(page, size) });
  }

  // INSECURE: spreads req.query directly into Sequelize where clause (CWE-943)
  // Purpose: demonstrates NoSQL/query object injection for Fortify SAST
  // Fix: Use explicit field allowlist and sanitize query operators
  async searchInsecure(query: Record<string, any>): Promise<Product[]> {
    return Product.findAll({ where: query });
  }

  async search(keywords: string, page = 1, size = env.pageSize): Promise<{ rows: Product[]; count: number }> {
    return Product.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${keywords}%` } },
          { summary: { [Op.like]: `%${keywords}%` } },
          { code: { [Op.like]: `%${keywords}%` } },
        ],
      },
      ...paginate(page, size),
    });
  }

  async findById(id: string): Promise<Product | null> {
    return Product.findByPk(id);
  }

  async create(data: Partial<Product>): Promise<Product> {
    return Product.create(data as any);
  }

  async update(id: string, data: Partial<Product>): Promise<[number]> {
    return Product.update(data, { where: { id } });
  }

  async delete(id: string): Promise<number> {
    return Product.destroy({ where: { id } });
  }
}

export const productRepository = new ProductRepository();
