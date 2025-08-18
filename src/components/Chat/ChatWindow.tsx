import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import type { ChatMessage } from "../../types/chat";
import type { FC } from "react";
import emptyChat from "../../assets/empty-chat.png";
import ThumbUpIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownIcon from "@mui/icons-material/ThumbDownAlt";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  onRate?: (msg: ChatMessage, rating: number) => void;
}

const ChatWindow: FC<Props> = ({ messages, loading, onRate }) => {
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
    <Box sx={{ p: 2, height: "100%", overflowY: "auto" }}>
      {messages.map((msg, idx) => {
        // --- بيانات الميديا ---
        const mediaUrl = msg.metadata?.mediaUrl;
        const mediaType = msg.metadata?.mediaType;

        return (
          <Box
            key={msg._id || idx}
            display="flex"
            justifyContent={msg.role === "customer" ? "flex-end" : "flex-start"}
          >
            <Paper
              sx={{
                p: 1.2,
                mb: 1,
                background: msg.role === "customer" ? "#805ad5" : "#f2f2f2",
                color: msg.role === "customer" ? "#fff" : "#222",
                borderRadius: 3,
                maxWidth: 350,
                boxShadow: 1,
                position: "relative",
              }}
            >
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
                          alt={
                            typeof msg.metadata?.fileName === "string"
                              ? msg.metadata.fileName
                              : "صورة"
                          }
                          style={{
                            maxWidth: 220,
                            maxHeight: 220,
                            borderRadius: 8,
                            marginBottom: 8,
                            display: "block",
                          }}
                        />
                      </a>
                    );
                  } else if (mediaType === "audio") {
                    return (
                      <audio controls style={{ width: 200, marginBottom: 8 }}>
                        <source
                          src={mediaUrl}
                          type={
                            typeof msg.metadata?.mimeType === "string"
                              ? msg.metadata.mimeType
                              : "audio/mpeg"
                          }
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
                  } else {
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
                  }
                })()}
              {/* --- النص --- */}
              <Typography sx={{ wordBreak: "break-word" }}>
                {msg.text}
              </Typography>
              <Typography
                variant="caption"
                color="gray"
                sx={{ float: "left", fontSize: 11 }}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>
              {/* أزرار التقييم لردود البوت فقط */}
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
    </Box>
  );
};

export default ChatWindow;
