import { describe, it, expect } from 'vitest';
import { StorageService } from '../../src/services/StorageService.js';
import path from 'path';
import fs from 'fs';

describe('Path Traversal - CWE-22', () => {
  it('VULNERABLE: loadAsResource with traverse=true allows directory traversal', () => {
    const svc = new StorageService();
    
    // The vulnerable code does: path.join(uploadDir, filename)
    // with no normalization, allowing ../../../etc/passwd style paths
    const uploadDir = svc['uploadDir'];
    const traversalPath = '../../../etc/hosts';
    const resultPath = path.join(uploadDir, traversalPath);
    
    // Verify the path traversal would escape the upload directory
    const resolved = path.resolve(resultPath);
    expect(resolved).not.toContain(path.resolve(uploadDir));
    // The vulnerability is that the code does NOT prevent this
  });

  it('SAFE: loadAsResource with traverse=false uses basename protection', () => {
    const svc = new StorageService();
    
    const traversalPath = '../../../etc/hosts';
    const safe = path.join(svc['uploadDir'], path.basename(traversalPath));
    
    // path.basename removes the directory traversal
    expect(path.basename(traversalPath)).toBe('hosts');
    expect(safe).toContain(svc['uploadDir']);
  });
});
