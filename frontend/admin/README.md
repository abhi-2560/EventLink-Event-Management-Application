# EventHub Admin Frontend

Independent admin dashboard for the EventHub platform.

## Run

```bash
npm install
npm run dev
```

Runs on **http://localhost:5175** (proxies `/api` → backend at `http://localhost:5000`).

## Build

```bash
npm run build
npm run preview
```

## Environment

| Variable | Default |
|----------|---------|
| `VITE_API_BASE_URL` | `/api` |

## Login

Use admin credentials from backend seed (`admin@example.com` / `Admin@123`).
