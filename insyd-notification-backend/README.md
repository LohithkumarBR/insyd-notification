
# Insyd Notification Backend (POC)

## Quick Start
```bash
cd insyd-notification-backend
cp .env.example .env
# edit .env if needed
npm install
npm run dev
```
API runs on `http://localhost:4000`.

### REST
- `POST /events`
- `GET /notifications/:userId`
- `POST /notifications`
- `POST /notifications/:id/read`

Seed users created on first run: `alice`, `bob`.
Use MongoDB to find their `_id` values, or add a debug endpoint if needed.
