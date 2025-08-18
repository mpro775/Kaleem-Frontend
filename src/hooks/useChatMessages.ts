import { useState, useEffect } from 'react';
import { fetchSessionMessages } from '../api/messages';
import type { ChatMessage } from '../types/chat';

export function useChatMessages(sessionId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    fetchSessionMessages(sessionId)
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [sessionId]);

  return { messages, loading };
}
