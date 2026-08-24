import { Authority } from '../models/Authority.js';

export class RoleRepository {
  async findAll(): Promise<Authority[]> {
    return Authority.findAll();
  }

  async findById(id: string): Promise<Authority | null> {
    return Authority.findByPk(id);
  }

  async create(data: Partial<Authority>): Promise<Authority> {
    return Authority.create(data as any);
  }

  async update(id: string, data: Partial<Authority>): Promise<[number]> {
    return Authority.update(data, { where: { id } });
  }

  async delete(id: string): Promise<number> {
    return Authority.destroy({ where: { id } });
  }
}

export const roleRepository = new RoleRepository();
