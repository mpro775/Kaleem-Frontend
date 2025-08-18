// types/ChatWidgetSettings.ts
export interface ChatWidgetSettings {
  themeColor?: string;      // اللون الأساسي (brand color)
  greeting?: string;        // الرسالة الترحيبية
  webhooksUrl?: string;     // مسار الـ webhooks (عادة ثابت)
  apiBaseUrl?: string;      // قاعدة API
  // يمكن إضافة باقي الحقول لو أردت تخصيصاً أكبر (fontFamily, embedMode...)
}
