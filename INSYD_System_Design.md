
# Insyd Notification System — System Design Document (POC → 1M DAUs)

## 1) Introduction
Goal: Build a notification system that keeps Insyd users engaged with timely updates for social activities (likes, comments, follows, posts). POC targets ~100 DAUs; design should scale to 1M DAUs.

## 2) System Overview (Non-technical)
When someone performs an action (e.g., likes your post), the system turns that action into an event, processes that event into a notification, stores it, and shows it to you in the app. POC focuses on in‑app notifications only (no auth, no email/push).

## 3) High-level Architecture
```
[Client (React)]
   |  (POST /events, GET /notifications/:userId)
   v
[API Gateway/Backend (Express)]
   |  publishes events
   v
[Events Queue]  --->  [Notification Worker]  --->  [DB: Notifications, Users, Events]
                             |                               |
                             +------>  emits/persists   <----+
                                       notifications
```
POC uses an in‑memory queue and polling; production plan uses Kafka/RabbitMQ and WebSockets.

### Core Components
- **Event Source (API)**: Receives user actions.
- **Queue**: Buffers events.
- **Notification Service (Worker)**: Transforms events → notifications.
- **Database (MongoDB)**: Persists users, events, notifications.
- **Delivery (In‑app)**: Exposed via REST; polling on client for simplicity.

## 4) Data Design (MongoDB/Mongoose)
**Users**  
```js
{ _id, username, email, preferences: { inApp: Boolean } }
```
**Events**  
```js
{ _id, type, sourceUserId, targetUserId, data, timestamp }
```
**Notifications**  
```js
{ _id, userId, type, content, status, timestamp }
```
Indexes:
- Notifications: `{ userId: 1, timestamp: -1 }`
- Events: `{ targetUserId: 1, timestamp: -1 }`

## 5) Execution Flow
1. Client posts an event (like/follow/comment/post) → `/events`.
2. Backend appends to queue & persists event.
3. Worker consumes queue, generates human‑readable content, stores Notification.
4. Client polls `GET /notifications/:userId` every N seconds and renders list.

## 6) Scale & Performance
- **100 DAUs (POC)**: Single node, in‑memory queue, polling (5s), MongoDB single replica.
- **→ 1M DAUs**
  - Replace in‑memory with Kafka/RabbitMQ; multiple consumer groups.
  - Horizontal scale: stateless API behind a load balancer; autoscale worker pools.
  - DB: MongoDB sharding on `userId`; TTL for stale events; archive old notifications.
  - WebSockets (or Server‑Sent Events) via a Notification Gateway (e.g., NGINX + Redis pub/sub / Kafka).
  - Batching & coalescing (e.g., “12 people liked your post”).  
  - Rate limiting + backpressure.
  - Idempotency keys on events to avoid duplications.
  - Observability: tracing on event path; DLQ for poison messages.

## 7) Trade‑offs
- **Polling vs WebSockets**: Polling is simpler but adds latency & load; WebSockets are real‑time but more infra ops.
- **MongoDB**: Flexible schema & fast iteration; at very high write volume, careful shard keys and write concerns needed.
- **No caching in POC**: Simpler; at scale, add Redis for hot feeds & unread counts.

## 8) Limitations
- No auth/permissions; mock users only.
- In‑memory queue not durable; restarts lose in‑flight events (OK for POC).
- Polling introduces 1–5s delay in UI.

## 9) API Spec (POC)
- `POST /events` – body: `{ type, sourceUserId, targetUserId, data? }`
- `GET /notifications/:userId?status=unread|read` – list notifications (newest first)
- `POST /notifications` – create notification (test hook)
- `POST /notifications/:id/read` – mark as read (optional POC endpoint)

## 10) Deployment
- Backend: Render/Heroku/Vercel (Node + MongoDB Atlas).
- Frontend: Vercel/Netlify (React + Vite); set `VITE_API_BASE` env.
- Env vars: `MONGODB_URI`, `PORT`.

## 11) Conclusion
Design meets POC needs and lays a clear upgrade path to production at 1M DAUs with queues, sharding, and a real‑time delivery channel.
