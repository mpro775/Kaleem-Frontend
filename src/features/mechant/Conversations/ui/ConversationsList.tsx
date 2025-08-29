// src/features/mechant/Conversations/ui/ConversationsList.tsx
import {
  Box,
  List,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  CircularProgress,
  ListItemButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import type { ConversationSession } from "@/features/mechant/Conversations/type";
import type { FC, useState as UseState } from "react";
import { useState, useMemo } from "react";

interface Props {
  sessions: ConversationSession[];
  loading: boolean;
  onSelect: (sessionId: string) => void;
  selectedId?: string;
  enableSearch?: boolean;
}

const getChannelColor = (channel: string) => {
  switch (channel) {
    case "whatsapp":
      return "#25D366";
    case "telegram":
      return "#229ED9";
    case "webchat":
      return "#805ad5";
    default:
      return "#bdbdbd";
  }
};

const ConversationsList: FC<Props> = ({
  sessions,
  loading,
  onSelect,
  selectedId,
  enableSearch = false,
}) => {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return sessions;
    const s = q.trim().toLowerCase();
    return sessions.filter(
      (x) =>
        x.sessionId?.toLowerCase().includes(s) ||
        (Array.isArray(x.messages) &&
          x.messages[x.messages.length - 1]?.text?.toLowerCase().includes(s))
    );
  }, [sessions, q]);

  if (loading) return <CircularProgress sx={{ m: 3 }} />;
  if (!sessions.length)
    return (
      <Typography align="center" color="gray" sx={{ mt: 5 }}>
        لا توجد محادثات حتى الآن
      </Typography>
    );

  return (
    <Box sx={{ p: 1 }}>
      {enableSearch && (
        <TextField
          fullWidth
          size="small"
          placeholder="بحث في الجلسات…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
      )}
      {filtered.length === 0 && (
        <Typography align="center" color="text.secondary" sx={{ my: 3 }}>
          لا توجد نتائج مطابقة
        </Typography>
      )}
      <List>
        {filtered.map((s) => {
          const messagesArr = Array.isArray(s.messages) ? s.messages : [];
          const lastMsg = messagesArr.length ? messagesArr[messagesArr.length - 1]?.text : "…";
          const time = s.updatedAt
            ? new Date(s.updatedAt).toLocaleTimeString()
            : "";
          return (
            <ListItemButton
              key={s.sessionId}
              selected={selectedId === s.sessionId}
              onClick={() => onSelect(s.sessionId)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getChannelColor(s.channel) }}>
                  {s.channel[0]?.toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Typography
                      fontWeight={selectedId === s.sessionId ? 800 : 600}
                      noWrap
                    >
                      {s.sessionId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {time}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {lastMsg || "—"}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

export default ConversationsList;
