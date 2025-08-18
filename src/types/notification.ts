// types/notification.ts
export type AdminNotification = {
  sessionId: string;
  message: {
    text: string;
    timestamp?: string;
    role?: string;
    metadata?: Record<string, unknown>;
    // أضف أي حقل آخر فعلي لديك في الرسالة...
  };
};
