import { test, expect } from '@playwright/test';

// 🎭 اختبارات E2E لتسجيل الدخول - Kaleem Frontend

test.describe('🔐 تسجيل الدخول', () => {
  test.beforeEach(async ({ page }) => {
    // الانتقال إلى صفحة تسجيل الدخول
    await page.goto('/auth/login');
    
    // انتظار تحميل الصفحة
    await page.waitForLoadState('networkidle');
  });

  test('✅ عرض صفحة تسجيل الدخول بشكل صحيح', async ({ page }) => {
    // التحقق من عنوان الصفحة
    await expect(page).toHaveTitle(/تسجيل الدخول|Login/);
    
    // التحقق من وجود النموذج
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();
    
    // التحقق من وجود حقول الإدخال
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // التحقق من وجود زر تسجيل الدخول
    const loginButton = page.locator('button[type="submit"], button:has-text("تسجيل الدخول"), button:has-text("Login")');
    await expect(loginButton).toBeVisible();
    
    // التحقق من وجود رابط إنشاء حساب جديد
    const signupLink = page.locator('a:has-text("إنشاء حساب"), a:has-text("Sign up")');
    await expect(signupLink).toBeVisible();
  });

  test('🔍 التحقق من صحة النموذج', async ({ page }) => {
    // ملء النموذج ببيانات صحيحة
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    
    // التحقق من أن الحقول تحتوي على القيم المدخلة
    await expect(page.locator('input[type="email"], input[name="email"]')).toHaveValue('test@example.com');
    await expect(page.locator('input[type="password"], input[name="password"]')).toHaveValue('password123');
  });

  test('❌ عرض رسائل خطأ للحقول الفارغة', async ({ page }) => {
    // محاولة إرسال النموذج بدون ملء الحقول
    const loginButton = page.locator('button[type="submit"], button:has-text("تسجيل الدخول"), button:has-text("Login")');
    await loginButton.click();
    
    // انتظار ظهور رسائل الخطأ
    await page.waitForTimeout(1000);
    
    // التحقق من وجود رسائل خطأ
    const errorMessages = page.locator('.error, .error-message, [data-testid="error"], .Mui-error');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('📧 عرض رسائل خطأ لصيغة البريد الإلكتروني غير الصحيحة', async ({ page }) => {
    // إدخال بريد إلكتروني بصيغة غير صحيحة
    await page.fill('input[type="email"], input[name="email"]', 'invalid-email');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    
    // النقر على زر تسجيل الدخول
    const loginButton = page.locator('button[type="submit"], button:has-text("تسجيل الدخول"), button:has-text("Login")');
    await loginButton.click();
    
    // انتظار ظهور رسالة الخطأ
    await page.waitForTimeout(1000);
    
    // التحقق من وجود رسالة خطأ للبريد الإلكتروني
    const emailError = page.locator('.error, .error-message, [data-testid="error"], .Mui-error');
    await expect(emailError.first()).toBeVisible();
  });

  test('🔒 عرض رسائل خطأ لكلمة المرور القصيرة', async ({ page }) => {
    // إدخال كلمة مرور قصيرة
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await page.fill('input[type="password"], input[name="password"]', '123');
    
    // النقر على زر تسجيل الدخول
    const loginButton = page.locator('button[type="submit"], button:has-text("تسجيل الدخول"), button:has-text("Login")');
    await loginButton.click();
    
    // انتظار ظهور رسالة الخطأ
    await page.waitForTimeout(1000);
    
    // التحقق من وجود رسالة خطأ لكلمة المرور
    const passwordError = page.locator('.error, .error-message, [data-testid="error"], .Mui-error');
    await expect(passwordError.first()).toBeVisible();
  });

  test('👁️ إظهار/إخفاء كلمة المرور', async ({ page }) => {
    // ملء كلمة المرور
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    
    // البحث عن زر إظهار/إخفاء كلمة المرور
    const togglePasswordButton = page.locator('button[aria-label*="password"], button[data-testid="toggle-password"], .password-toggle');
    
    if (await togglePasswordButton.count() > 0) {
      // النقر على زر إظهار كلمة المرور
      await togglePasswordButton.click();
      
      // التحقق من أن كلمة المرور أصبحت مرئية
      const passwordInput = page.locator('input[type="password"], input[name="password"]');
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // النقر مرة أخرى لإخفاء كلمة المرور
      await togglePasswordButton.click();
      
      // التحقق من أن كلمة المرور أصبحت مخفية
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('🔗 الانتقال إلى صفحة إنشاء حساب جديد', async ({ page }) => {
    // النقر على رابط إنشاء حساب جديد
    const signupLink = page.locator('a:has-text("إنشاء حساب"), a:has-text("Sign up")');
    await signupLink.click();
    
    // التحقق من الانتقال إلى صفحة إنشاء حساب جديد
    await expect(page).toHaveURL(/.*signup|.*register|.*auth\/signup|.*auth\/register/);
  });

  test('🔗 الانتقال إلى صفحة نسيان كلمة المرور', async ({ page }) => {
    // البحث عن رابط نسيان كلمة المرور
    const forgotPasswordLink = page.locator('a:has-text("نسيت كلمة المرور"), a:has-text("Forgot password")');
    
    if (await forgotPasswordLink.count() > 0) {
      // النقر على الرابط
      await forgotPasswordLink.click();
      
      // التحقق من الانتقال إلى صفحة نسيان كلمة المرور
      await expect(page).toHaveURL(/.*forgot-password|.*reset-password|.*auth\/forgot-password/);
    }
  });

  test('📱 استجابة التصميم للأجهزة المحمولة', async ({ page }) => {
    // تغيير حجم النافذة إلى حجم الهاتف
    await page.setViewportSize({ width: 375, height: 667 });
    
    // التحقق من أن النموذج يظهر بشكل صحيح
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();
    
    // التحقق من أن الحقول تظهر بشكل صحيح
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // التحقق من أن الزر يظهر بشكل صحيح
    const loginButton = page.locator('button[type="submit"], button:has-text("تسجيل الدخول"), button:has-text("Login")');
    await expect(loginButton).toBeVisible();
  });

  test('🎨 التحقق من التصميم RTL', async ({ page }) => {
    // التحقق من اتجاه النص RTL
    const body = page.locator('body, html');
    await expect(body).toHaveAttribute('dir', 'rtl');
    
    // التحقق من لغة الصفحة
    await expect(body).toHaveAttribute('lang', 'ar');
  });

  test('♿ إمكانية الوصول (Accessibility)', async ({ page }) => {
    // التحقق من وجود labels للحقول
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    // التحقق من وجود aria-label أو label مرتبط
    const emailLabel = page.locator('label[for*="email"], [aria-label*="email"], [data-testid="email-label"]');
    const passwordLabel = page.locator('label[for*="password"], [aria-label*="password"], [data-testid="password-label"]');
    
    if (await emailLabel.count() > 0) {
      await expect(emailLabel).toBeVisible();
    }
    
    if (await passwordLabel.count() > 0) {
      await expect(passwordLabel).toBeVisible();
    }
    
    // التحقق من وجود alt text للصور
    const images = page.locator('img');
    for (let i = 0; i < await images.count(); i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('🔒 اختبار تسجيل الدخول الناجح (Mock)', async ({ page }) => {
    // Mock للـ API call
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User'
          }
        })
      });
    });
    
    // ملء النموذج
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    
    // النقر على زر تسجيل الدخول
    const loginButton = page.locator('button[type="submit"], button:has-text("تسجيل الدخول"), button:has-text("Login")');
    await loginButton.click();
    
    // انتظار نجاح تسجيل الدخول
    await page.waitForTimeout(2000);
    
    // التحقق من الانتقال إلى الصفحة الرئيسية أو لوحة التحكم
    await expect(page).toHaveURL(/.*dashboard|.*home|.*\/$/);
  });

  test('❌ اختبار تسجيل الدخول الفاشل (Mock)', async ({ page }) => {
    // Mock للـ API call مع خطأ
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'بيانات الاعتماد غير صحيحة'
        })
      });
    });
    
    // ملء النموذج
    await page.fill('input[type="email"], input[name="email"]', 'wrong@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    
    // النقر على زر تسجيل الدخول
    const loginButton = page.locator('button[type="submit"], button:has-text("تسجيل الدخول"), button:has-text("Login")');
    await loginButton.click();
    
    // انتظار ظهور رسالة الخطأ
    await page.waitForTimeout(2000);
    
    // التحقق من وجود رسالة خطأ
    const errorMessage = page.locator('.error, .error-message, [data-testid="error"], .Mui-error, .alert-error');
    await expect(errorMessage.first()).toBeVisible();
    
    // التحقق من أن المستخدم لا يزال في صفحة تسجيل الدخول
    await expect(page).toHaveURL(/.*login|.*auth\/login/);
  });

  test('⏱️ اختبار الأداء', async ({ page }) => {
    // قياس وقت تحميل الصفحة
    const startTime = Date.now();
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // التحقق من أن وقت التحميل أقل من 3 ثوانٍ
    expect(loadTime).toBeLessThan(3000);
    
    // قياس وقت استجابة النموذج
    const formStartTime = Date.now();
    
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    
    const formFillTime = Date.now() - formStartTime;
    
    // التحقق من أن وقت ملء النموذج أقل من ثانية واحدة
    expect(formFillTime).toBeLessThan(1000);
  });
});
