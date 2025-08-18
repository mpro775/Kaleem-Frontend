import { useRef, useState } from 'react';
import { Avatar, Box, Button, Chip, Paper, Typography } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ChatHeader, ChatBubble, LiveChat, DEMO_MESSAGES, KLEEM_COLORS } from '@/widgets/chatKaleem';

export default function DemoSection() {
  const [isChatLive, setIsChatLive] = useState(false);

  // وعاء الرسائل لتمريره إلى LiveChat والتحكم بالسكرول داخليًا
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        py: 10,
        px: 3,
        bgcolor: '#fff',
      }}
    >


      {/* عمود الشات: يتسع تلقائيًا عند البدء */}
      <Box
        sx={{
          width: { xs: '100%', sm: isChatLive ? 520 : 370 },
          flexGrow: isChatLive ? 1 : 0,
          order: { xs: 2, md: 1 },
          transition: 'width .2s',
        }}
      >
        <Paper
          elevation={4}
          sx={{
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            bgcolor: '#fafafa',
            minHeight: isChatLive ? 520 : 410,
            transition: 'min-height .2s',
          }}
        >
          <ChatHeader />

          <Box
            ref={messagesContainerRef}
            sx={{
              p: 2,
              height: isChatLive ? 440 : 350,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              direction: 'rtl',         // 👈 يخلي التخطيط RTL داخل المحادثة
              textAlign: 'right', // يمنع سحب الصفحة
            }}
          >
            <Chip label="اليوم" sx={{ display: 'block', mx: 'auto', mb: 2, bgcolor: '#e0e0e0' }} />

            {!isChatLive ? (
              <>
                {DEMO_MESSAGES.map((m) =>
                  m.text === '...' ? (
                    <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <Paper elevation={0} sx={{ p: 1.5, borderRadius: '20px 20px 20px 4px', bgcolor: KLEEM_COLORS.primary }}>
                        <MoreHorizIcon sx={{ color: 'white' }} />
                      </Paper>
                      <Avatar sx={{ bgcolor: KLEEM_COLORS.primary, width: 32, height: 32, ml: 1, alignSelf: 'flex-end' }}>
                        <SmartToyIcon />
                      </Avatar>
                    </Box>
                  ) : (
                    <ChatBubble key={m.id} msg={m} />
                  ),
                )}
              </>
            ) : (
              // نمرّر مرجع وعاء الرسائل لضبط السكرول داخليًا
              <LiveChat messagesContainerRef={messagesContainerRef} />
            )}
          </Box>
        </Paper>
      </Box>
            {/* عمود الدعوة للعمل: نخفيه تمامًا بعد بدء المحادثة */}
            {!isChatLive && (
        <Box
          sx={{
            textAlign: { xs: 'center', md: 'right' },
            maxWidth: 400,
            order: { xs: 1, md: 2 },
          }}
        >
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 3 }}>
            تحدث مع <Box component="span" sx={{ color: KLEEM_COLORS.primary }}>كَلِيم</Box> الآن
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => setIsChatLive(true)}
            sx={{
              bgcolor: KLEEM_COLORS.primary,
              borderRadius: '12px',
              px: 5,
              py: 1.5,
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(86,63,166,.3)',
              '&:hover': { bgcolor: KLEEM_COLORS.primaryHover },
            }}
          >
            ابدأ المحادثة الآن
          </Button>
        </Box>
      )}
    </Box>
  );
}
