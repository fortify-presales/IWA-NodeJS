import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';

export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = env.uploadDir;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // INSECURE: path traversal - joins raw filename with no normalization (CWE-22)
  // Purpose: demonstrates path traversal for Fortify DAST/SAST
  // Fix: Use path.basename() or resolve() and verify the final path stays under the upload root
  loadAsResource(filename: string, traverse = false): Buffer {
    let filePath: string;
    if (traverse) {
      filePath = path.join(this.uploadDir, filename);
    } else {
      filePath = path.join(this.uploadDir, path.basename(filename));
    }
    return fs.readFileSync(filePath);
  }

  listFiles(): string[] {
    return fs.readdirSync(this.uploadDir);
  }

  saveFile(filename: string, data: Buffer): string {
    // INSECURE: stores file with original filename under public tree (CWE-434)
    // Purpose: demonstrates unrestricted file upload for Fortify DAST/SAST
    // Fix: Sanitize filenames, validate file types, and store outside web-accessible paths
    const filePath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filePath, data);
    return filePath;
  }
}

export const storageService = new StorageService();
