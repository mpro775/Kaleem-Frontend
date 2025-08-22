import { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, IconButton, Typography } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useTheme } from '@mui/material/styles';
import { io, Socket } from 'socket.io-client';

import type { ChatMessage } from './types';
import { KLEEM_COLORS } from './constants';
import { fetchKleemSession, rateKleemMessage, sendKleemMessage } from '@/features/kaleem/api';
import { getKleemSessionId } from '@/features/kaleem/helper';
import ChatInput from './ChatInput';
import ChatBubble from './ChatBubble';
import axiosInstance from '@/shared/api/axios';

const POLL_MS = 3000;
const uid = () =>
  typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).slice(2);
function sameMsgs(a: ChatMessage[], b: ChatMessage[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].from !== b[i].from || a[i].text !== b[i].text) return false;
  }
  return true;
}
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
function isNearBottom(el: HTMLElement, threshold = 80) {
  return el.scrollHeight - (el.scrollTop + el.clientHeight) < threshold;
}

export default function LiveChat({ messagesContainerRef }: LiveChatProps) {
  const theme = useTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'hello', from: 'bot', text: '👋 مرحباً! أنا كليم. اسألني عن منصتنا أو الباقات أو التجربة المجانية.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [showJump, setShowJump] = useState(false);
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => setShowJump(!isNearBottom(el));
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [messagesContainerRef]);
  
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (isNearBottom(el)) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length, messagesContainerRef]); // يتتبع فقط الزيادات
  // السكرول داخل وعاء الرسائل فقط (بدون تحريك الصفحة)
  useEffect(() => {
    const base = (axiosInstance as any).defaults?.baseURL ?? window.location.origin; 
    const sessionId = getKleemSessionId();
  
    let socket: Socket | null = null;
    let pollId: any;
  
    const sameMsgs = (a: ChatMessage[], b: ChatMessage[]) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i].from !== b[i].from || a[i].text !== b[i].text) return false;
      }
      return true;
    };
  
    const pull = async () => {
      try {
        const session = await fetchKleemSession();
        const raw = Array.isArray(session?.messages) ? session.messages : [];
        const ui = raw.map((m: any, i: number) => ({
          id: m.id ?? m._id ?? `${m.role}-${m.timestamp ?? i}-${m.text?.length ?? 0}`,
          from: m.role,
          text: m.text,
          rateIdx: m.role === 'bot' ? i : undefined,
        }));
        setMessages((prev) => (sameMsgs(prev, ui) ? prev : ui));
      } catch {}
    };
  
    // جرّب WS أولاً
    try {
      socket = io(base, {
        path: '/api/kleem/ws',
        transports: ['websocket'],     // جرّب بدون هذا السطر إذا أردت السماح بالـpolling fallback
        withCredentials: true,
        query: { sessionId, role: 'guest' },
      });
  
      socket.on('connect', () => {
        // لو حابب تضمن الانضمام حتى لو ما وصلت query:
        socket!.emit('join', { sessionId });
      });
  
      socket.on('bot_reply', (msg: any) => {
        setMessages((prev) => [...prev, { id: crypto.randomUUID?.() ?? Date.now()+'' , from: 'bot', text: msg.text, rateIdx: msg.msgIdx }]);
      });
  
      socket.on('typing', (payload: any) => {
        // اختياري: عرض "يكتب..." أو تجاهله
      });
  
      socket.on('disconnect', () => {
        // ارجع للـpolling عند انقطاع WS
        pull();
        pollId = setInterval(pull, 3000);
      });
    } catch {
      // في حال فشل إنشاء السوكيت، استخدم polling
      pull();
      pollId = setInterval(pull, 3000);
    }
  
    // تشغيل أول سحبة لضمان التزامن
    pull();
  
    return () => {
      socket?.close();
      pollId && clearInterval(pollId);
    };
  }, []);
  // Polling لاستلام الردود
  useEffect(() => {
    let mounted = true;

    const pull = async () => {
      try {
        const session = await fetchKleemSession();
        const raw = Array.isArray(session?.messages) ? session.messages : [];
        const uiMsgs: ChatMessage[] = raw.map((m: any, i: number) => ({
          id: m.id ?? m._id ?? `${m.role}-${m.timestamp ?? i}-${m.text?.length ?? 0}`,
          from: m.role,
          text: m.text,
          rateIdx: m.role === 'bot' ? i : undefined,
        }));
        if (!mounted) return;
        setMessages((prev) => (sameMsgs(prev, uiMsgs) ? prev : uiMsgs));
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
    {showJump && (
  <Box sx={{ position:'sticky', bottom:12, display:'flex', justifyContent:'center' }}>
    <Button size="small" variant="contained" onClick={()=>{
      const el=messagesContainerRef.current; if(el) el.scrollTo({top: el.scrollHeight, behavior: 'smooth'});
    }}>أحدث الرسائل</Button>
  </Box>
)}
      {rendered}
      <ChatInput onSend={handleSend} disabled={loading} autoFocusOnMount />
    </>
  );
}
