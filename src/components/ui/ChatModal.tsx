'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare } from 'lucide-react';
import { useTrackingStore } from '@/stores/trackingStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';

export default function ChatModal({ bookingId }: { bookingId: string }) {
  const { messages, sendMessage } = useTrackingStore();
  const { profile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !profile) return;
    await sendMessage(profile.uid, input.trim());
    setInput('');
  };

  const unreadCount = messages.filter(m => m.senderId !== profile?.uid).length; // naive unread

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform z-40"
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-surface border border-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquare size={16} className="text-primary"/> Chat Support
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface/50">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted text-sm text-center">
                  Send a message to your {profile?.role === 'driver' ? 'customer' : 'driver'}
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === profile?.uid;
                  return (
                    <motion.div 
                      key={msg.id || idx} 
                      initial={{ opacity: 0, x: isMe ? 10 : -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
                        isMe 
                          ? 'bg-primary text-primary-foreground rounded-br-sm' 
                          : 'bg-surface border border-border text-foreground rounded-bl-sm'
                      }`}>
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-muted mt-1 mx-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-border bg-surface flex items-center gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-surface border border-border rounded-full px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
