import { describe, expect, it } from 'vitest';
import { normalizeOutput } from './executor.js';

describe('normalizeOutput', () => {
  it('trims whitespace and normalizes line endings', () => {
    expect(normalizeOutput('hello\r\nworld\n')).toBe('hello\nworld');
  });
});
