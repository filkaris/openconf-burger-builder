# OpenConf Burgers builder

The build-your-own-burger configurator for OpenConf Burgers, a local burger shop.
It lives inside a larger delivery app: its only job is to let a customer stack
a burger and see the price.

## Requirements

- Node.js 20.11 or newer
- Nothing else: there are no dependencies to install

## Run it

The kitchen API is run by the delivery platform. Run its local mock in a
second terminal and leave it open:

```sh
npx --allow-git=all github:filkaris/openconf-kitchen   # kitchen API on http://localhost:4100
```

Then, in this repo:

```sh
npm start        # app on http://localhost:3000
npm test
```

Port taken? `PORT=3001 npm start`. Kitchen on another port?
`KITCHEN_API_URL=http://localhost:4101 npm start`.

## Layout

| Path | What's there |
|---|---|
| `src/routes/` | HTTP route handlers |
| `src/services/` | Kitchen API integrations |
| `src/lib/` | Router, HTTP helpers, API client, pricing |
| `public/` | Frontend (vanilla JS, no build step) |
| `docs/` | Kitchen API docs and architecture decisions (`docs/adr/`) |
| `prompts/` | Reusable prompts for AI coding tools |
