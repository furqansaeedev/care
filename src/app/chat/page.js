"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const targetConversationId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Fetch current user
  useEffect(() => {
    async function getUser() {
      const res = await fetch("/api/auth-me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    }
    getUser();
  }, []);

  // 2. Fetch conversations list
  useEffect(() => {
    async function fetchConversations() {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        if (targetConversationId) {
          const target = data.conversations.find(c => c.id === targetConversationId);
          if (target) {
            setActiveConversation(target);
            setShowMobileChat(true);
          } else if (data.conversations.length > 0) {
            setActiveConversation(data.conversations[0]);
          }
        } else if (data.conversations.length > 0) {
          setActiveConversation(data.conversations[0]);
        }
      }
      setLoading(false);
    }
    fetchConversations();
  }, [targetConversationId]);

  // 3. The Polling Logic (Replaces Pusher for guaranteed instant updates)
  useEffect(() => {
    if (!activeConversation) return;

    // Function to fetch latest messages
    const fetchMessages = async () => {
      const res = await fetch(`/api/chat?conversationId=${activeConversation.id}`);
      const data = await res.json();
      if (data.conversation) {
        setMessages(data.conversation.messages);
      }
    };

    // Fetch immediately when opening the chat
    fetchMessages();

    // Set up the interval to poll every 2 seconds
    const interval = setInterval(fetchMessages, 2000);

    // Cleanup interval when leaving the chat
    return () => clearInterval(interval);
  }, [activeConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const tempMessage = newMessage;
    setNewMessage("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeConversation.id, content: tempMessage }),
    });

    if (!res.ok) {
      alert("Failed to send message");
      setNewMessage(tempMessage);
    } else {
      // Instantly fetch messages after sending to update the UI immediately
      const fetchRes = await fetch(`/api/chat?conversationId=${activeConversation.id}`);
      const data = await fetchRes.json();
      if (data.conversation) {
        setMessages(data.conversation.messages);
      }
    }
  }

  if (loading || !currentUser) {
    return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <div className={`w-full md:w-80 border-r border-border bg-surface flex-col ${showMobileChat ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Messages</h1>
          <Link href="/dashboard" className="text-sm text-text-light hover:text-primary">Back</Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && <p className="p-4 text-sm text-text-light text-center">No conversations yet.</p>}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setActiveConversation(conv);
                setShowMobileChat(true);
              }}
              className={`p-4 cursor-pointer border-b border-border hover:bg-secondary/20 ${activeConversation?.id === conv.id ? "bg-secondary/50 border-l-4 border-l-primary" : ""}`}
            >
              <p className="font-medium text-text">
                {currentUser?.role === "DOCTOR" ? conv.user.name : "Your Doctor"} 
              </p>
              <p className="text-xs text-text-light truncate">{conv.messages[0]?.content || "Start a conversation"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 flex-col ${showMobileChat ? "flex" : "hidden md:flex"}`}>
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-border bg-surface flex items-center gap-3">
              <button onClick={() => setShowMobileChat(false)} className="md:hidden text-text-light">
                <ArrowLeft size={20} />
              </button>
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                {currentUser?.role === "DOCTOR" ? activeConversation.user.name.charAt(0) : "D"}
              </div>
              <div>
                <p className="font-semibold text-text">
                  {currentUser?.role === "DOCTOR" ? activeConversation.user.name : "Your Doctor"}
                </p>
                <p className="text-xs text-text-light">Online</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {messages.map((msg) => {
                // The magic check: If the sender ID matches the logged-in user, it's mine.
                const isMine = currentUser?.id === msg.senderId;
                
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-xl p-3 ${isMine ? "bg-primary-light text-white" : "bg-surface border border-border text-text"}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? "text-white/70" : "text-text-light"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-border bg-surface flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary px-4 py-2 flex items-center justify-center">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-light">
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}