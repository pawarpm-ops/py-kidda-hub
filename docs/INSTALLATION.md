# Installation Guide

## Prerequisites

- Node.js 22+
- Docker Desktop
- PostgreSQL client tools if you want to run SQL manually

## Local Development

```bash
npm install
npm --prefix client install
npm --prefix server install
docker compose up -d postgres
cp server/.env.example server/.env
npm run seed
npm run dev
```

Visit `http://localhost:5173`.

The backend includes an automatic in-memory demo mode. If PostgreSQL is not running, registration and login still work, but data resets when the server restarts.

## Google Sign-In Setup

1. Open Google Cloud Console.
2. Create an OAuth 2.0 Client ID of type `Web application`.
3. Add your app URL to Authorized JavaScript origins, for example:

```text
http://localhost:5173
https://your-public-domain.example
```

4. Add the client ID to both env files:

```bash
cp client/.env.example client/.env
```

```text
server/.env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

client/.env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

5. Restart both frontend and backend servers.

## Production Setup

1. Change `JWT_SECRET` to a long random value.
2. Set `CORS_ORIGIN` to your real frontend domain.
3. Keep `EXECUTION_MODE=docker` for secure code execution.
4. Run:

```bash
docker compose up --build -d
```

## Sharing With Students

For a public link, deploy this project to a college server, VPS, or cloud VM and attach a domain such as:

```text
https://pythonlab.yourcollege.edu
```

If you want a quick temporary link from your computer, run the app locally and expose port `5173` with a tunneling service such as Cloudflare Tunnel or ngrok.

## Security Notes

- The Docker execution runner disables networking and applies memory/CPU limits.
- Use HTTPS in production.
- Do not expose the database publicly.
- Rotate JWT secrets before student onboarding.
- Add mail delivery credentials before enabling real password reset emails.
