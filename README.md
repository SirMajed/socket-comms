# Socket Chat - Local WebSocket Communication

A simple Next.js + shadcn/ui chat application that allows 2 PCs to communicate using local WebSocket (Socket.io).

**No external services needed!** Everything runs on your local network.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 How to Test (2 PCs Communicating)

### Option 1: Same PC, Different Browsers
1. Open `http://localhost:3000` in Chrome → Enter username "Alice"
2. Open `http://localhost:3000` in Firefox → Enter username "Bob"
3. Start chatting! Messages appear in real-time on both browsers

### Option 2: Two Different PCs on Same Network
1. Run `npm run dev` on PC 1
2. Note the network URL shown in terminal (e.g., `http://192.168.x.x:3000`)
3. On PC 2, open that network URL in browser
4. Both PCs can now chat through the WebSocket!

## 🏗️ Tech Stack

- **Next.js** - React framework
- **Socket.io** - Local WebSocket communication
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx       # Main page
│   ├── layout.tsx     # Root layout
│   └── globals.css    # Global styles
├── components/
│   ├── ChatRoom.tsx   # Main chat component
│   └── ui/            # shadcn components
└── lib/
    └── utils.ts       # Utility functions

server.js              # Custom server with WebSocket
```

## 📝 How It Works

1. **Custom Server**: `server.js` runs Next.js with Socket.io on the same port
2. **User connects**: Opens browser, enters username, joins chat
3. **WebSocket connection**: Client connects to server via Socket.io
4. **Send message**: Client emits message event to server
5. **Broadcast**: Server broadcasts to ALL connected clients
6. **Receive**: All clients receive the message instantly

## ⚠️ Vercel Deployment Note

This app uses a custom WebSocket server and **cannot be deployed to Vercel** (serverless doesn't support WebSockets). 

For deployment, use platforms that support persistent connections:
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- **Your own VPS**
