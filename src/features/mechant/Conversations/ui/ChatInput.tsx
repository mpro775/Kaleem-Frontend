import { useRef, useState, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Typography,
  Fade,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import CloseIcon from "@mui/icons-material/Close";
import EmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react";
import twemoji from "twemoji";

const EmojiText = ({ text }: { text: string }) => (
  <span
    dangerouslySetInnerHTML={{
      __html: twemoji.parse(text, {
        folder: "svg",
        ext: ".svg",
      }),
    }}
    style={{ lineHeight: 1.5 }}
  />
);

interface Props {
  onSend: (payload: {
    text?: string;
    file?: File | null;
    audio?: Blob | null;
  }) => void;
}

const ChatInput: React.FC<Props> = ({ onSend }) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // الحالة
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // إرسال الرسالة
  function handleSend() {
    if (!text.trim() && !file && !audio) return;

    onSend({ text: text.trim() || undefined, file, audio });

    // إعادة تعيين الحقول
    setText("");
    setFile(null);
    setAudio(null);
    setShowEmoji(false);
    setError(null);
  }

  // تغيير الملف
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosenFile = e.target.files?.[0];
    if (chosenFile) {
      // تحقق من نوع وحجم الملف (مثال: أقل من 5 ميجابايت)
      if (chosenFile.size > 5 * 1024 * 1024) {
        setError("حجم الملف كبير جداً. الرجاء اختيار ملف أقل من 5 ميجابايت");
        e.target.value = "";
        return;
      }
      setFile(chosenFile);
      setAudio(null);
      setText("");
      setError(null);
    }
  }

  function handleRemoveFile() {
    setFile(null);
  }

  // بداية تسجيل الصوت
  async function handleStartRecord() {
    setError(null);
    setLoadingAudio(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setAudio(audioBlob);
        setIsRecording(false);
        setLoadingAudio(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecorder(mediaRecorder);
    } catch {
      setError("تعذر بدء التسجيل الصوتي. تحقق من إعدادات الميكروفون.");
      setLoadingAudio(false);
    }
  }

  // إيقاف التسجيل
  function handleStopRecord() {
    if (recorder) {
      recorder.stop();
    }
    setRecorder(null);
    setIsRecording(false);
  }

  function handleRemoveAudio() {
    setAudio(null);
  }

  // إدراج إيموجي
  function handleEmojiClick(emojiData: EmojiClickData) {
    setText((t) => t + emojiData.emoji);
  }

  // إخفاء الـ Emoji عند النقر في أي مكان خارج الكمبوننت
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!event.target || !(event.target as HTMLElement).closest) return;
      if (!(event.target as HTMLElement).closest("#emoji-picker-container")) {
        setShowEmoji(false);
      }
    }
    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmoji]);

  // السماح بالضغط على "Escape" لإغلاق الإيموجي
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && showEmoji) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showEmoji]);

  const PreviewContainer = ({ children }: { children: React.ReactNode }) => (
    <Box
      mt={1}
      display="flex"
      alignItems="center"
      bgcolor={theme.palette.mode === "light" ? "#f0f0f0" : "#2c2c2c"}
      px={1.5}
      py={0.5}
      borderRadius={2}
      maxWidth={320}
      sx={{
        userSelect: "text",
      }}
    >
      {children}
    </Box>
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      p={1}
      borderTop={`1px solid ${theme.palette.divider}`}
      position="relative"
      bgcolor={theme.palette.background.paper}
      sx={{
        userSelect: "none",
      }}
    >
      {/* رسالة الخطأ */}
      <Fade in={!!error}>
        <Typography
          color="error"
          variant="body2"
          sx={{ mb: 0.5, px: 1, userSelect: "text" }}
        >
          {error}
        </Typography>
      </Fade>

      <Box display="flex" alignItems="center" gap={1}>
        {/* رفع ملف */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <Tooltip title="إرفاق ملف">
          <span>
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={!!file || !!audio || isRecording || loadingAudio}
              size="large"
              color={file || audio ? "primary" : "default"}
              aria-label="إرفاق ملف"
            >
              <AttachFileIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* إيموجي */}
        <Tooltip title="إدراج إيموجي">
          <IconButton
            onClick={() => setShowEmoji((s) => !s)}
            disabled={!!file || !!audio || isRecording || loadingAudio}
            size="large"
            aria-label="إدراج إيموجي"
            color={showEmoji ? "primary" : "default"}
          >
            <InsertEmoticonIcon />
          </IconButton>
        </Tooltip>

        {/* حقل النص */}
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="اكتب رسالة..."
          value={text}
          disabled={!!file || !!audio || isRecording || loadingAudio}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          sx={{
            bgcolor: theme.palette.mode === "light" ? "#fff" : "#121212",
            borderRadius: 2,
            "& .MuiInputBase-root": {
              paddingRight: "4px",
            },
          }}
          InputProps={{
            sx: {
              fontSize: 14,
            },
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="إرسال">
                  <span>
                    <IconButton
                      onClick={handleSend}
                      color="primary"
                      disabled={!text.trim() && !file && !audio}
                      size="large"
                      aria-label="إرسال الرسالة"
                    >
                      <SendIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </InputAdornment>
            ),
            "aria-label": "حقل كتابة الرسالة",
          }}
        />
        {/* Live Emoji Preview */}
        {text && !file && !audio && (
          <Box
            mt={1}
            mb={1}
            minHeight={36}
            px={1}
            display="flex"
            alignItems="center"
          >
            <EmojiText text={text} />
          </Box>
        )}
        {/* تسجيل صوت */}
        {isRecording ? (
          <Tooltip title="إيقاف التسجيل">
            <IconButton
              onClick={handleStopRecord}
              color="error"
              size="large"
              aria-label="إيقاف التسجيل"
            >
              <StopIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="تسجيل صوت">
            <span>
              <IconButton
                onClick={handleStartRecord}
                color="primary"
                disabled={!!file || !!audio || loadingAudio}
                size="large"
                aria-label="بدء التسجيل الصوتي"
              >
                {loadingAudio ? <CircularProgress size={24} /> : <MicIcon />}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>

      {/* صندوق الإيموجي */}
      {showEmoji && (
        <Box
          id="emoji-picker-container"
          position="absolute"
          bottom={56}
          right={4}
          zIndex={1300}
          boxShadow={theme.shadows[5]}
          borderRadius={2}
          overflow="hidden"
          bgcolor={theme.palette.background.paper}
          sx={{
            "& .emoji-picker-react": {
              border: "none",
              boxShadow: "none",
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            theme={(theme.palette.mode === "dark" ? "dark" : "light") as Theme}
            height={350}
            width={300}
            lazyLoadEmojis
          />
        </Box>
      )}

      {/* File Preview */}
      {file && (
        <PreviewContainer>
          <Typography
            noWrap
            variant="body2"
            sx={{ flexGrow: 1, fontWeight: 500 }}
            title={file.name}
          >
            {file.name}
          </Typography>
          <IconButton
            size="small"
            onClick={handleRemoveFile}
            aria-label="حذف الملف"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </PreviewContainer>
      )}

      {/* معاينة التسجيل الصوتي */}
      {audio && (
        <PreviewContainer>
          <audio
            controls
            src={URL.createObjectURL(audio)}
            style={{ maxWidth: 180 }}
            preload="metadata"
          />
          <IconButton
            size="small"
            onClick={handleRemoveAudio}
            aria-label="حذف التسجيل الصوتي"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </PreviewContainer>
      )}
    </Box>
  );
};

export default ChatInput;
