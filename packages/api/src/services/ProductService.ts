import { productRepository } from '../repositories/ProductRepository.js';
import { Product } from '../models/Product.js';
import { env } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

export class ProductService {
  async findAll(page = 1, size = env.pageSize) {
    return productRepository.findAll(page, size);
  }

  async findById(id: string) {
    return productRepository.findById(id);
  }

  async search(keywords: string, page = 1, size = env.pageSize) {
    return productRepository.search(keywords, page, size);
  }

  // INSECURE: query object injection (CWE-943)
  // Purpose: demonstrates query/operator injection for Fortify SAST/DAST
  // Fix: Validate and map known query params to explicit ORM filters
  async searchInsecure(query: Record<string, any>) {
    return productRepository.searchInsecure(query);
  }

  async create(data: Partial<Product>) {
    return productRepository.create({ id: uuidv4(), ...data });
  }

  async update(id: string, data: Partial<Product>) {
    return productRepository.update(id, data);
  }

  async delete(id: string) {
    return productRepository.delete(id);
  }
}

export const productService = new ProductService();
