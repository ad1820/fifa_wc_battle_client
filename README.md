# FIFA World Cup Battle — Client

Interactive React client for comparing FIFA World Cup teams and presenting AI-generated match battles.

**Live demo:** [fifa-wc-battle-client.vercel.app](https://fifa-wc-battle-client.vercel.app)

## Features

- Browse and select World Cup teams
- Create head-to-head team battles
- Display generated match narratives and results
- Firebase-backed authentication
- Client-side routing and responsive interface
- Separate API service for game logic and persistence

## Technology

- React 19
- Vite
- React Router
- Firebase
- React Icons

## Local development

### Prerequisites

- Node.js 20+
- npm
- A Firebase web application
- A running instance of the [server](https://github.com/ad1820/fifa_wc_battle_server)

### Setup

```bash
git clone https://github.com/ad1820/fifa_wc_battle_client.git
cd fifa_wc_battle_client
npm install
npm run dev
```

Configure the Firebase and API values expected by the application in a local `.env` file. Do not commit credentials.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |

## Related repository

The backend API, authentication verification, persistence, and match-generation services live in [fifa_wc_battle_server](https://github.com/ad1820/fifa_wc_battle_server).

## Status

This project is under active development. Planned improvements include broader tournament data, richer match visualization, automated tests, and expanded accessibility coverage.
