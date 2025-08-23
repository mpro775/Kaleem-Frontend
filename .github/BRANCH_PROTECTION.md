# 🛡️ Branch Protection Rules - Kaleem Frontend

## 📋 القواعد المطلوبة

### 🚫 **Branch: `main`**
- ✅ **Require a pull request before merging**
- ✅ **Require approvals: 2** (على الأقل)
- ✅ **Dismiss stale PR approvals when new commits are pushed**
- ✅ **Require status checks to pass before merging**
  - `lint-and-format` ✅
  - `unit-tests` ✅
  - `coverage` ✅
- ✅ **Require branches to be up to date before merging**
- ✅ **Restrict pushes that create files that are larger than 100 MB**
- ✅ **Allow force pushes: Never**
- ✅ **Allow deletions: Never**

### 🔄 **Branch: `develop`**
- ✅ **Require a pull request before merging**
- ✅ **Require approvals: 1** (على الأقل)
- ✅ **Dismiss stale PR approvals when new commits are pushed**
- ✅ **Require status checks to pass before merging**
  - `quick-tests` ✅
- ✅ **Require branches to be up to date before merging**
- ✅ **Allow force pushes: Never**
- ✅ **Allow deletions: Never**

### 🌿 **Feature Branches: `feature/*`**
- ✅ **Require a pull request before merging**
- ✅ **Require approvals: 1** (على الأقل)
- ✅ **Require status checks to pass before merging**
  - `quick-tests` ✅
- ✅ **Require branches to be up to date before merging**

### 🐛 **Bugfix Branches: `bugfix/*`**
- ✅ **Require a pull request before merging**
- ✅ **Require approvals: 1** (على الأقل)
- ✅ **Require status checks to pass before merging**
  - `quick-tests` ✅
- ✅ **Require branches to be up to date before merging**

## 🎯 **Status Checks المطلوبة**

### **للملف الرئيسي (`main`):**
1. **🔍 فحص جودة الكود** - ESLint + Prettier
2. **🧪 اختبارات الوحدة** - جميع الاختبارات
3. **📊 تقارير التغطية** - Codecov
4. **🔒 فحص الأمان** - npm audit

### **للفروع الأخرى:**
1. **🚀 اختبارات سريعة** - اختبارات أساسية + أداء

## 📝 **كيفية إعداد Branch Protection**

### **1. الذهاب إلى Repository Settings**
```
Repository → Settings → Branches
```

### **2. إضافة Branch Protection Rule**
```
Add rule → Branch name pattern
```

### **3. تحديد القواعد**
- ✅ **Require a pull request before merging**
- ✅ **Require approvals**
- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**

### **4. حفظ القواعد**
```
Create → Save changes
```

## 🚨 **عواقب عدم الالتزام**

- ❌ **لا يمكن الدمج** بدون موافقة المطلوبة
- ❌ **لا يمكن الدمج** بدون نجاح الاختبارات
- ❌ **لا يمكن الدمج** بدون تحديث الفرع
- ❌ **لا يمكن الدفع المباشر** إلى الفروع المحمية

## 💡 **نصائح للفريق**

1. **🔀 استخدم Pull Requests** دائماً
2. **🧪 تأكد من نجاح الاختبارات** قبل إنشاء PR
3. **📝 اكتب وصف واضح** للـ PR
4. **🔍 راجع الكود** بعناية
5. **✅ اطلب مراجعة** من الفريق المناسب

---

*تم إنشاء هذا الملف بواسطة نظام CI/CD* 🤖
