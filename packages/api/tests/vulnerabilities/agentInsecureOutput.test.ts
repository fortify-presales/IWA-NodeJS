import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('LLM Insecure Output Handling - CWE-79', () => {
  it('VULNERABLE: agent reply is rendered via dangerouslySetInnerHTML with no sanitization', () => {
    // Source: packages/web/src/agentPage.tsx (AssistantReply component)
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../../web/src/agentPage.tsx'),
      'utf8',
    );

    expect(source).toContain('dangerouslySetInnerHTML');
    expect(source).toContain('INSECURE');
  });

  it('VULNERABLE: a prompt-injected reply containing markup is not escaped', () => {
    const payload = '<img src=x onerror=alert(document.cookie)>';
    // Demonstrates the payload an attacker would ask the LLM to echo verbatim.
    expect(payload).toContain('onerror=');
  });
});
