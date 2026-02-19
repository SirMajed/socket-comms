# Socket Chat — Client + Server Architecture

Two Docker containers for real-time WebSocket chat between 2 PCs.

```
┌─────────────────┐         ┌─────────────────┐
│  socket-client  │◄──────►│  socket-server  │
│  (Next.js UI)   │  WS     │  (Socket.io)    │
│  Port 3000      │         │  Port 4000      │
└─────────────────┘         └─────────────────┘
```

## 📁 Structure

```
socket/
├── server/              ← Docker #1: Socket Server
│   ├── server.js        ← The whole server (one file)
│   ├── package.json
│   └── Dockerfile
├── src/                 ← Docker #2: Client UI
│   └── components/
│       └── ChatRoom.tsx
├── Dockerfile
└── docker-compose.yml
```

## 🚀 Quick Start (Local Dev)

**Terminal 1 — Start the socket server:**
```bash
cd server
npm install
node server.js
# Server running on port 4000
```

**Terminal 2 — Start the client:**
```bash
npm install
npm run dev
# Client running on port 3000
```

Open `http://localhost:3000` in two browsers and chat!

---

## 🐳 Docker Build (for Unraid)

### Build both images:
```bash
# Build the socket server image
docker build -t socket-server:latest ./server

# Build the client image (set YOUR_UNRAID_IP)
docker build -t socket-client:latest \
  --build-arg NEXT_PUBLIC_SOCKET_URL=http://YOUR_UNRAID_IP:4000 .
```

### Export as .tar for Unraid:
```bash
docker save -o socket-server.tar socket-server:latest
docker save -o socket-client.tar socket-client:latest
```

### Or use docker-compose:
Edit `docker-compose.yml` and change `NEXT_PUBLIC_SOCKET_URL` to your Unraid IP, then:
```bash
docker-compose up -d
```

---

## ⚙️ Unraid Setup

1. Copy both `.tar` files to your Unraid
2. Load them:
   ```bash
   docker load -i socket-server.tar
   docker load -i socket-client.tar
   ```
3. Create two Docker containers in Unraid:
   - **socket-server**: Port `4000:4000`
   - **socket-client**: Port `3000:3000`, build with `NEXT_PUBLIC_SOCKET_URL=http://YOUR_UNRAID_IP:4000`

## 📝 How It Works

1. **socket-server** runs Socket.io on port 4000 (plain Node.js, one file)
2. **socket-client** is the Next.js UI on port 3000
3. When a user opens the client, it connects to the socket server via WebSocket
4. Messages are broadcast to all connected clients in real-time
