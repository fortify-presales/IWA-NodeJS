import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from '../models/User.js';
import { Authority } from '../models/Authority.js';
import { env } from '../config/env.js';
import { paginate } from '../utils/pagination.js';

export class UserRepository {
  // INSECURE: SQL injection via string concatenation (CWE-89)
  // Purpose: demonstrates SQLi for Fortify SAST/DAST — accepts ' OR '1'='1 and stacked queries
  // Fix: Use parameterized queries / ORM where clauses with sanitized inputs
  async searchByUsernameInsecure(keywords: string): Promise<User[]> {
    const sql = `SELECT * FROM users WHERE username LIKE '%${keywords}%'`;
    return sequelize.query(sql, { type: QueryTypes.SELECT, model: User });
  }

  async searchByUsername(keywords: string, page = 1, size = env.pageSize): Promise<User[]> {
    return User.findAll({
      where: { username: { [Op.like]: `%${keywords}%` } },
      include: [{ model: Authority }],
      ...paginate(page, size),
    });
  }

  async findAll(page = 1, size = env.pageSize): Promise<{ rows: User[]; count: number }> {
    return User.findAndCountAll({
      include: [{ model: Authority }],
      ...paginate(page, size),
    });
  }

  async findById(id: string): Promise<User | null> {
    return User.findByPk(id, { include: [{ model: Authority }] });
  }

  async findByUsername(username: string): Promise<User | null> {
    return User.findOne({ where: { username }, include: [{ model: Authority }] });
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async create(data: Partial<User>): Promise<User> {
    return User.create(data as any);
  }

  // INSECURE: mass assignment — passes entire body to update (CWE-915)
  // Purpose: demonstrates mass assignment for Fortify SAST
  // Fix: Use an allowlist of updatable fields
  async updateInsecure(id: string, data: Record<string, any>): Promise<[number]> {
    return User.update(data, { where: { id } });
  }

  async update(id: string, data: Partial<User>): Promise<[number]> {
    const allowed = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country', 'mfaType'];
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowed.includes(k))
    );
    return User.update(filtered, { where: { id } });
  }

  async delete(id: string): Promise<number> {
    return User.destroy({ where: { id } });
  }
}

export const userRepository = new UserRepository();
