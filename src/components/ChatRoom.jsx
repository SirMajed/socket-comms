"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatRoom() {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [username, setUsername] = useState("");
    const [isJoined, setIsJoined] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [userCount, setUserCount] = useState(0);
    const [error, setError] = useState("");
    const messagesEndRef = useRef(null);

    // Connect to socket server when user joins
    useEffect(() => {
        if (!isJoined) return;

        let socketInstance;

        try {
            const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
            socketInstance = io(serverUrl, {
                reconnection: true,
                reconnectionAttempts: 2,
                reconnectionDelay: 2000,
                timeout: 5000,
            });

            socketInstance.on("connect", () => {
                setIsConnected(true);
                setError("");
            });

            socketInstance.on("disconnect", () => {
                setIsConnected(false);
            });

            socketInstance.on("connect_error", (err) => {
                console.error("Connection error:", err.message);
                setError("Cannot reach server. Retrying...");
                setIsConnected(false);
            });

            socketInstance.on("new-message", (data) => {
                try {
                    setMessages((prev) => [...prev, data]);
                } catch (err) {
                    console.error("Failed to process message:", err);
                }
            });

            socketInstance.on("user-count", (count) => {
                try {
                    setUserCount(count);
                } catch (err) {
                    console.error("Failed to update user count:", err);
                }
            });

            setSocket(socketInstance);
        } catch (err) {
            console.error("Failed to initialize socket:", err);
            setError("Failed to connect to server.");
        }

        return () => {
            try {
                socketInstance?.disconnect();
            } catch (err) {
                console.error("Failed to disconnect:", err);
            }
        };
    }, [isJoined]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleJoin = () => {
        const trimmed = username.trim();
        if (!trimmed) return;
        if (trimmed.length > 20) {
            setError("Username must be 20 characters or less.");
            return;
        }
        setError("");
        setIsJoined(true);
    };

    const handleSendMessage = () => {
        try {
            if (!newMessage.trim() || !socket || !isConnected) return;
            socket.emit("send-message", {
                message: newMessage.trim(),
                sender: username,
            });
            setNewMessage("");
        } catch (err) {
            console.error("Failed to send message:", err);
            setError("Failed to send message.");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Join Screen

    if (!isJoined) {
        return (
            <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
                <Card className="relative w-full max-w-sm border border-emerald-500/20 bg-[#111827]/80 backdrop-blur-xl shadow-2xl shadow-emerald-500/5">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-white tracking-tight">
                            CPIT-630
                        </CardTitle>
                        <p className="text-sm text-emerald-400/80 font-medium">
                            Assignment #1 — Socket Communication
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                            Real-time WebSocket chat between 2 PCs
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Input
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                                maxLength={20}
                                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors"
                            />
                            {error && <p className="text-xs text-red-400 px-1">{error}</p>}
                        </div>
                        <Button
                            onClick={handleJoin}
                            disabled={!username.trim()}
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Connect to Chat
                        </Button>
                        <p className="text-center text-[11px] text-white/25">
                            Made by Majed A. Alhasin
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Chat Screen

    return (
        <div className="h-screen bg-[#0a0f1a] flex flex-col p-3 md:p-5">
            <div className="fixed inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

            <Card className="relative flex-1 flex flex-col max-w-3xl mx-auto w-full border border-emerald-500/15 bg-[#111827]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <CardHeader className="py-3 px-5 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <span className="text-base">⚡</span>
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-white leading-none">
                                    Chat Room
                                </CardTitle>
                                <p className="text-[11px] text-white/30 mt-0.5">CPIT-630 Socket Communication</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-white/40">{userCount} online</span>
                            <div className="flex items-center gap-1.5">
                                <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]"}`} />
                                <span className="text-xs text-white/40">{isConnected ? "Connected" : "Disconnected"}</span>
                            </div>
                            <span className="text-xs text-white/25 hidden sm:inline">{username}</span>
                        </div>
                    </div>
                    {error && <p className="text-xs text-amber-400/80 mt-2 px-1">{error}</p>}
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2 select-none">
                                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                    <span className="text-xl opacity-40">💬</span>
                                </div>
                                <p className="text-white/20 text-sm">No messages yet</p>
                                <p className="text-white/10 text-xs">Open this page on another PC or browser to chat</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                const isOwn = msg.sender === username;
                                return (
                                    <div key={i} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn ? "bg-emerald-600 text-white rounded-br-md" : "bg-white/[0.06] text-white/90 rounded-bl-md"}`}>
                                            {!isOwn && <p className="text-[11px] font-medium text-emerald-400/70 mb-0.5">{msg.sender}</p>}
                                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.message}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isOwn ? "text-white/40" : "text-white/20"}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-white/5">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={!isConnected}
                                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors disabled:opacity-30"
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || !isConnected}
                                className="h-10 px-5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Send
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
