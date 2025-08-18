import { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Box, CircularProgress, IconButton, Typography } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useTheme } from '@mui/material/styles';

import type { ChatMessage } from './types';
import { KLEEM_COLORS } from './constants';
import { fetchKleemSession, getKleemSessionId, rateKleemMessage, sendKleemMessage } from '../../api/kleem';
import ChatInput from './ChatInput';
import ChatBubble from './ChatBubble';

const POLL_MS = 3000;
const uid = () =>
  typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2);

function RateActions({ idx, onRate }: { idx: number; onRate: (i: number, v: 0 | 1) => void }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, justifyContent: 'flex-end' }}>
      <IconButton size="small" onClick={() => onRate(idx, 1)} title="مفيد" aria-label="تقييم مفيد">
        <ThumbUpIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={() => onRate(idx, 0)} title="غير مفيد" aria-label="تقييم غير مفيد">
        <ThumbDownIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

interface LiveChatProps {
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function LiveChat({ messagesContainerRef }: LiveChatProps) {
  const theme = useTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'hello', from: 'bot', text: '👋 مرحباً! أنا كليم. اسألني عن منصتنا أو الباقات أو التجربة المجانية.' },
  ]);
  const [loading, setLoading] = useState(false);

  // السكرول داخل وعاء الرسائل فقط (بدون تحريك الصفحة)
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, messagesContainerRef]);

  // Polling لاستلام الردود
  useEffect(() => {
    let mounted = true;

    const pull = async () => {
      try {
        const session = await fetchKleemSession();
        const raw = Array.isArray(session?.messages) ? session.messages : [];
        const uiMsgs: ChatMessage[] = raw.map((m: any, i: number) => ({
          id: `${m.role}-${i}`,
          from: m.role,
          text: m.text,
          rateIdx: m.role === 'bot' ? i : undefined,
        }));
        if (!mounted) return;
        setMessages((prev) => (uiMsgs.length > prev.length ? uiMsgs : prev));
      } catch (e) {
        console.error('Failed to fetch session', e);
      }
    };

    pull();
    const id = setInterval(pull, POLL_MS);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const handleSend = useCallback(async (text: string) => {
    setMessages((prev) => [...prev, { id: uid(), from: 'user', text }]);
    setLoading(true);
    try {
      await sendKleemMessage(text, { page: window.location.pathname, sessionId: getKleemSessionId() });
    } catch (e) {
      setMessages((prev) => [...prev, { id: uid(), from: 'bot', text: 'تعذّر جلب الرد الآن. حاول لاحقاً 🙏' }]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRate = useCallback(async (msgIdx: number, value: 0 | 1) => {
    try {
      await rateKleemMessage(msgIdx, value);
      setMessages((prev) =>
        prev.map((m) => (m.rateIdx === msgIdx ? { ...m, text: m.text + (value ? '  (شكراً لتقييمك 👍)' : '  (تم تسجيل ملاحظتك 👎)') } : m)),
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  const rendered = useMemo(
    () => (
      <>
        {messages.map((msg) => {
  const actions = (typeof msg.rateIdx === 'number' && msg.from === 'bot')
    ? (
      <>
        <IconButton size="small" onClick={() => handleRate(msg.rateIdx!, 1)} title="مفيد" aria-label="تقييم مفيد">
          <ThumbUpIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleRate(msg.rateIdx!, 0)} title="غير مفيد" aria-label="تقييم غير مفيد">
          <ThumbDownIcon fontSize="small" />
        </IconButton>
      </>
    )
    : undefined;

  return <ChatBubble key={msg.id} msg={msg} actions={actions} />;
})}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, width: 32, height: 32, mx: 1 }}>
              <SmartToyIcon />
            </Avatar>
            <CircularProgress size={20} sx={{ color: KLEEM_COLORS.primary }} />
            <Typography color="text.secondary" fontSize="0.95rem">
              كليم يكتب...
            </Typography>
          </Box>
        )}
      </>
    ),
    [messages, loading, handleRate, theme.palette.primary.main, theme.palette.primary.contrastText],
  );

  return (
    <>
      {rendered}
      <ChatInput onSend={handleSend} disabled={loading} autoFocusOnMount />
    </>
  );
}
