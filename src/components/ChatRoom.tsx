"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
    message: string;
    sender: string;
    timestamp: string;
}

export default function ChatRoom() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [username, setUsername] = useState("");
    const [isJoined, setIsJoined] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [userCount, setUserCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isJoined) return;

        // Connect to the socket server
        const socketInstance = io();

        socketInstance.on("connect", () => {
            console.log("Connected to WebSocket server");
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            console.log("Disconnected from WebSocket server");
            setIsConnected(false);
        });

        socketInstance.on("new-message", (data: Message) => {
            setMessages((prev) => [...prev, data]);
        });

        socketInstance.on("user-count", (count: number) => {
            setUserCount(count);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [isJoined]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleJoin = () => {
        if (username.trim()) {
            setIsJoined(true);
        }
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !socket) return;

        socket.emit("send-message", {
            message: newMessage.trim(),
            sender: username,
        });

        setNewMessage("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isJoined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-slate-900 to-green-700 flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold text-white">
                            CPIT-630 - Assignment #1
                        </CardTitle>
                        <p className="text-white/70 mt-2">
                            WebSocket communication between 2 PCs
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleJoin()}
                            className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-purple-500"
                        />
                        <Button
                            onClick={handleJoin}
                            disabled={!username.trim()}
                            className="w-full bg-green-800  text-white font-semibold py-3 cursor-pointer"
                        >
                            Join Chat Room
                        </Button>
                        <span className="w-full flex flex-col items-center text-white text-xs">
                            Made by: Majed A. Alhasin
                        </span>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex flex-col p-4">
            <Card className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="border-b border-white/20">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-white">
                            Messages Room
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <span className="text-white/70 text-sm">
                                {userCount} online
                            </span>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                                        }`}
                                />
                                <span className="text-white/70 text-sm">
                                    {isConnected ? "Connected" : "Disconnected"}
                                </span>
                            </div>
                            <span className="text-white/50 text-sm">({username})</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-white/50 text-center">
                                    No messages yet. Start the conversation!
                                    <br />
                                    <span className="text-sm">
                                        Open this page on another PC/browser to chat.
                                    </span>
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === username ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender === username
                                            ? "bg-gradient-to-r from-green-600 to-green-600 text-white"
                                            : "bg-white/20 text-white"
                                            }`}
                                    >
                                        {msg.sender !== username && (
                                            <p className="text-xs font-semibold text-green-300 mb-1">
                                                {msg.sender}
                                            </p>
                                        )}
                                        <p className="break-words">{msg.message}</p>
                                        <p className="text-xs opacity-60 mt-1 text-right">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-purple-500"
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 cursor-pointer"
                        >
                            Send
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
