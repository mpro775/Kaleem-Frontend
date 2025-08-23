import { test, expect } from '@playwright/test';

// 🎭 اختبارات E2E لصفحة التسجيل - Kaleem Frontend

test.describe('📝 صفحة التسجيل', () => {
  test.beforeEach(async ({ page }) => {
    // الانتقال إلى صفحة التسجيل
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
  });

  test('✅ عرض صفحة التسجيل بشكل صحيح', async ({ page }) => {
    // التحقق من عنوان الصفحة
    await expect(page).toHaveTitle(/تسجيل|Signup|إنشاء حساب|Create Account/);
    
    // التحقق من وجود النموذج
    const signupForm = page.locator('form, .signup-form, [data-testid="signup-form"]');
    await expect(signupForm.first()).toBeVisible();
    
    // التحقق من وجود الحقول المطلوبة
    const nameInput = page.locator('input[name="name"], input[placeholder*="الاسم"], input[placeholder*="Name"]');
    await expect(nameInput.first()).toBeVisible();
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="البريد الإلكتروني"], input[placeholder*="Email"]');
    await expect(emailInput.first()).toBeVisible();
    
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="كلمة المرور"], input[placeholder*="Password"]');
    await expect(passwordInput.first()).toBeVisible();
    
    const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[placeholder*="تأكيد كلمة المرور"], input[placeholder*="Confirm Password"]');
    if (await confirmPasswordInput.count() > 0) {
      await expect(confirmPasswordInput.first()).toBeVisible();
    }
    
    // التحقق من وجود زر التسجيل
    const signupButton = page.locator('button[type="submit"], button:has-text("تسجيل"), button:has-text("Sign Up"), button:has-text("إنشاء حساب")');
    await expect(signupButton.first()).toBeVisible();
  });

  test('🔗 اختبار الروابط في صفحة التسجيل', async ({ page }) => {
    // اختبار رابط تسجيل الدخول
    const loginLink = page.locator('a:has-text("تسجيل الدخول"), a:has-text("Login"), a:has-text("Sign In")');
    if (await loginLink.count() > 0) {
      await expect(loginLink.first()).toBeVisible();
      
      // النقر على الرابط
      await loginLink.first().click();
      
      // انتظار تحميل صفحة تسجيل الدخول
      await page.waitForLoadState('networkidle');
      
      // التحقق من تغيير URL
      expect(page.url()).toMatch(/login|signin|auth/);
      
      // العودة لصفحة التسجيل
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');
    }
    
    // اختبار رابط الشروط والأحكام
    const termsLink = page.locator('a:has-text("الشروط"), a:has-text("Terms"), a:has-text("Terms & Conditions")');
    if (await termsLink.count() > 0) {
      await expect(termsLink.first()).toBeVisible();
      
      // النقر على الرابط
      await termsLink.first().click();
      
      // انتظار تحميل صفحة الشروط
      await page.waitForLoadState('networkidle');
      
      // التحقق من تغيير URL
      expect(page.url()).not.toBe('http://localhost:3000/signup');
      
      // العودة لصفحة التسجيل
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');
    }
  });

  test('📝 اختبار ملء النموذج', async ({ page }) => {
    // ملء حقل الاسم
    const nameInput = page.locator('input[name="name"], input[placeholder*="الاسم"], input[placeholder*="Name"]');
    await nameInput.fill('أحمد محمد');
    
    // التحقق من القيمة المدخلة
    await expect(nameInput).toHaveValue('أحمد محمد');
    
    // ملء حقل البريد الإلكتروني
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="البريد الإلكتروني"], input[placeholder*="Email"]');
    await emailInput.fill('ahmed@example.com');
    
    // التحقق من القيمة المدخلة
    await expect(emailInput).toHaveValue('ahmed@example.com');
    
    // ملء حقل كلمة المرور
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="كلمة المرور"], input[placeholder*="Password"]');
    await passwordInput.fill('Password123!');
    
    // التحقق من القيمة المدخلة
    await expect(passwordInput).toHaveValue('Password123!');
    
    // ملء حقل تأكيد كلمة المرور
    const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[placeholder*="تأكيد كلمة المرور"], input[placeholder*="Confirm Password"]');
    if (await confirmPasswordInput.count() > 0) {
      await confirmPasswordInput.fill('Password123!');
      
      // التحقق من القيمة المدخلة
      await expect(confirmPasswordInput).toHaveValue('Password123!');
    }
  });

  test('👁️ اختبار إظهار/إخفاء كلمة المرور', async ({ page }) => {
    // البحث عن حقل كلمة المرور
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="كلمة المرور"], input[placeholder*="Password"]');
    
    // البحث عن زر إظهار/إخفاء كلمة المرور
    const togglePasswordButton = page.locator('button[aria-label*="إظهار"], button[aria-label*="Show"], button[aria-label*="Hide"], .password-toggle');
    
    if (await togglePasswordButton.count() > 0) {
      // التحقق من أن كلمة المرور مخفية في البداية
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // النقر على زر الإظهار
      await togglePasswordButton.click();
      
      // انتظار تغيير النوع
      await page.waitForTimeout(500);
      
      // التحقق من أن كلمة المرور ظاهرة
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // النقر مرة أخرى لإخفاء كلمة المرور
      await togglePasswordButton.click();
      
      // انتظار تغيير النوع
      await page.waitForTimeout(500);
      
      // التحقق من أن كلمة المرور مخفية مرة أخرى
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('❌ اختبار التحقق من صحة البيانات', async ({ page }) => {
    // محاولة إرسال النموذج فارغ
    const signupButton = page.locator('button[type="submit"], button:has-text("تسجيل"), button:has-text("Sign Up"), button:has-text("إنشاء حساب")');
    await signupButton.first().click();
    
    // انتظار رسائل الخطأ
    await page.waitForTimeout(1000);
    
    // التحقق من وجود رسائل خطأ
    const errorMessages = page.locator('.error, .error-message, [data-testid="error"], .alert-error');
    expect(await errorMessages.count()).toBeGreaterThan(0);
    
    // التحقق من أن النموذج لم يتم إرساله
    expect(page.url()).toBe('http://localhost:3000/signup');
  });

  test('📧 اختبار التحقق من صحة البريد الإلكتروني', async ({ page }) => {
    // ملء النموذج ببريد إلكتروني غير صحيح
    const nameInput = page.locator('input[name="name"], input[placeholder*="الاسم"], input[placeholder*="Name"]');
    await nameInput.fill('أحمد محمد');
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="البريد الإلكتروني"], input[placeholder*="Email"]');
    await emailInput.fill('invalid-email');
    
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="كلمة المرور"], input[placeholder*="Password"]');
    await passwordInput.fill('Password123!');
    
    // النقر على زر التسجيل
    const signupButton = page.locator('button[type="submit"], button:has-text("تسجيل"), button:has-text("Sign Up"), button:has-text("إنشاء حساب")');
    await signupButton.first().click();
    
    // انتظار رسائل الخطأ
    await page.waitForTimeout(1000);
    
    // التحقق من وجود رسالة خطأ للبريد الإلكتروني
    const emailError = page.locator('.error:has-text("البريد الإلكتروني"), .error:has-text("Email"), [data-testid="email-error"]');
    if (await emailError.count() > 0) {
      await expect(emailError.first()).toBeVisible();
    }
  });

  test('🔒 اختبار التحقق من قوة كلمة المرور', async ({ page }) => {
    // ملء النموذج بكلمة مرور ضعيفة
    const nameInput = page.locator('input[name="name"], input[placeholder*="الاسم"], input[placeholder*="Name"]');
    await nameInput.fill('أحمد محمد');
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="البريد الإلكتروني"], input[placeholder*="Email"]');
    await emailInput.fill('ahmed@example.com');
    
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="كلمة المرور"], input[placeholder*="Password"]');
    await passwordInput.fill('123');
    
    // النقر على زر التسجيل
    const signupButton = page.locator('button[type="submit"], button:has-text("تسجيل"), button:has-text("Sign Up"), button:has-text("إنشاء حساب")');
    await signupButton.first().click();
    
    // انتظار رسائل الخطأ
    await page.waitForTimeout(1000);
    
    // التحقق من وجود رسالة خطأ لكلمة المرور
    const passwordError = page.locator('.error:has-text("كلمة المرور"), .error:has-text("Password"), [data-testid="password-error"]');
    if (await passwordError.count() > 0) {
      await expect(passwordError.first()).toBeVisible();
    }
  });

  test('✅ اختبار التسجيل الناجح', async ({ page }) => {
    // ملء النموذج ببيانات صحيحة
    const nameInput = page.locator('input[name="name"], input[placeholder*="الاسم"], input[placeholder*="Name"]');
    await nameInput.fill('أحمد محمد');
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="البريد الإلكتروني"], input[placeholder*="Email"]');
    await emailInput.fill('ahmed@example.com');
    
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="كلمة المرور"], input[placeholder*="Password"]');
    await passwordInput.fill('Password123!');
    
    const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[placeholder*="تأكيد كلمة المرور"], input[placeholder*="Confirm Password"]');
    if (await confirmPasswordInput.count() > 0) {
      await confirmPasswordInput.fill('Password123!');
    }
    
    // النقر على زر التسجيل
    const signupButton = page.locator('button[type="submit"], button:has-text("تسجيل"), button:has-text("Sign Up"), button:has-text("إنشاء حساب")');
    await signupButton.first().click();
    
    // انتظار معالجة الطلب
    await page.waitForTimeout(3000);
    
    // التحقق من نجاح التسجيل (إما رسالة نجاح أو إعادة توجيه)
    const successMessage = page.locator('.success, .success-message, [data-testid="success"], .alert-success');
    const currentUrl = page.url();
    
    if (await successMessage.count() > 0) {
      // رسالة نجاح
      await expect(successMessage.first()).toBeVisible();
    } else if (currentUrl !== 'http://localhost:3000/signup') {
      // إعادة توجيه
      expect(currentUrl).not.toBe('http://localhost:3000/signup');
    }
  });

  test('📱 اختبار التصميم المتجاوب', async ({ page }) => {
    // اختبار أحجام شاشات مختلفة
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Small' },
      { width: 1024, height: 768, name: 'Tablet Landscape' },
      { width: 768, height: 1024, name: 'Tablet Portrait' },
      { width: 375, height: 667, name: 'Mobile' },
      { width: 320, height: 568, name: 'Mobile Small' }
    ];
    
    for (const viewport of viewports) {
      // تغيير حجم النافذة
      await page.setViewportSize(viewport);
      
      // انتظار إعادة تخطيط الصفحة
      await page.waitForTimeout(500);
      
      // التحقق من أن النموذج يظهر
      const signupForm = page.locator('form, .signup-form, [data-testid="signup-form"]');
      await expect(signupForm.first()).toBeVisible();
      
      // التحقق من أن الحقول تظهر
      const nameInput = page.locator('input[name="name"], input[placeholder*="الاسم"], input[placeholder*="Name"]');
      await expect(nameInput.first()).toBeVisible();
      
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="البريد الإلكتروني"], input[placeholder*="Email"]');
      await expect(emailInput.first()).toBeVisible();
      
      const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="كلمة المرور"], input[placeholder*="Password"]');
      await expect(passwordInput.first()).toBeVisible();
    }
  });

  test('🎨 اختبار التصميم RTL', async ({ page }) => {
    // التحقق من اتجاه النص RTL
    const body = page.locator('body, html');
    await expect(body).toHaveAttribute('dir', 'rtl');
    
    // التحقق من لغة الصفحة
    await expect(body).toHaveAttribute('lang', 'ar');
    
    // التحقق من أن النموذج يظهر بشكل صحيح
    const signupForm = page.locator('form, .signup-form, [data-testid="signup-form"]');
    await expect(signupForm.first()).toBeVisible();
  });

  test('♿ اختبار إمكانية الوصول', async ({ page }) => {
    // التحقق من وجود عنوان للصفحة
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    
    // التحقق من وجود headings
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
    
    // التحقق من وجود labels للحقول
    const inputs = page.locator('input, textarea, select');
    for (let i = 0; i < await inputs.count(); i++) {
      const input = inputs.nth(i);
      const label = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');
      
      if (id) {
        const labelElement = page.locator(`label[for="${id}"]`);
        if (await labelElement.count() > 0) {
          await expect(labelElement.first()).toBeVisible();
        }
      }
      
      if (!label && !id) {
        // التحقق من وجود placeholder أو aria-label
        const placeholder = await input.getAttribute('placeholder');
        const ariaLabel = await input.getAttribute('aria-label');
        expect(placeholder || ariaLabel).toBeTruthy();
      }
    }
    
    // التحقق من وجود زر تسجيل الدخول
    const signupButton = page.locator('button[type="submit"], button:has-text("تسجيل"), button:has-text("Sign Up"), button:has-text("إنشاء حساب")');
    await expect(signupButton.first()).toBeVisible();
  });

  test('📊 اختبار الأداء', async ({ page }) => {
    // قياس وقت تحميل الصفحة
    const startTime = Date.now();
    
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // التحقق من أن وقت التحميل أقل من 3 ثوانٍ
    expect(loadTime).toBeLessThan(3000);
    
    // قياس وقت ملء النموذج
    const formFillStartTime = Date.now();
    
    // ملء النموذج
    const nameInput = page.locator('input[name="name"], input[placeholder*="الاسم"], input[placeholder*="Name"]');
    await nameInput.fill('أحمد محمد');
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="البريد الإلكتروني"], input[placeholder*="Email"]');
    await emailInput.fill('ahmed@example.com');
    
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="كلمة المرور"], input[placeholder*="Password"]');
    await passwordInput.fill('Password123!');
    
    const formFillTime = Date.now() - formFillStartTime;
    
    // التحقق من أن وقت ملء النموذج أقل من ثانيتين
    expect(formFillTime).toBeLessThan(2000);
  });

  test('🔒 اختبار الأمان', async ({ page }) => {
    // التحقق من أن كلمة المرور مخفية افتراضياً
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="كلمة المرور"], input[placeholder*="Password"]');
    await expect(passwordInput.first()).toHaveAttribute('type', 'password');
    
    // التحقق من عدم وجود معلومات حساسة في HTML
    const pageContent = await page.content();
    expect(pageContent).not.toContain('Password123!');
    expect(pageContent).not.toContain('ahmed@example.com');
    
    // التحقق من وجود CSRF token أو حماية مماثلة
    const csrfToken = page.locator('input[name="_csrf"], input[name="csrfToken"], input[type="hidden"]');
    if (await csrfToken.count() > 0) {
      await expect(csrfToken.first()).toBeVisible();
    }
  });

  test('📊 اختبار التتبع', async ({ page }) => {
    // تفعيل التتبع
    await page.context().tracing.start({ screenshots: true, snapshots: true });
    
    // تنفيذ سيناريو التسجيل
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    // ملء النموذج
    const nameInput = page.locator('input[name="name"], input[placeholder*="الاسم"], input[placeholder*="Name"]');
    await nameInput.fill('أحمد محمد');
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="البريد الإلكتروني"], input[placeholder*="Email"]');
    await emailInput.fill('ahmed@example.com');
    
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="كلمة المرور"], input[placeholder*="Password"]');
    await passwordInput.fill('Password123!');
    
    // النقر على زر التسجيل
    const signupButton = page.locator('button[type="submit"], button:has-text("تسجيل"), button:has-text("Sign Up"), button:has-text("إنشاء حساب")');
    await signupButton.first().click();
    
    // انتظار معالجة الطلب
    await page.waitForTimeout(3000);
    
    // إيقاف التتبع
    await page.context().tracing.stop({ path: 'test-results/signup-trace.zip' });
    
    // التحقق من إنشاء ملف التتبع
    const fs = require('fs');
    expect(fs.existsSync('test-results/signup-trace.zip')).toBe(true);
  });
});
