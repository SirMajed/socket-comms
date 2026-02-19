/**
 * ============================================================
 *  CPIT-630 — Assignment #1: Socket Communication Server
 * ============================================================
 *
 *  Server Component:
 *  - Listens on port 8080 and accepts connections from multiple clients.
 *  - Handles incoming messages from clients and broadcasts (relays)
 *    them to all other connected clients in real-time.
 *  - Uses TCP (via Socket.io over HTTP) for reliable, ordered delivery.
 *  - Socket.io internally handles concurrent clients using an
 *    event-driven, non-blocking I/O model (similar to multi-threading).
 *  - Includes robust error handling for connection failures,
 *    invalid inputs, and network interruptions.
 *
 *  Author: Majed A. Alhasin
 * ============================================================
 */

const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 8080;

// ─── HTTP Server ────────────────────────────────────────────
// A simple HTTP server that also serves as the transport layer
// for our WebSocket (Socket.io) connections (TCP-based).

const httpServer = http.createServer((req, res) => {
    try {
        if (req.url === "/health") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
            return;
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("CPIT-630 Socket Server is running");
    } catch (err) {
        console.error("[ERROR] HTTP request failed:", err.message);
        res.writeHead(500);
        res.end("Internal Server Error");
    }
});

// ─── Socket.io Server ──────────────────────────────────────
// Creates a WebSocket server on top of the HTTP server.
// Socket.io uses TCP underneath for reliable, ordered data delivery.
// CORS is set to allow connections from any client origin.

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// ─── Connection Tracking ───────────────────────────────────
let connectedUsers = 0;

// ─── Handle Client Connections ─────────────────────────────
// Each client connection creates a new socket instance.
// Socket.io handles multiple concurrent clients automatically
// using Node.js event-driven architecture (non-blocking I/O).

io.on("connection", (socket) => {
    try {
        connectedUsers++;
        console.log(`[+] Client connected (id: ${socket.id}). Total: ${connectedUsers}`);
        io.emit("user-count", connectedUsers);

        // ─── Receive & Broadcast Messages ────────────────────
        // When a client sends a message, the server broadcasts it
        // to ALL connected clients (relay / chat functionality).
        socket.on("send-message", (data) => {
            try {
                // Validate input
                if (!data || !data.sender || !data.message) {
                    console.error("[ERROR] Invalid message data received");
                    return;
                }

                console.log(`[MSG] ${data.sender}: ${data.message}`);

                // Broadcast to all connected clients
                io.emit("new-message", {
                    message: data.message,
                    sender: data.sender,
                    timestamp: new Date().toISOString(),
                });
            } catch (err) {
                console.error("[ERROR] Failed to handle message:", err.message);
            }
        });

        // ─── Handle Client Disconnect ────────────────────────
        socket.on("disconnect", (reason) => {
            try {
                connectedUsers--;
                console.log(`[-] Client disconnected (id: ${socket.id}, reason: ${reason}). Total: ${connectedUsers}`);
                io.emit("user-count", connectedUsers);
            } catch (err) {
                console.error("[ERROR] Disconnect handler failed:", err.message);
            }
        });

        // ─── Handle Socket Errors ────────────────────────────
        socket.on("error", (err) => {
            console.error(`[ERROR] Socket error (id: ${socket.id}):`, err.message);
        });

    } catch (err) {
        console.error("[ERROR] Connection handler failed:", err.message);
    }
});

// ─── Start Server ──────────────────────────────────────────
try {
    httpServer.listen(PORT, "0.0.0.0", () => {
        console.log("╔══════════════════════════════════════════╗");
        console.log("║   CPIT-630 — Socket Communication Server ║");
        console.log(`║   Listening on port ${PORT}                  ║`);
        console.log("║   Waiting for client connections...       ║");
        console.log("╚══════════════════════════════════════════╝");
    });
} catch (err) {
    console.error("[FATAL] Failed to start server:", err.message);
    process.exit(1);
}

// ─── Global Error Handlers ─────────────────────────────────
// Prevents the server from crashing on unexpected errors.

process.on("uncaughtException", (err) => {
    console.error("[FATAL] Uncaught exception:", err.message);
});

process.on("unhandledRejection", (err) => {
    console.error("[FATAL] Unhandled rejection:", err);
});
