# CPIT-630 — Socket Communication App

Real-time chat between 2 PCs using WebSockets (Socket.io).

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)

## How to Run

### 1. Start the Server

```bash
cd server
npm install
node server.js or npm start
```

Server will start on **http://localhost:4000**

### 2. Start the Client

Open a **new terminal** in the project root:

```bash
npm install
npm run dev
```

Client will start on **http://localhost:3000**

### 3. Chat

1. Open **http://localhost:3000** on PC 1 (or Browser tab 1)
2. Open **http://localhost:3000** on PC 2 (or Browser tab 2)
3. Enter a username on each and click **Connect to Chat**
4. Start messaging!

> **Note:** If running on two different PCs, replace `localhost` with the IP address of the PC running the server.

---

Made by **Majed A. Alhasin, 2601443**

---
Professor: **Adil Khadidos**