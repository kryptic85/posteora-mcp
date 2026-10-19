# Posteora MCP server

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@posteora/mcp.svg)](https://www.npmjs.com/package/@posteora/mcp)

Posteora is the posting agent for your AI. Connect `https://posteora.com/mcp` to Claude, ChatGPT, Claude Code or Cursor, and your assistant previews the post and its cost, waits for your yes, then publishes or schedules it to X, LinkedIn, Bluesky, Mastodon, Pinterest, TikTok and YouTube.

The server is hosted at `https://posteora.com/mcp` (Streamable HTTP). This repo holds the public setup notes, the registry metadata (`server.json`) and a small stdio shim (`npx @posteora/mcp`) for clients that cannot take a URL.

- Website: https://posteora.com
- Server docs: https://posteora.com/mcp-server
- Pricing: https://posteora.com/pricing
- Support: support@posteora.com

Posteora was formerly XposterAI. Connections made under the old name keep working.

## Install

Every client signs in on the Posteora consent screen ("Sign in with Posteora", OAuth 2.1). You need a free Posteora account with at least one network connected at https://posteora.com/dashboard/studio/connections.

### Claude (claude.ai and Claude Desktop)

1. Open **Settings → Connectors → Add custom connector**.
2. Paste `https://posteora.com/mcp` as the URL. Leave the other fields empty.
3. Click **Connect**, sign in on Posteora, click **Allow**.

### Claude Code

```bash
claude mcp add --transport http posteora https://posteora.com/mcp
```

Then inside Claude Code type `/mcp`, pick **posteora**, choose **Authenticate** and click **Allow** in the browser. The sign-in link expires after a few minutes; `/mcp` gives you a fresh one.

Or install it as a Claude Code plugin from this repo (Claude Code 2.1.275 or later), which adds the same server:

```
/plugin install posteora --marketplace kryptic85/posteora-mcp
```

On first use from a project, the assistant calls `connection.label` with the folder name so you can tell this connection apart from your other projects on Dashboard → AI Assistants. You can ask for it directly:

```
Call connection.label with alias "my-project".
```

### ChatGPT

1. In ChatGPT settings, turn on **developer mode** for connectors.
2. Add a connector with the server address `https://posteora.com/mcp`.
3. Sign in with Posteora if it is offered. If the connector only takes a static header, paste your API key from https://posteora.com/Account#mcpSection as `Authorization: Bearer YOUR_API_KEY`.

### Cursor (and other clients that read `mcp.json`)

```json
{
  "mcpServers": {
    "posteora": {
      "url": "https://posteora.com/mcp"
    }
  }
}
```

For a client that only takes a static header, use the API key:

```json
{
  "mcpServers": {
    "posteora": {
      "url": "https://posteora.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

### stdio-only clients: `npx @posteora/mcp`

Some clients only launch a local process. The shim runs [`mcp-remote`](https://www.npmjs.com/package/mcp-remote) against `https://posteora.com/mcp` and passes stdio through. OAuth sign-in opens the browser on first use.

```json
{
  "mcpServers": {
    "posteora": {
      "command": "npx",
      "args": ["-y", "@posteora/mcp"]
    }
  }
}
```

With an API key instead of OAuth, set `POSTEORA_API_KEY` in `env`, or pass `--header "Authorization: Bearer YOUR_API_KEY"` in `args`. `npx @posteora/mcp --help` prints the options.

## Auth

Two token kinds share the `Authorization: Bearer` header:

- **Sign in with Posteora** (OAuth 2.1, PKCE, dynamic client registration). Discovery at `https://posteora.com/.well-known/oauth-authorization-server`. Scopes: `accounts:read`, `posts:read`, `posts:write`, `voice:write`, `radar:read`. The consent screen lists them in plain words. Tokens are hashed at rest and can be revoked from Dashboard → AI Assistants.
- **Account API key**, for clients that only take a static header. Find it under Account. Regenerating it signs every API-key assistant out at once.

An unauthenticated call gets a 401 with `WWW-Authenticate` pointing at the resource metadata, so a client that understands MCP auth starts the sign-in itself.

## The rhythm: preview, then approve

The server's instructions ask the assistant to run every post the same way:

1. `accounts.list` (free) to see what is connected.
2. `voice.write` (1 AI credit) only when you want it written for you.
3. `post.preview` (free) for fit and cost. The assistant shows you the text and the receipt ("N post credits at send") and waits for your yes.
4. `post.schedule` or `post.publish`. Nothing is queued or published that you have not seen.

Outcomes come back in three words: queued, published, failed.

This rhythm is instructed, not enforced: an assistant that skips `post.preview` can still call `post.publish`. What the server does enforce: a fresh `idempotency_key` per publish (a retry with the same key returns the first result instead of posting twice), at most two X posts per local day, and TikTok posts are refused without the user's privacy choices.

## Tools

Dotted names are the tool ids. Costs are in Posteora credits: AI credits for writing, post credits for sending.

| Tool | What it does | Key arguments | Cost |
|---|---|---|---|
| `accounts.list` | Lists the networks connected to the account with per-network limits (`max_chars`, `supports_video`, `supports_threads`, `status`). Call it first. An empty list means a network must be connected on the website. | none | free |
| `connection.label` | Names this connection (for example the project folder) so it can be told apart from other assistants on the AI Assistants page. | `alias` (1 to 60 chars) | free |
| `credits.get` | Current AI credits, post credits and plan. | none | free |
| `voice.write` | Writes a post or a reply in the user's trained voice (their persona). Returns the text plus signal-guard warnings (links, bait, generic openers). | `kind` (`post` or `reply`), `topic`, `tweet_text` (for replies), `tone`, `persona_id`, `length`, `max_chars` | 1 AI credit |
| `media.upload` | Uploads a local image as base64 and returns a `media_id`. JPEG, PNG, WebP or GIF up to 5 MB. For video, use the HTTP upload below. | `data_base64`, `mime`, `filename` | free |
| `post.preview` | Fit and cost before anything is queued: characters per network, exact post-credit cost (an X post containing a link costs 13 instead of 1), link and bait warnings, TikTok readiness. Returns `receipt`, `affordable` and `next`. | `text` or `thread`, `targets`, `media_url`, `media_ids`, `reply_to`, `options` | free |
| `post.publish` | Publishes an approved post now to the given networks. Every result carries a `record_id` for `post.status`. | `targets`, `idempotency_key`, plus the `post.preview` arguments | post credits per network |
| `post.schedule` | Queues an approved post for later. `scheduled_for` is ISO-8601 with a timezone offset. Refuses a third X post on the same day and TikTok posts without options. `draft: true` saves a draft instead. | `targets`, `scheduled_for`, `draft`, plus the `post.preview` arguments | post credits at send |
| `post.queue` | Lists queued (pending) and draft posts, soonest first. | `status`, `limit` | free |
| `post.cancel` | Cancels a queued post (drafts are deleted). | `scheduled_post_id` | free |
| `post.status` | Outcome of a scheduled post or a single publish record, with URLs. | `scheduled_post_id` or `record_id` | free |
| `radar.find` | Trend Radar: rising posts in the user's lane worth replying to now. Results cached 15 minutes, 10 finds a day, empty results refunded. Pair with `voice.write kind="reply"`. | `keywords` (up to 5), `force` | 3 AI credits, first 5 finds free |

Shared post arguments:

- `targets`: platform ids from `accounts.list`, for example `["x", "bluesky", "tiktok"]`.
- `thread`: 2 to 25 tweets sent as one queued item, on networks with `supports_threads`. Each tweet is billed like a post; a thread counts as one X post for the two-a-day rule.
- `reply_to`: publish as a reply under one of the user's own X posts (URL or id, X the only target). Ownership is verified; replies to other people's posts are refused. This is how a link goes under a post a few minutes later without a link in the post itself.
- `options.tiktok`: `privacy_level`, `allow_comment`, `allow_duet`, `allow_stitch`, `disclose_commercial`, `brand_organic_toggle`, `brand_content_toggle`. Required when TikTok is a target; the assistant asks you for them.
- `options.youtube.privacy_status`: `private`, `unlisted` or `public`. YouTube takes exactly one video; the assistant asks which visibility you want.

Resources: `posteora://accounts` (same as `accounts.list`) and `posteora://personas` (the user's voice personas). Prompts: `first_post`, `launch_post`, `reply_in_lane`, `daily_batch`.

## Example run

Scripted, not live data. You said: "Schedule this for Friday 9am on X and Bluesky: Shipping the new onboarding today. Three screens, one decision per screen, nothing to configure before the first post goes out."

```
› accounts.list
  x (@yourhandle, active, 280 chars) · bluesky (you.bsky.social, active, 300 chars)

› post.preview  targets=["x","bluesky"]
  targets:
    X        110/280 chars   1 credit
    Bluesky  110/300 chars   1 credit
  total_post_credits: 2        post_credits_available: 18
  affordable: true             guard: []
  receipt: "2 post credits at send. X: 110/280 chars, 1 credit;
            Bluesky: 110/300 chars, 1 credit. 18 post credits available."
  next: "Show the user the text and this receipt, then wait for their yes
         before post.schedule or post.publish."

  Assistant: Here is the text and the receipt. 2 post credits at send,
  Friday 2026-10-23 09:00 (UTC-07:00) on X and Bluesky. Waiting for your yes.

You: yes

› post.schedule  scheduled_for="2026-10-23T09:00:00-07:00"
  status: queued   scheduled_post_id: 4821
  receipt: "Queued for Fri 2026-10-23 09:00 (UTC-07:00) on X and Bluesky.
            2 post credits at send. It is in your Studio calendar:
            https://posteora.com/dashboard/studio/activity"
```

If the text had contained a link, the X row would read `13 credits (link post)` and `next` would suggest a link-free post with the link in a `reply_to` post a few minutes later.

## Pictures and video

Assistants fail image and video posts when they insist on a public link. The rules the server gives them:

- A file you attach in the chat is uploaded straight to Posteora: `HTTP POST https://posteora.com/mcp/media`, multipart form field `file`, same `Authorization` header as `/mcp`. It returns a `media_id`. For images the `media.upload` tool does the same with base64.
- Pass that id as `media_ids` to `post.preview`, then to `post.schedule` or `post.publish`. It stays valid for as long as the post is queued.
- `media_url` is only for an https file that is already public. Private hosts, redirects to non-https locations and third-party upload sites are refused.
- Limits: JPEG, PNG, WebP or GIF up to 5 MB; MP4 or MOV up to 100 MB. X takes video up to 140 seconds. The content is sniffed, not trusted from the file name.

```bash
curl -X POST https://posteora.com/mcp/media \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@launch.mp4"
# {"ok": true, "media_id": 123, "kind": "video", "mime": "video/mp4", "bytes": ..., "next": "Pass \"media_ids\": [123] to post.preview, then post.schedule or post.publish."}
```

## Plans

Free tier, no card, assistant included. Pro is $19 a month with unlimited posts (fair use). Details at https://posteora.com/pricing. Tool calls spend the same credits the web Studio spends; nothing is free here that is not free there.

## What it does not do yet

- Instagram, Facebook, Threads and Reddit are not supported.
- No analytics beyond the X engagement the Trend Radar reads.
- Connecting a network, training a voice persona and billing stay on the website; the tools return the URL instead.
- Replies to other people's posts are drafted (`voice.write kind="reply"`) but not published; you post those yourself on X. Only replies under your own X posts are published (`reply_to`).
- The server is stateless JSON over Streamable HTTP; it does not open SSE streams. `GET /mcp` answers 405.

## Links

- https://posteora.com
- https://posteora.com/mcp-server (server docs)
- https://posteora.com/pricing
- https://posteora.com/privacypolicy and https://posteora.com/tos
- support@posteora.com

MIT licensed. Copyright 2026 Posteora.
