# دليل الاختبارات السريع - Quick Testing Guide

## 🚀 تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل الاختبارات في وضع المراقبة
npm run test:watch

# تشغيل اختبارات محددة
npm test -- --run src/shared/ui/

# تشغيل ملف اختبار محدد
npm test -- --run src/shared/ui/SafeText.test.tsx
```

## 📁 هيكل ملفات الاختبار

```
src/
├── test/
│   ├── setup.ts              # إعدادات الاختبار الأساسية
│   ├── test-utils.tsx        # أدوات مساعدة للاختبارات
│   └── testServer.ts         # سيرفر وهمي للـ API
└── **/*.test.tsx             # ملفات الاختبار
```

## ✨ الميزات المتاحة

- ✅ **Vitest** - إطار عمل سريع للاختبارات
- ✅ **React Testing Library** - اختبار واجهات المستخدم
- ✅ **MSW** - محاكاة API calls
- ✅ **TypeScript** - دعم كامل
- ✅ **MUI** - دعم Material-UI
- ✅ **React Query** - دعم إدارة الحالة

## 🧪 مثال بسيط

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("يجب أن يعرض النص المطلوب", () => {
    render(<MyComponent text="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("يجب أن يعمل مع السياق", () => {
    renderWithProviders(<MyComponent />, {
      route: "/dashboard",
      auth: { user: { role: "MERCHANT" } }
    });
  });
});
```

## 🔧 حل المشاكل الشائعة

### خطأ "Cannot find module"
```bash
npm install
npm run test -- --clearCache
```

### مشاكل مع MUI
استخدم `renderWithProviders` بدلاً من `render` العادي.

### خطأ "Test environment setup"
تأكد من وجود ملف `setup.ts` وصحة المسار في `vite.config.ts`.

## 📚 المزيد من المعلومات

راجع ملف `TESTING.md` للحصول على دليل مفصل وشامل.
