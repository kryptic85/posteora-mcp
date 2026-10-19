# Directory submissions

Paste-ready text for every directory, checked on 2026-10-18. Each entry lists the URL, what the form asks for, and the exact text. "Verified" means the URL answered and the form or docs were read on that date; "Unverified" marks anything that could not be confirmed without signing in.

Shared values (reuse everywhere):

| Field | Value |
|---|---|
| Name | Posteora |
| One-liner (76 chars) | The posting agent for your AI: preview, approve, post to X, LinkedIn and more |
| Description (288 chars) | Posteora is the posting agent for your AI. Connect https://posteora.com/mcp to Claude, ChatGPT, Claude Code or Cursor. Your assistant previews fit and credit cost, waits for your yes, then publishes or schedules to X, LinkedIn, Bluesky, Mastodon, Pinterest, TikTok and YouTube. Free tier. |
| Category | Social Media (fallback: Marketing) |
| Tags | mcp, social-media, posting-agent, scheduler, x, twitter, linkedin, bluesky, mastodon, pinterest, tiktok, youtube, claude, chatgpt, oauth |
| Endpoint | https://posteora.com/mcp (Streamable HTTP, stateless JSON) |
| Media upload | POST https://posteora.com/mcp/media (multipart "file", same Authorization header) |
| Repo | https://github.com/kryptic85/posteora-mcp |
| Homepage | https://posteora.com |
| Docs | https://posteora.com/mcp-server |
| Pricing | https://posteora.com/pricing |
| Privacy policy | https://posteora.com/privacypolicy |
| Terms | https://posteora.com/tos |
| Support | support@posteora.com |
| Auth type | OAuth 2.1 (PKCE, dynamic client registration; discovery at https://posteora.com/.well-known/oauth-authorization-server). API key as Bearer token also accepted. |
| Icon | https://posteora.com/static/brand/posteora/app-512.png (512x512 PNG) |
| npm | @posteora/mcp (stdio shim over mcp-remote) |
| Registry name | io.github.kryptic85/posteora |
| Formerly | XposterAI |

Do not claim: Instagram, Facebook, Threads, Reddit, analytics beyond X engagement, "automation", "AI-powered", any user or post counts.

Two product follow-ups surfaced by the forms (not done in this repo):

1. `connection.label` has `idempotentHint` and `openWorldHint` but no `readOnlyHint` or `destructiveHint`. The Anthropic portal flags tools missing one of those two. Add `destructiveHint: False` (or `readOnlyHint: False`) in `taf_flask/mcp_server.py` before submitting there.
2. Reviewer test accounts: OpenAI's portal wants an account that signs in without magic links, email codes or MFA; Anthropic wants a fully populated account. Posteora signs in by magic link, so a reviewer path (a password or a long-lived sign-in link) has to exist first.

---

## 1. Official MCP Registry

- URL: https://registry.modelcontextprotocol.io (verified 200). Docs: https://github.com/modelcontextprotocol/registry/tree/main/docs
- How: `server.json` in this repo plus the `mcp-publisher` CLI. Commands in PUBLISH.md.
- Required: `name` in the GitHub namespace `io.github.kryptic85/<server>` (GitHub login proves control of the account, not the URL), `description` up to 100 characters, `version`, `remotes[].type: streamable-http`, public URL. The optional `packages` entry needs `"mcpName": "io.github.kryptic85/posteora"` in the npm package's package.json (present) and the npm package must be published first. Each remote URL can belong to only one registry name.
- Text: as in `server.json` (description is 99 characters).
- Note: PulseMCP and Glama both say they pick up registry entries, so this one unlocks two others.
- Unverified: whether the icon is displayed; the `icons` field is in the 2025-12-11 schema but the registry UI was not checked.

## 2. PulseMCP

- URL: https://www.pulsemcp.com/submit (verified: answers, but the page says new server and client submissions are temporarily paused).
- What it says to do instead: publish to the Official MCP Registry; PulseMCP imports from it when submissions reopen.
- Text to have ready for when the form reopens: Name, One-liner, Description, Repo, Homepage, Auth type from the shared table.
- Unverified: reopening date, exact form fields.

## 3. Glama

- URL: https://glama.ai/mcp/connectors → button **Add MCP Server → Connector** (verified 200; the form itself is behind a sign-in). FAQ: https://glama.ai/mcp/faq
- Fields: name, short description, server URL (HTTPS, streamable-http). Optional private test credentials; skipped when the server supports OAuth 2.1 dynamic client registration (Posteora does). Only healthy connectors are indexed; connectors are public by default.
- Text: Name `Posteora`; Short description = One-liner; URL `https://posteora.com/mcp`.
- Claim ownership afterwards (needed for the awesome-remote-mcp-servers badge and the auth badge): open the listing → **Claim ownership** → either add the TXT record Glama shows at `_glama-claim.posteora.com`, or publish `https://posteora.com/.well-known/glama.json` with `{"$schema": "https://glama.ai/mcp/schemas/connector.json", "claim": "glama_claim_..."}` (token shown in the portal; the file must not redirect; Glama re-checks daily, seven-day grace). Then under **Manage connector** set the auth method to OAuth so the badge stops reading `auth:none`.
- Unverified: whether the namespace Glama assigns is `com.posteora/posteora` or follows the registry name; the badge URL below uses `com.posteora/posteora` as a placeholder to replace once the listing exists.

## 4. mcp.so

- URL: https://mcp.so/submit (verified 200).
- Fields: submission type (choose **Remote Server**), Repository URL (required), Name. Optional $39 one-time fee for no-review publishing, verified badge, featured placement, dofollow link; the free path is reviewed.
- Text: Type `Remote Server`; Repository URL `https://github.com/kryptic85/posteora-mcp`; Name `Posteora`.
- Unverified: whether the free path asks for a description after the first screen.

## 5. Smithery

- URL: https://smithery.ai/new (verified: redirects to WorkOS sign-in, then returns to /servers/new). Docs: https://smithery.ai/docs/build/publish
- How (URL tab, "bring your own hosting"): enter the public HTTPS URL `https://posteora.com/mcp`, complete the flow. Requirements: Streamable HTTP, OAuth if auth is required. Smithery scans the server for tools; for auth-required servers it prompts you to authenticate once so the scan completes. Smithery handles client registration via Client ID Metadata Documents; Posteora offers dynamic client registration, so the scan sign-in may need the owner to complete OAuth interactively.
- CLI alternative: `smithery mcp publish "https://posteora.com/mcp" -n @kryptic85/posteora`
- Text: Name `Posteora`; description = Description; homepage, repo, tags from the shared table.
- Gotchas from the docs: Smithery's scanner is `SmitheryBot/1.0 (+https://smithery.ai)` from Cloudflare Workers; the server must answer 401 (not 403) for unauthenticated requests. Posteora answers 401 with `WWW-Authenticate` (verified on 2026-10-18). Native clients send no `Origin`, so the Origin allowlist does not block it.
- Unverified: the exact fields after sign-in; whether the Smithery Gateway proxy works with the stateless JSON (no SSE) server. If the scan cannot complete, publish a static card at `https://posteora.com/.well-known/mcp/server-card.json` (format in the Smithery docs; needs a backend change).

## 6. mcpservers.org

- URL: https://mcpservers.org/submit (verified 200; curl without a browser UA gets 403).
- Fields: Server Name; Category (dropdown: Development, Productivity, Database, Search, Web Scraping, File System, Version Control, Communication, Cloud Service, Cloud Storage, Marketing, Finance, Design, Memory, Other); Short Description; Repository, Website or Documentation link; Official MCP Registry Name (optional); checkbox "This server supports remote connections"; Contact Email; plan (Free, up to 2 weeks review, or Premium $39, 24 hours plus badge).
- Text: Server Name `Posteora`; Category `Marketing` (no Social Media category); Short Description = One-liner; Link `https://posteora.com/mcp-server`; Official MCP Registry Name `io.github.kryptic85/posteora`; remote connections: checked; Contact Email `support@posteora.com`; plan Free.

## 7. Anthropic Connectors Directory (claude.ai, Claude Desktop, Cowork)

- URL: https://claude.ai/directory/manage → **Submit new** → **MCP connector** (portal; requires a paid Claude plan). Docs: https://claude.com/docs/connectors/building/submission (verified 200) and https://claude.com/docs/connectors/building/review-criteria
- Requirements: remote HTTPS server; OAuth 2.0 for tools that act on a user's account (Posteora: yes); every tool has a `title` and a `readOnlyHint` or `destructiveHint` (see follow-up 1 above); tested as a custom connector in Claude; documentation URL, privacy policy URL, support contact, icon; test account credentials for reviewers; seven policy acknowledgments.
- Portal steps and text:
  - Connection: `https://posteora.com/mcp` (single URL).
  - Tools: synced from the server; fix any flagged annotation first.
  - Listing: server name `Posteora` (max 100); one-liner (max 200): `The posting agent for your AI. Preview the post and its cost, approve, and Posteora posts or schedules to X, LinkedIn, Bluesky, Mastodon, Pinterest, TikTok and YouTube.`; description (max 2000): Description from the shared table plus the rhythm paragraph: `Rhythm for every post: accounts.list shows what is connected, voice.write (optional) drafts in your trained voice, post.preview returns fit per network and the exact post-credit cost, you say yes, then post.schedule or post.publish. Outcomes come back as queued, published or failed. Media: your assistant uploads attached files straight to Posteora (images up to 5 MB, MP4/MOV up to 100 MB). Free tier with no card; Pro $19/month. Formerly XposterAI.`; categories: Social Media, Marketing, Productivity (pick 1 to 5 from the portal list); documentation URL `https://posteora.com/mcp-server`; privacy policy `https://posteora.com/privacypolicy`; support `support@posteora.com`; icon: the 512 PNG; slug `posteora` (permanent).
  - Use cases: `Post or schedule to connected networks from the chat; draft in the user's voice; find rising posts in the user's lane to reply to.` Prerequisite: `A free Posteora account with at least one network connected at posteora.com/dashboard/studio/connections.` Reads and writes data.
  - Company: `Posteora`, `https://posteora.com`, primary contact support@posteora.com.
  - Authentication: OAuth with dynamic client registration.
  - Data handling: own API; no health data; no sponsored content.
  - Test & launch: reviewer account instructions (see follow-up 2); confirm every tool was run in Claude.
- Unverified: the portal's category list and whether "Social Media" exists there; the exact wording of the seven acknowledgments.

## 8. ChatGPT (OpenAI Apps SDK / plugin directory)

- URL: https://developers.openai.com/apps-sdk/deploy/submission (verified 200). Dashboard: https://platform.openai.com/plugins (not opened; sign-in).
- As of the docs read on 2026-10-18 the submission unit is a plugin ZIP with a `plugin.json` that connects one hosted MCP server. Requirements: verified individual or business identity; stable public HTTPS MCP endpoint; domain verification (host a challenge token as plain text at the URL the portal shows, on posteora.com, which needs a backend route); OAuth via dynamic client registration or a registered client (API-key and bearer connections are not accepted in the portal); `websiteURL`, `supportURL`, `privacyPolicyURL`, `termsOfServiceURL` all HTTPS; logo; a test account without MFA, codes or magic links (follow-up 2); five positive and three negative test cases; an accessible video walkthrough.
- Paste-ready metadata:
  - `name`: `posteora`
  - `version`: `0.1.0`
  - `displayName` (max 30): `Posteora`
  - `shortDescription` (max 30): `Post from your AI, approved`
  - `longDescription` (max 4000): Description from the shared table plus the rhythm paragraph from entry 7.
  - `developerName` (max 80): `Posteora`
  - `category`: pick the closest to Social / Marketing in the dashboard.
  - `websiteURL` `https://posteora.com`; `supportURL` `https://posteora.com/mcp-server`; `privacyPolicyURL` `https://posteora.com/privacypolicy`; `termsOfServiceURL` `https://posteora.com/tos`
  - MCP server URL: `https://posteora.com/mcp`, auth: OAuth, dynamic client registration.
  - Positive test cases (five): list connected accounts; preview a two-network post and read back the cost; schedule the approved post for tomorrow 09:00 with an offset; list the queue; cancel the queued post. Negative (three): publish without a preview or approval (assistant must ask first); schedule a third X post on one day (server refuses); a TikTok post without options (server asks).
- Unverified: dashboard field names beyond the docs; whether the ChatGPT review accepts a server whose consent screen requires an existing Posteora account.

## 9. Claude Code plugin marketplace

- Two routes (docs: https://code.claude.com/docs/en/plugins/publish, verified 200):
  1. **Own marketplace, no submission.** This repo already carries `.claude-plugin/marketplace.json`, `.claude-plugin/plugin.json` and `.mcp.json`, so once it is on GitHub anyone can run:
     ```
     claude plugin marketplace add kryptic85/posteora-mcp
     claude plugin install posteora@posteora
     ```
     Validate before pushing: `claude plugin validate .` from this folder.
  2. **Anthropic's directory** at https://claude.ai/directory/manage → Submit new → Plugin (paid plan). Anthropic's official marketplace `claude-plugins-official` does not take submissions through the portal; it needs a partner contact. Submit the server as a connector too (entry 7); the docs ask for both.
- Text for the directory: name `posteora`; description = One-liner; repo `https://github.com/kryptic85/posteora-mcp`; homepage `https://posteora.com/mcp-server`.
- Unverified: the plugin portal's own field list (behind sign-in).

## 10. awesome-mcp-servers (punkpeye)

- URL: https://github.com/punkpeye/awesome-mcp-servers (verified 200). CONTRIBUTING: https://github.com/punkpeye/awesome-mcp-servers/blob/main/CONTRIBUTING.md
- Scope note from CONTRIBUTING: the list is for servers with a public GitHub repo you install and run yourself; remote-only servers are routed to awesome-remote-mcp-servers (entry 11). This repo ships an installable npm package, so it qualifies on the letter of the rule; the maintainers may still redirect it. Submit entry 11 as well once the Glama badge exists.
- Category: `### 🌐 Social Media` (anchor `social-media`). Entries are one per line, alphabetical by `owner/repo` (case-insensitive) within the category. Insert after `king-of-the-grackles/reddit-research-mcp` and before `kunallunia/twitter-mcp`.
- Legend markers: 🎖️ official implementation, 📇 TypeScript/JavaScript codebase, ☁️ cloud service.
- Exact line:
  ```
  - [kryptic85/posteora-mcp](https://github.com/kryptic85/posteora-mcp) 🎖️ 📇 ☁️ - Posting agent for Claude, ChatGPT and Claude Code: preview fit and credit cost, approve, then publish or schedule to X, LinkedIn, Bluesky, Mastodon, Pinterest, TikTok and YouTube.
  ```
- PR title: `Add kryptic85/posteora-mcp (Social Media)`. Commit message: `Add Posteora MCP server`. Fork-and-PR commands in PUBLISH.md.
- If the repo moves to a `posteora` GitHub org, the entry becomes `posteora/posteora-mcp` and moves to the p section (after `posteverywhere/mcp`).

## 11. awesome-remote-mcp-servers (punkpeye)

- URL: https://github.com/punkpeye/awesome-remote-mcp-servers (verified 200). CONTRIBUTING: https://github.com/punkpeye/awesome-remote-mcp-servers/blob/main/CONTRIBUTING.md
- Requirements: public URL that answers `initialize` (CI checks it; Posteora does, verified 2026-10-18); usable by anyone with public sign-up; Streamable HTTP; a Glama connector badge (required, PRs without it are not merged); the submitting account must have starred the repo.
- Category `### 📣 Social Media`, alphabetical by name (case-insensitive): `Posteora` goes after `Post Bridge` and before `PostLake`.
- Exact entry (three lines; replace `com.posteora/posteora` with the namespace Glama assigns):
  ```
  - [Posteora](https://posteora.com/mcp-server) `https://posteora.com/mcp`
    [![Posteora MCP connector](https://glama.ai/mcp/connectors/com.posteora/posteora/badges/score.svg)](https://glama.ai/mcp/connectors/com.posteora/posteora)
    🔐 - Preview fit and credit cost, approve, then publish or schedule to X, LinkedIn, Bluesky, TikTok, YouTube and more.
  ```
  (description 113 characters, under the 120 limit; marker 🔐 = OAuth.)
