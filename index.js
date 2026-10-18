#!/usr/bin/env node
'use strict';

// @posteora/mcp: a stdio shim for clients that cannot speak Streamable HTTP.
// It runs mcp-remote against https://posteora.com/mcp and passes stdio
// through. Clients that take a URL directly (Claude, Claude Code, ChatGPT,
// Cursor) do not need this: give them https://posteora.com/mcp instead.

const { spawn } = require('child_process');
const path = require('path');

const SERVER_URL = 'https://posteora.com/mcp';

const argv = process.argv.slice(2);

if (argv.includes('--help') || argv.includes('-h')) {
  process.stdout.write(`@posteora/mcp ${require('./package.json').version}

Usage:
  npx @posteora/mcp [mcp-remote options]

Runs mcp-remote against ${SERVER_URL} on stdio.

Sign-in:
  Default            OAuth 2.1 "Sign in with Posteora": the browser opens on
                     first use, you click Allow.
  POSTEORA_API_KEY   Set this environment variable to use your account API key
                     as a Bearer token instead of OAuth (no browser).

Any other arguments are passed to mcp-remote unchanged, for example
--header "Authorization: Bearer YOUR_API_KEY" or --transport http-only.

Docs: https://posteora.com/mcp-server
`);
  process.exit(0);
}

if (argv.includes('--version') || argv.includes('-v')) {
  process.stdout.write(require('./package.json').version + '\n');
  process.exit(0);
}

const pkg = require('mcp-remote/package.json');
const bin = path.join(path.dirname(require.resolve('mcp-remote/package.json')),
  typeof pkg.bin === 'string' ? pkg.bin : pkg.bin['mcp-remote']);

const args = [bin, SERVER_URL];
const apiKey = process.env.POSTEORA_API_KEY;
const hasHeader = argv.includes('--header');
if (apiKey && !hasHeader) {
  args.push('--header', `Authorization: Bearer ${apiKey}`);
}
args.push(...argv);

const child = spawn(process.execPath, args, { stdio: 'inherit' });
child.on('error', (err) => {
  process.stderr.write(`posteora-mcp: could not start mcp-remote (${err.message})\n`);
  process.exit(1);
});
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code == null ? 1 : code);
});
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => child.kill(sig));
}
