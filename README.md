# Webeenthere — App Overview and Architecture

## What this app does
- Premium website builder with GrapesJS core editor (drag-and-drop canvas)
- AI-assisted template generation and canvas improvements (OpenRouter → DeepSeek)
- User authentication and plans with subscription limits/entitlements
- Publishing/export of websites to HTML/CSS

## Architecture
- Client: Next.js app in `client/` with GrapesJS editor UI and builder tools
- Server: Node/Express app in `server/` exposing REST APIs (AI, websites, templates, analytics, subscriptions)
- Database: MySQL (via custom ORM layer) storing users, websites, templates, analytics

## Builder (GrapesJS) integration
- Loads and saves plain HTML + CSS directly, no Tailwind runtime required
- AI improvements inject responsive, accessible, mobile‑first CSS
- Replaceable content is marked with `data-slot` attributes (e.g., `data-slot="logo"`)

## AI generation format
The AI responses are normalized to strict JSON the canvas can consume reliably:

```json
{
  "html": "<header class=\"site-header\" data-slot=\"logo\"></header><main id=\"hero\" data-slot=\"hero_image\"></main>",
  "css": ":root{--brand:#2563eb}/* mobile-first CSS */\n@media(max-width:768px){ /* ... */ }",
  "slots": [
    { "id": "logo", "type": "image", "description": "Brand logo image" },
    { "id": "hero_image", "type": "image", "description": "Prominent hero visual" },
    { "id": "primary_cta", "type": "text", "description": "Primary call-to-action label" }
  ],
  "meta": { "title": "...", "colorScheme": "..." }
}
```

## Subscriptions
- AI routes enforce plan usage when the user is authenticated
- Usage accounting persists via `SubscriptionService` and is checked prior to AI calls

## Export/publish
- Export endpoint stitches `css_content` with `html_content` into a single HTML artifact
- Output is safe (no scripts/iframes/@import from remote)

## Security and secrets
- Secrets are read from environment variables only (never from client code)
- Do not commit `.env*`, backups, or token JSON files; rotate any leaked keys immediately

---

## Third‑Party Notices

### GrapesJS (BSD 3‑Clause)
This project uses GrapesJS (BSD 3‑Clause License). Keep this notice with your application.

BSD 3‑Clause License

Copyright (c) 2016–present, GrapesJS contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Source: https://github.com/GrapesJS/grapesjs
