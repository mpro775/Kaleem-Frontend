import { useState, useEffect } from 'react';
import { fetchConversations } from '../api/messages';
import type { ChannelType, ConversationSession } from '../types/chat';

export function useConversations(merchantId: string, channel?: ChannelType) {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!merchantId) return;
    setLoading(true);
    fetchConversations(merchantId, channel)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [merchantId, channel]);

  return { sessions, loading };
}
