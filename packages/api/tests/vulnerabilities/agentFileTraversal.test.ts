import { describe, it, expect } from 'vitest';
import { createFileDownloadTool } from '@iwa/agent';

describe('LLM file access through agent tool - CWE-22', () => {
  it('VULNERABLE: download_file forwards traversal paths to storage', async () => {
    const requestedFiles: string[] = [];
    const tool = createFileDownloadTool(async (filename) => {
      requestedFiles.push(filename);
      return 'file contents';
    });
    const traversalPayload = '../../package.json';

    await tool.invoke({ filename: traversalPayload } as never);

    expect(requestedFiles).toContain(traversalPayload);
  });

  it('VULNERABLE: the tool accepts paths instead of a constrained file identifier', async () => {
    const tool = createFileDownloadTool(async (filename) => `read ${filename}`);

    await expect(tool.invoke({ filename: '../../../etc/passwd' } as never))
      .resolves.toContain('../../../etc/passwd');
  });
});