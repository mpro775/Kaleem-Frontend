import {
  List,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  CircularProgress,
  ListItemButton, // أضف هذا
} from "@mui/material";
import type { ConversationSession } from "../../types/chat";
import type { FC } from "react";

interface Props {
  sessions: ConversationSession[];
  loading: boolean;
  onSelect: (sessionId: string) => void;
  selectedId?: string;
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
      return "#eee";
  }
};

const ConversationsList: FC<Props> = ({
  sessions,
  loading,
  onSelect,
  selectedId,
}) => {
  if (loading) return <CircularProgress sx={{ m: 3 }} />;
  if (!sessions.length)
    return (
      <Typography align="center" color="gray" sx={{ mt: 5 }}>
        لا توجد محادثات حتى الآن
      </Typography>
    );
  return (
    <List>
      {sessions.map((s) => {
        const messagesArr = Array.isArray(s.messages) ? s.messages : [];
        const lastMsg =
          messagesArr.length > 0
            ? messagesArr[messagesArr.length - 1]?.text
            : "...";
        return (
          <ListItemButton
            key={s.sessionId}
            selected={selectedId === s.sessionId}
            onClick={() => onSelect(s.sessionId)}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: getChannelColor(s.channel) }}>
                {s.channel[0]?.toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={s.sessionId} secondary={lastMsg} />
          </ListItemButton>
        );
      })}
    </List>
  );
};

export default ConversationsList;
