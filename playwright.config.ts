import { defineConfig, devices } from '@playwright/test';

// 🎭 إعدادات Playwright لاختبارات E2E - Kaleem Frontend

export default defineConfig({
  // 🔍 إعدادات المشروع
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 🚀 إعدادات التقارير
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }],
    ['list'],
    ['line']
  ],
  
  // ⚡ إعدادات الأداء
  use: {
    // 🎯 إعدادات أساسية
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 🔧 إعدادات إضافية
    actionTimeout: 10000,
    navigationTimeout: 30000,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // 📱 إعدادات الأجهزة
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // 🎨 إعدادات التصميم
    colorScheme: 'light',
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
    
    // 📊 إعدادات الأداء
    geolocation: { longitude: 46.6753, latitude: 24.7136 }, // الرياض
    permissions: ['geolocation', 'notifications'],
    
    // 🔒 إعدادات الأمان
    extraHTTPHeaders: {
      'Accept-Language': 'ar-SA,ar;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
  },
  
  // 🌐 إعدادات المتصفحات
  projects: [
    // 🖥️ Desktop - Chrome
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        }
      },
    },
    
    // 🖥️ Desktop - Firefox
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    // 🖥️ Desktop - Safari
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    // 📱 Mobile - iPhone
    {
      name: 'iPhone 12',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    
    // 📱 Mobile - Android
    {
      name: 'Pixel 5',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
        deviceScaleFactor: 2.75,
        isMobile: true,
        hasTouch: true,
      },
    },
    
    // 📱 Tablet - iPad
    {
      name: 'iPad Pro',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  
  // 🔧 إعدادات الخادم
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  
  // 📁 إعدادات الملفات
  outputDir: 'test-results/',
  testMatch: '**/*.e2e.spec.ts',
  
  // ⏱️ إعدادات التوقيت
  globalTimeout: 60 * 60 * 1000, // ساعة واحدة
  expect: {
    timeout: 10000,
    toMatchSnapshot: {
      maxDiffPixels: 10,
    },
  },
  
  // 🔍 إعدادات التصحيح
  use: {
    // إعدادات إضافية للتصحيح
    launchOptions: {
      slowMo: process.env.DEBUG ? 1000 : 0,
      devtools: process.env.DEBUG ? true : false,
    },
  },
  
  // 📊 إعدادات التغطية
  use: {
    // إعدادات التغطية
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.e2e.{ts,tsx}',
        'src/test/**/*',
        'node_modules/**/*',
      ],
    },
  },
  
  // 🚨 إعدادات الأخطاء
  use: {
    // إعدادات معالجة الأخطاء
    actionTimeout: 10000,
    navigationTimeout: 30000,
    expect: {
      timeout: 10000,
    },
  },
  
  // 🔒 إعدادات الأمان
  use: {
    // إعدادات الأمان
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    extraHTTPHeaders: {
      'X-Test-Mode': 'true',
      'X-Playwright': 'true',
    },
  },
  
  // 📱 إعدادات الأجهزة
  use: {
    // إعدادات الأجهزة
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    colorScheme: 'light',
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
  },
  
  // 🎯 إعدادات إضافية
  use: {
    // إعدادات إضافية
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: 'tests/e2e/storage-state.json',
  },
});

// 📋 ملاحظات الاستخدام:
// 
// 🚀 تشغيل الاختبارات:
//   npx playwright test                    # جميع الاختبارات
//   npx playwright test --project=chromium # Chrome فقط
//   npx playwright test --project=firefox  # Firefox فقط
//   npx playwright test --project=webkit   # Safari فقط
//   npx playwright test --project="iPhone 12" # iPhone فقط
//   npx playwright test --project="Pixel 5"   # Android فقط
//   npx playwright test --project="iPad Pro"  # iPad فقط
// 
// 🔍 تشغيل مع UI:
//   npx playwright test --ui
// 
// 📊 تشغيل مع التصحيح:
//   DEBUG=1 npx playwright test
// 
// 🎭 تشغيل اختبار واحد:
//   npx playwright test login.e2e.spec.ts
// 
// 📱 تشغيل على جهاز محدد:
//   npx playwright test --project="iPhone 12"
// 
// 🔧 تشغيل مع التتبع:
//   npx playwright test --trace=on
