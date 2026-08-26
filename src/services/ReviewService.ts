import { reviewRepository } from '../repositories/ReviewRepository.js';
import { Review } from '../models/Review.js';
import { env } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

export class ReviewService {
  async findAll(page = 1, size = env.pageSize) {
    return reviewRepository.findAll(page, size);
  }

  async findById(id: string) {
    return reviewRepository.findById(id);
  }

  async findByProduct(productId: string) {
    return reviewRepository.findByProduct(productId);
  }

  async create(data: Partial<Review>) {
    return reviewRepository.create({ id: uuidv4(), ...data });
  }

  async update(id: string, data: Partial<Review>) {
    return reviewRepository.update(id, data);
  }

  async delete(id: string) {
    return reviewRepository.delete(id);
  }
}

export const reviewService = new ReviewService();
