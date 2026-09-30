import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadFreshDb } from '../helpers/db.js';

describe('product search', () => {
  let closeDatabase: (() => Promise<void>) | undefined;
  let searchProducts: (keywords: string) => Promise<{ rows: Array<{ code: string }> }>;

  beforeAll(async () => {
    const { sequelize } = await loadFreshDb(':memory:');
    closeDatabase = () => sequelize.close();

    const [{ Product }, { ProductRepository }] = await Promise.all([
      import('../../src/models/Product.js'),
      import('../../src/repositories/ProductRepository.js'),
    ]);

    await Product.create({
      code: 'SEARCH-TEST-001',
      name: 'Search Test Product',
      category: 'CategoryNeedle',
      commonUses: ['CommonUseNeedle'],
      keywords: ['KeywordNeedle'],
      summary: 'Search test product',
      description: 'Search test product',
      price: 1,
      salePrice: 1,
      onSale: false,
      image: '',
      inStock: true,
      rating: 0,
    });

    const repository = new ProductRepository();
    searchProducts = (keywords) => repository.search(keywords);
  });

  afterAll(async () => {
    await closeDatabase?.();
  });

  it.each(['CategoryNeedle', 'CommonUseNeedle', 'KeywordNeedle'])(
    'matches %s',
    async (keyword) => {
      const result = await searchProducts(keyword);
      expect(result.rows.map(product => product.code)).toContain('SEARCH-TEST-001');
    },
  );
});