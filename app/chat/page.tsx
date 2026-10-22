'use client';

import React, { useEffect, useState, useRef } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export default function ChatPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const res = await apiClient.get('/chat/conversations');
      if (res.data.success && res.data.data.length > 0) {
        setConversations(res.data.data);
        if (!activeConv) {
          selectConversation(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: any) => {
    setActiveConv(conv);
    try {
      const res = await apiClient.get(`/chat/conversations/${conv._id}/messages`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      if (activeConv && msg.conversationId === activeConv._id) {
        setMessages((prev) => [...prev, msg]);
      }
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? { ...c, lastMessage: { text: msg.text, timestamp: msg.createdAt || new Date() } }
            : c
        )
      );
    };

    socket.on('chat.message', handleNewMessage);
    socket.on('message.sent', handleNewMessage);

    return () => {
      socket.off('chat.message', handleNewMessage);
      socket.off('message.sent', handleNewMessage);
    };
  }, [socket, activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    const textToSend = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      const res = await apiClient.post(`/chat/conversations/${activeConv._id}/messages`, {
        text: textToSend
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="mb-4 pb-2 border-bottom">
        <h2 className="fw-bold mb-1">Live Communications & Chat</h2>
        <p className="text-secondary mb-0 small">Direct communication between residents, tenant reps, facility staff, and building managers</p>
      </div>

      <div className="pms-card p-0 overflow-hidden shadow-sm" style={{ height: '70vh' }}>
        <div className="row g-0 h-100">
          {/* Conversation List */}
          <div className="col-md-4 border-end h-100 d-flex flex-column bg-light">
            <div className="p-3 border-bottom bg-white">
              <h6 className="fw-bold mb-0">Channels & Direct Messages</h6>
            </div>

            <div className="flex-grow-1 overflow-auto">
              {loading ? (
                <div className="p-3">
                  <LoadingSkeleton />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center p-4 text-muted small">
                  No active channels. Start a support discussion.
                </div>
              ) : (
                conversations.map((c) => {
                  const isSelected = activeConv?._id === c._id;
                  return (
                    <div
                      key={c._id}
                      onClick={() => selectConversation(c)}
                      className={`p-3 border-bottom cursor-pointer transition ${
                        isSelected ? 'bg-primary-subtle border-primary' : 'bg-white hover-bg-light'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold text-truncate small">{c.title || 'Support Channel'}</span>
                        <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.65rem' }}>
                          {c.conversationType || 'DIRECT'}
                        </span>
                      </div>
                      <p className="text-muted small mb-0 text-truncate">
                        {c.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Area */}
          <div className="col-md-8 h-100 d-flex flex-column bg-white">
            {activeConv ? (
              <>
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-0">{activeConv.title || 'Chat'}</h6>
                    <small className="text-muted">{activeConv.conversationType} Channel</small>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle">
                    <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i> Live Socket Connected
                  </span>
                </div>

                {/* Messages Box */}
                <div className="flex-grow-1 p-3 overflow-auto bg-light d-flex flex-column gap-2">
                  {messages.map((m, idx) => {
                    const isMe = m.senderId?._id === user?._id || m.senderId === user?._id;
                    return (
                      <div
                        key={idx}
                        className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}
                      >
                        <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                          {m.senderName || (isMe ? 'You' : 'Participant')}
                        </span>
                        <div
                          className={`p-2 rounded-3 text-break ${
                            isMe ? 'bg-primary text-white' : 'bg-white border text-dark'
                          }`}
                          style={{ maxWidth: '75%' }}
                        >
                          {m.text}
                        </div>
                        <span className="text-muted mt-1" style={{ fontSize: '0.65rem' }}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Composer */}
                <form onSubmit={handleSendMessage} className="p-3 border-top bg-white d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" disabled={sending || !newMessage.trim()} className="btn btn-primary d-flex align-items-center gap-1">
                    <i className="bi bi-send-fill"></i> Send
                  </button>
                </form>
              </>
            ) : (
              <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                Select a channel to begin messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
