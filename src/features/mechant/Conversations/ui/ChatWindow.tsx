// src/features/mechant/Conversations/ui/ChatWindow.tsx
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
  Fab,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ThumbUpIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownIcon from "@mui/icons-material/ThumbDownAlt";
import type { ChatMessage } from "@/features/mechant/Conversations/type";
import emptyChat from "@/assets/empty-chat.png";
import { linkify, copyToClipboard } from "./utils";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  onRate?: (msg: ChatMessage, rating: number) => void;
}

const ChatWindow = ({ messages, loading, onRate }: Props) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    if (atBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, atBottom]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 80; // px
    const isBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setAtBottom(isBottom);
  };

  const jumpToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  if (loading) return <CircularProgress sx={{ m: 3 }} />;
  if (!messages.length)
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
        <img src={emptyChat} alt="Empty" width={80} />
        <Typography mt={2} color="gray">
          لا يوجد رسائل
        </Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        p: { xs: 1.25, md: 2 },
        height: "100%",
        overflowY: "auto",
        position: "relative",
      }}
      ref={scrollRef}
      onScroll={onScroll}
    >
      {messages.map((msg, idx) => {
        const mine = msg.role === "customer";
        const bg = mine ? "#805ad5" : "#f2f2f2";
        const color = mine ? "#fff" : "#222";
        const mediaUrl = msg.metadata?.mediaUrl;
        const mediaType = msg.metadata?.mediaType;

        return (
          <Box
            key={msg._id || idx}
            display="flex"
            justifyContent={mine ? "flex-end" : "flex-start"}
          >
            <Paper
              sx={{
                p: 1.2,
                mb: 1,
                background: bg,
                color,
                borderRadius: 3,
                maxWidth: { xs: "82vw", sm: 380, md: 420 },
                boxShadow: 1,
                position: "relative",
                cursor: "default",
                userSelect: "text",
              }}
              onDoubleClick={() => copyToClipboard(msg.text)}
              onTouchStart={(e) => {
                // لمس مطوّل للنسخ
                let timeout = setTimeout(() => copyToClipboard(msg.text), 500);
                const cancel = () => {
                  clearTimeout(timeout);
                  e.currentTarget.removeEventListener("touchend", cancel);
                  e.currentTarget.removeEventListener("touchmove", cancel);
                };
                e.currentTarget.addEventListener("touchend", cancel);
                e.currentTarget.addEventListener("touchmove", cancel);
              }}
            >
              {/* وسائط */}
              {typeof mediaUrl === "string" &&
                mediaUrl &&
                (() => {
                  if (mediaType === "image") {
                    return (
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "block" }}
                      >
                        <img
                          src={mediaUrl}
                          alt="صورة"
                          style={{
                            maxWidth: "70vw",
                            maxHeight: 280,
                            borderRadius: 10,
                            marginBottom: 8,
                            display: "block",
                          }}
                        />
                      </a>
                    );
                  } else if (mediaType === "audio") {
                    return (
                      <audio controls style={{ width: 220, marginBottom: 8 }}>
                        <source
                          src={mediaUrl}
                          type={msg.metadata?.mimeType as string || "audio/mpeg"}
                        />
                        المتصفح لا يدعم تشغيل الصوت.
                      </audio>
                    );
                  } else if (mediaType === "pdf") {
                    return (
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#4a90e2",
                          marginBottom: 8,
                          display: "block",
                          fontWeight: 600,
                        }}
                      >
                        📄 تحميل الملف (PDF)
                      </a>
                    );
                  }
                  return (
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#4a90e2",
                        marginBottom: 8,
                        display: "block",
                        fontWeight: 600,
                      }}
                    >
                      📎 تحميل الملف
                    </a>
                  );
                })()}

              {/* النص مع Linkify */}
              <Typography
                sx={{ wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{ __html: linkify(msg.text || "") }}
              />
              <Typography
                variant="caption"
                sx={{ float: "left", fontSize: 11, opacity: 0.8 }}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>

              {/* تقييم لردود البوت */}
              {msg.role === "bot" && (
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Tooltip title="تقييم إيجابي">
                    <span>
                      <IconButton
                        color={msg.rating === 1 ? "primary" : "default"}
                        size="small"
                        onClick={() => onRate?.(msg, 1)}
                        disabled={msg.rating === 1}
                      >
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="تقييم سلبي">
                    <span>
                      <IconButton
                        color={msg.rating === 0 ? "error" : "default"}
                        size="small"
                        onClick={() => onRate?.(msg, 0)}
                        disabled={msg.rating === 0}
                      >
                        <ThumbDownIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </Paper>
          </Box>
        );
      })}

      {/* زر القفز للأسفل */}
      {!atBottom && (
        <Fab
          size="small"
          color="primary"
          onClick={jumpToBottom}
          sx={{ position: "sticky", left: "calc(100% - 56px)", bottom: 8 }}
        >
          <KeyboardArrowDownRoundedIcon />
        </Fab>
      )}
    </Box>
  );
};

export default ChatWindow;
