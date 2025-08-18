// src/types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_API_BASE_URL: string;
    REACT_APP_WS_BASE_URL: string;
    // أضف هنا أي متغيرات أخرى تستخدمها
  }
}
