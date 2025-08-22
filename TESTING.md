# دليل الاختبارات - Testing Guide

## نظرة عامة
هذا المشروع يستخدم **Vitest** كإطار عمل للاختبارات مع **React Testing Library** لاختبار واجهات المستخدم.

## المتطلبات الأساسية
- Node.js 18+
- npm أو yarn

## تثبيت التبعيات
```bash
npm install
```

## تشغيل الاختبارات

### تشغيل جميع الاختبارات
```bash
npm test
```

### تشغيل الاختبارات في وضع المراقبة
```bash
npm run test:watch
```

### تشغيل الاختبارات مع واجهة المستخدم
```bash
npm run test:ui
```

### تشغيل الاختبارات مع تقرير التغطية
```bash
npm run test:cov
```

## هيكل ملفات الاختبار

```
src/
├── test/
│   ├── setup.ts              # إعدادات الاختبار الأساسية
│   ├── test-utils.tsx        # أدوات مساعدة للاختبارات
│   └── testServer.ts         # سيرفر وهمي للـ API
├── **/*.test.tsx             # ملفات الاختبار
└── **/*.test.ts              # ملفات الاختبار للملفات غير React
```

## كتابة الاختبارات

### مثال بسيط
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("يجب أن يعرض النص المطلوب", () => {
    render(<MyComponent text="Hello World" />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
```

### استخدام renderWithProviders
```tsx
import { renderWithProviders } from "@/test/test-utils";

it("يجب أن يعمل مع السياق", () => {
  renderWithProviders(<MyComponent />, {
    route: "/dashboard",
    auth: { user: { role: "MERCHANT" } }
  });
});
```

## الميزات المتاحة

### 1. MSW (Mock Service Worker)
- محاكاة API calls
- اختبار حالات النجاح والفشل
- اختبار حالات الشبكة البطيئة

### 2. React Testing Library
- اختبار سلوك المستخدم
- اختبار accessibility
- اختبار التفاعل مع العناصر

### 3. Vitest
- اختبارات سريعة
- دعم TypeScript
- تقارير مفصلة

## أفضل الممارسات

### 1. تسمية الاختبارات
```tsx
// ✅ جيد
it("يجب أن يعرض رسالة خطأ عند إدخال بريد إلكتروني غير صحيح")

// ❌ سيء
it("test 1")
```

### 2. استخدام data-testid بحكمة
```tsx
// استخدم فقط عندما لا يمكن العثور على العنصر بطريقة أخرى
<button data-testid="submit-button">إرسال</button>
```

### 3. اختبار السلوك وليس التنفيذ
```tsx
// ✅ جيد - اختبار السلوك
expect(screen.getByText("تم الحفظ بنجاح")).toBeInTheDocument();

// ❌ سيء - اختبار التنفيذ
expect(mockSaveFunction).toHaveBeenCalledWith(data);
```

## حل المشاكل الشائعة

### 1. خطأ "Cannot find module"
```bash
# تأكد من تثبيت التبعيات
npm install

# امسح cache
npm run test -- --clearCache
```

### 2. خطأ "Test environment setup"
```bash
# تأكد من وجود ملف setup.ts
# تأكد من صحة مسار الملف في vite.config.ts
```

### 3. مشاكل مع MUI
```tsx
// استخدم renderWithProviders بدلاً من render العادي
import { renderWithProviders } from "@/test/test-utils";
```

## إضافة اختبارات جديدة

### 1. إنشاء ملف اختبار
```bash
# مثال: اختبار لمكون جديد
touch src/components/NewComponent.test.tsx
```

### 2. كتابة الاختبار
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewComponent } from "./NewComponent";

describe("NewComponent", () => {
  it("يجب أن يعمل بشكل صحيح", () => {
    render(<NewComponent />);
    // اختباراتك هنا
  });
});
```

### 3. تشغيل الاختبار
```bash
npm test NewComponent.test.tsx
```

## تقارير التغطية

بعد تشغيل `npm run test:cov`، ستجد تقرير التغطية في:
- Terminal output
- `coverage/` folder (HTML report)

## دعم TypeScript

جميع ملفات الاختبار تدعم TypeScript بشكل كامل. تأكد من:
- استخدام `.test.tsx` للمكونات
- استخدام `.test.ts` للملفات الأخرى
- استيراد الأنواع المطلوبة

## مساعدة إضافية

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
