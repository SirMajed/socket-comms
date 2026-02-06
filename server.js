const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    // Create Socket.io server
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    // Track connected users
    let connectedUsers = 0;

    io.on("connection", (socket) => {
        connectedUsers++;
        console.log(`User connected. Total users: ${connectedUsers}`);

        // Broadcast user count to all clients
        io.emit("user-count", connectedUsers);

        // Handle incoming messages
        socket.on("send-message", (data) => {
            console.log(`Message from ${data.sender}: ${data.message}`);
            // Broadcast message to all connected clients
            io.emit("new-message", {
                message: data.message,
                sender: data.sender,
                timestamp: new Date().toISOString(),
            });
        });

        // Handle disconnect
        socket.on("disconnect", () => {
            connectedUsers--;
            console.log(`User disconnected. Total users: ${connectedUsers}`);
            io.emit("user-count", connectedUsers);
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> WebSocket server running on the same port`);
    });
});
