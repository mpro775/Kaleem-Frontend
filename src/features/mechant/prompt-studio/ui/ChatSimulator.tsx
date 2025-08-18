// src/components/prompet/ChatSimulator.tsx
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState, useRef, useEffect } from "react";

interface Message {
  from: "user" | "bot";
  text: string;
}

export function ChatSimulator({ initialPrompt }: { initialPrompt: string }) {
  // لا نعرض الـ initialPrompt كبالون، بل نحتفظ به داخليًا فقط
console.log("Initial Prompt:", initialPrompt);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLUListElement>(null);

  const send = () => {
    const userText = input.trim();
    if (!userText) return;

    // 1) أضف رسالة المستخدم
    setMessages((m) => [...m, { from: "user", text: userText }]);
    setInput("");

    // 2) بعد تأخير وهمي، أضف رد هادئ من البوت
    setTimeout(() => {
      // هنا يمكنك لاحقًا استدعاء API مع الـ systemPrompt + userText
      const botReply = "شكرًا لسؤالك، سأتحقق من ذلك وأعود إليك قريبًا."; // رد هادئ ثابت
      setMessages((m) => [...m, { from: "bot", text: botReply }]);
    }, 600);
  };

  // تمرير تلقائي للأسفل
  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  return (
    <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography
        variant="h6"
        sx={{ p: 1, borderBottom: "1px solid rgba(0,0,0,0.12)" }}
      >
        محاكاة المحادثة
      </Typography>

      {/* الرسائل */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 1 }}>
        <List ref={listRef}>
          {messages.map((m, i) => (
            <ListItem
              key={i}
              sx={{
                justifyContent: m.from === "user" ? "flex-end" : "flex-start",
              }}
            >
              <Box
                sx={{
                  bgcolor: m.from === "user" ? "primary.main" : "grey.200",
                  color: m.from === "user" ? "white" : "black",
                  borderRadius: 2,
                  p: 1,
                  maxWidth: "80%",
                }}
              >
                <ListItemText primary={m.text} />
              </Box>
            </ListItem>
          ))}
          {messages.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 2 }}
            >
              ابدأ بكتابة رسالة لإجراء المحاكاة...
            </Typography>
          )}
        </List>
      </Box>

      {/* حقل الإدخال */}
      <Box
        sx={{
          display: "flex",
          p: 1,
          borderTop: "1px solid rgba(0,0,0,0.12)",
        }}
      >
        <TextField
          fullWidth
          placeholder="اكتب رسالة..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          size="small"
        />
        <IconButton color="primary" onClick={send}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
