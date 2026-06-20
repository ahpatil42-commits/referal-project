"use client";

import { useState } from "react";
import { ChatModal } from "./chat-modal";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

interface ChatButtonProps {
  requestId: string;
  currentUserId: string;
  messages: Message[];
  otherUserName: string;
}

export function ChatButton({ requestId, currentUserId, messages, otherUserName }: ChatButtonProps) {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowChat(true)}
        className="btn-primary"
        style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", marginLeft: "0.5rem" }}
      >
        💬 Message
      </button>

      {showChat && (
        <ChatModal
          requestId={requestId}
          currentUserId={currentUserId}
          messages={messages}
          otherUserName={otherUserName}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}
