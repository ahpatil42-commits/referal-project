"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { sendMessage } from "@/actions/messages";
import { pusherClient } from "@/lib/pusher-client";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

interface ChatModalProps {
  requestId: string;
  currentUserId: string;
  messages: Message[];
  otherUserName: string;
  onClose: () => void;
}

export function ChatModal({
  requestId,
  currentUserId,
  messages: initialMessages,
  otherUserName,
  onClose,
}: ChatModalProps) {
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to real-time messages
  useEffect(() => {
    const channel = pusherClient.subscribe(`chat-request-${requestId}`);

    channel.bind("new-message", (newMsg: Message) => {
      // Convert string dates from Pusher JSON to Date objects if necessary
      if (typeof newMsg.createdAt === 'string') {
        newMsg.createdAt = new Date(newMsg.createdAt);
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      pusherClient.unsubscribe(`chat-request-${requestId}`);
    };
  }, [requestId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      await sendMessage(requestId, content);
      setContent("");
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        paddingLeft: "calc(220px + 1.5rem)",
      }}
    >
      <div
        className="glass-panel animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "500px", padding: "1.5rem", display: "flex", flexDirection: "column", height: "600px", maxHeight: "80vh", zIndex: 101 }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              Chat with {otherUserName}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "1.25rem", cursor: "pointer", padding: "0.25rem" }}
          >
            ✕
          </button>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", paddingRight: "0.5rem" }}>
          {messages.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", textAlign: "center", marginTop: "2rem", fontSize: "0.9rem" }}>
              No messages yet. Say hello!
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    background: isMine ? "var(--color-primary)" : "rgba(255,255,255,0.05)",
                    border: isMine ? "none" : "1px solid var(--glass-border)",
                    color: isMine ? "white" : "var(--color-text-primary)",
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    maxWidth: "80%",
                    fontSize: "0.9rem",
                    lineHeight: 1.4,
                  }}
                >
                  {msg.content}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <input
            type="text"
            className="form-input"
            style={{ flex: 1 }}
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={isPending || !content.trim()}>
            {isPending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
