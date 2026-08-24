import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { userRepository } from '../repositories/UserRepository.js';
import { User } from '../models/User.js';
import { Authority } from '../models/Authority.js';
import { AuthorityType, MfaType } from '../models/enums.js';
import { generateInsecureToken } from '../utils/crypto.js';
import { env } from '../config/env.js';
import { UserAuthority } from '../models/UserAuthority.js';

export class UserService {
  async findAll(page = 1, size = env.pageSize) {
    return userRepository.findAll(page, size);
  }

  async findById(id: string) {
    return userRepository.findById(id);
  }

  async findByUsername(username: string) {
    return userRepository.findByUsername(username);
  }

  async search(keywords: string, page = 1, size = env.pageSize) {
    void page;
    void size;
    // INSECURE: uses raw SQL concatenation (CWE-89)
    // Purpose: demonstrates SQL injection for Fortify SAST/DAST
    // Fix: Use parameterized ORM queries instead of string concatenation
    return userRepository.searchByUsernameInsecure(keywords);
  }

  async register(data: { username: string; email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    const password = await bcrypt.hash(data.password, 10);
    // INSECURE: verification token from Math.random() (CWE-338)
    // Purpose: demonstrates insecure randomness for Fortify SAST
    // Fix: Use crypto.randomBytes() or another CSPRNG-backed token generator
    const verificationToken = generateInsecureToken();
    const user = await userRepository.create({
      id: uuidv4(),
      ...data,
      password,
      enabled: true,
      verified: false,
      mfaType: MfaType.MFA_NONE,
      failedLoginAttempts: 0,
      locked: false,
    } as any);
    const role = await Authority.findOne({ where: { name: AuthorityType.ROLE_USER } });
    if (role) await UserAuthority.create({ userId: user.id, authorityId: role.id });
    return { user, verificationToken };
  }

  async updateInsecure(id: string, data: Record<string, any>) {
    // INSECURE: mass assignment (CWE-915)
    // Purpose: demonstrates mass assignment for Fortify SAST/DAST
    // Fix: Restrict updates to an explicit allowlist of safe fields
    return userRepository.updateInsecure(id, data);
  }

  async update(id: string, data: Partial<User>) {
    return userRepository.update(id, data);
  }

  async delete(id: string) {
    return userRepository.delete(id);
  }

  async usernameExists(username: string): Promise<boolean> {
    const u = await userRepository.findByUsername(username);
    return !!u;
  }

  async emailExists(email: string): Promise<boolean> {
    const u = await userRepository.findByEmail(email);
    return !!u;
  }

  async changePassword(userId: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);
    return userRepository.update(userId, { password: hash } as any);
  }
}

export const userService = new UserService();
