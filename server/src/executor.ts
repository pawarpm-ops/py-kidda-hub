import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

type ExecutionResult = {
  stdout: string;
  stderr: string;
  runtimeMs: number;
  timedOut: boolean;
};

export async function executePython(sourceCode: string, input = '', timeoutMs = 3000): Promise<ExecutionResult> {
  const mode = process.env.EXECUTION_MODE || 'local';
  const dir = await mkdtemp(path.join(tmpdir(), 'py-run-'));
  const file = path.join(dir, 'main.py');
  await writeFile(file, sourceCode, 'utf8');

  const start = Date.now();
  const command = mode === 'docker' ? 'docker' : 'python3';
  const args =
    mode === 'docker'
      ? [
          'run',
          '--rm',
          '--network',
          'none',
          '--memory',
          '128m',
          '--cpus',
          '0.5',
          '-i',
          '-v',
          `${dir}:/workspace:ro`,
          process.env.PYTHON_IMAGE || 'python:3.12-alpine',
          'python',
          '/workspace/main.py'
        ]
      : [file];

  return await new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('close', async () => {
      clearTimeout(timer);
      await rm(dir, { recursive: true, force: true });
      resolve({ stdout, stderr: timedOut ? 'Execution timed out' : stderr, runtimeMs: Date.now() - start, timedOut });
    });
    child.stdin.write(input);
    child.stdin.end();
  });
}

export function normalizeOutput(value: string) {
  return value.replace(/\r\n/g, '\n').trim();
}
