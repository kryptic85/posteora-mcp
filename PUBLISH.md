# Publish checklist

Run these from this folder, in order. Nothing here has been run; nothing is published yet. Each step says what it does.

```bash
cd /Users/Arun/.claude/jobs/takeon/posteora-mcp
```

## 0. Last look

```bash
git status && git log --oneline        # one commit, clean tree
npm test                               # node index.js --help; prints usage, exits 0
claude plugin validate .               # checks .claude-plugin/*.json and .mcp.json
```

## 1. GitHub repo (public)

```bash
gh repo create posteora-mcp --public --source . --push --description "Posteora MCP server: the posting agent for your AI. Preview, approve, then post or schedule to X, LinkedIn, Bluesky, Mastodon, Pinterest, TikTok and YouTube from Claude, ChatGPT, Claude Code or Cursor."
```
Creates `github.com/kryptic85/posteora-mcp` from this folder and pushes `main`. Afterwards, optionally set the website and topics:

```bash
gh repo edit kryptic85/posteora-mcp --homepage https://posteora.com/mcp-server --add-topic mcp --add-topic model-context-protocol --add-topic mcp-server --add-topic social-media --add-topic claude --add-topic chatgpt --add-topic posting-agent
```

## 2. npm: `@posteora/mcp`

The scope `@posteora` must exist on npm as your user name or as an org you own. If your npm user is not `posteora`, create the org once (free for public packages): https://www.npmjs.com/org/create with the name `posteora`. Otherwise `npm publish` answers 403.

```bash
npm login                              # browser sign-in to npm (one time)
npm publish --access public            # publishes @posteora/mcp 0.1.0 with index.js, README.md, LICENSE
npm view @posteora/mcp version         # confirms 0.1.0 is live
npx -y @posteora/mcp --help            # end-to-end check of the published shim
```

`package.json` already carries `"mcpName": "io.github.kryptic85/posteora"`, which the MCP Registry reads to verify package ownership in step 3. Publish npm before the registry.

## 3. Official MCP Registry

```bash
brew install mcp-publisher             # the registry's CLI (or the curl one-liner in the registry quickstart)
mcp-publisher --help                   # confirms install
mcp-publisher validate                 # checks server.json against the 2025-12-11 schema, no network
mcp-publisher login github             # device flow: open https://github.com/login/device, enter the code, authorize; grants io.github.kryptic85/*
mcp-publisher publish                  # publishes server.json (remote + npm package) as io.github.kryptic85/posteora 0.1.0
curl -s "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.kryptic85/posteora"   # shows the live entry
```

If `publish` reports "Registry validation failed for package", the npm package is not live yet or `mcpName` does not match `name`; re-run after step 2. To publish without the npm package, remove the `packages` array from `server.json` and publish again.

## 4. awesome-mcp-servers: fork and PR

```bash
cd /tmp
gh repo fork punkpeye/awesome-mcp-servers --clone --remote     # forks to kryptic85/awesome-mcp-servers and clones it
cd awesome-mcp-servers
git checkout -b add-posteora-mcp                                # branch for the change
# insert the entry after king-of-the-grackles/reddit-research-mcp in the Social Media section (alphabetical by owner/repo)
python3 - <<'PY'
import re
p='README.md'; s=open(p,encoding='utf-8').read()
line='- [kryptic85/posteora-mcp](https://github.com/kryptic85/posteora-mcp) 🎖️ 📇 ☁️ - Posting agent for Claude, ChatGPT and Claude Code: preview fit and credit cost, approve, then publish or schedule to X, LinkedIn, Bluesky, Mastodon, Pinterest, TikTok and YouTube.\n'
start=s.index('<a name="social-media"></a>'); end=s.index('\n### ', start)
sec=s[start:end]; anchor=sec.index('- [king-of-the-grackles/reddit-research-mcp]'); nl=sec.index('\n', anchor)+1
s=s[:start]+sec[:nl]+line+sec[nl:]+s[end:]
open(p,'w',encoding='utf-8').write(s); print('inserted')
PY
git diff --stat                                                 # exactly one line added in README.md
git commit -am "Add Posteora MCP server"
git push -u origin add-posteora-mcp
gh pr create --repo punkpeye/awesome-mcp-servers --title "Add kryptic85/posteora-mcp (Social Media)" --body "Adds Posteora (https://github.com/kryptic85/posteora-mcp), the official MCP server for posteora.com: preview fit and credit cost, approve, then publish or schedule to X, LinkedIn, Bluesky, Mastodon, Pinterest, TikTok and YouTube. Remote endpoint https://posteora.com/mcp with OAuth 2.1; npm stdio shim @posteora/mcp; listed in the official MCP Registry as io.github.kryptic85/posteora."
```

The maintainers may route a hosted server to awesome-remote-mcp-servers. That list requires a Glama connector badge first (SUBMISSIONS.md entry 3, then 11); when the badge exists, repeat this block against `punkpeye/awesome-remote-mcp-servers` with the three-line entry from SUBMISSIONS.md, and star that repo first (required there).

## 5. Web forms (in a browser, in this order)

1. https://glama.ai/mcp/connectors → Add MCP Server → Connector; then Claim ownership (SUBMISSIONS.md entry 3).
2. https://mcpservers.org/submit (entry 6).
3. https://mcp.so/submit → Remote Server (entry 4).
4. https://smithery.ai/new (entry 5).
5. https://claude.ai/directory/manage → Submit new → MCP connector (entry 7) after fixing the `connection.label` annotation and preparing a reviewer account.
6. https://platform.openai.com/plugins (entry 8) after domain verification and the reviewer account.
7. https://www.pulsemcp.com/submit when it reopens (entry 2).

## 6. Later releases

Bump `version` in both `package.json` and `server.json` (and `packages[0].version`), then `npm publish --access public` and `mcp-publisher publish` again. The registry keeps every version; clients see the latest.
