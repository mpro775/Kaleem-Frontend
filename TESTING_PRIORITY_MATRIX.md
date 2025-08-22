# 🎯 مصفوفة أولويات الاختبارات - Kleem Frontend

## 📊 نظرة عامة
- **إجمالي الملفات:** 153 ملف
- **ملفات بها اختبارات:** 19 ملف ✅
- **ملفات تحتاج اختبارات:** 134 ملف ❌
- **معدل التغطية الحالي:** 12.4%

---

## 🔴 أولوية عالية (Critical) - 25 ملف

### 🔐 Authentication & Security (8 ملفات)
```
1. app/routes/PrivateRoute.tsx ⚠️ CRITICAL
2. app/routes/RoleRoute.tsx ⚠️ CRITICAL  
3. auth/AuthLayout.tsx ⚠️ CRITICAL
4. auth/guards.tsx ⚠️ CRITICAL
5. context/AuthContext.tsx ⚠️ CRITICAL
6. pages/auth/LoginPage.tsx ⚠️ CRITICAL
7. pages/auth/VerifyEmailPage.tsx ⚠️ CRITICAL
8. pages/auth/SignUpPage.tsx ✅ DONE (محسن)
```

### 🏗️ Core Application Structure (5 ملفات)
```
9. app/App.tsx ⚠️ CRITICAL
10. app/main.tsx ⚠️ CRITICAL
11. app/layout/merchant/MerchantLayout.tsx ⚠️ CRITICAL
12. app/layout/admin/AdminLayout.tsx ⚠️ CRITICAL
13. pages/public/Home.tsx ⚠️ CRITICAL
```

### 🛒 E-commerce Core (7 ملفات)
```
14. context/CartContext.tsx ⚠️ CRITICAL
15. pages/store/ProductDetailsPage.tsx ⚠️ CRITICAL
16. pages/store/OrderDetailsPage.tsx ⚠️ CRITICAL
17. pages/store/MyOrdersPage.tsx ⚠️ CRITICAL
18. features/store/ui/ProductCard.tsx ⚠️ CRITICAL
19. features/store/ui/CartDialog.tsx ⚠️ CRITICAL
20. pages/store/StorePage.tsx ✅ DONE
```

### 💼 Business Critical Dashboard (5 ملفات)
```
21. pages/merchant/Dashboard.tsx ⚠️ CRITICAL
22. pages/admin/kleem/Dashboard.tsx ⚠️ CRITICAL
23. pages/merchant/ConversationsPage.tsx ⚠️ CRITICAL
24. pages/merchant/ProductsPage.tsx ⚠️ CRITICAL
25. pages/merchant/OrdersPage.tsx ⚠️ CRITICAL
```

---

## 🟡 أولوية متوسطة (Important) - 54 ملف

### 🎨 Landing Page (13 ملف - بعضها مكتمل)
```
26. features/landing/sections/ComparisonSection.tsx ✅ DONE
27. features/landing/sections/DemoSection.tsx ✅ DONE
28. features/landing/sections/FAQSection.tsx ✅ DONE
29. features/landing/sections/HeroSection.tsx ✅ DONE
30. features/landing/sections/HowItWorks.tsx ✅ DONE
31. features/landing/sections/IntegrationsSection.tsx ✅ DONE
32. features/landing/sections/PricingSection.tsx ✅ DONE
33. features/landing/sections/StorefrontSection.tsx ✅ DONE
34. features/landing/sections/Testimonials.tsx ✅ DONE
35. features/landing/sections/WhyChooseKaleem.tsx 🟡 NEEDS IMPROVEMENT
36. features/landing/sections/InviteBanner.tsx ✅ DONE
37. features/landing/ui/Navbar.tsx 🟡 TODO
38. features/landing/ui/Footer.tsx 🟡 TODO
```

### 🏪 Merchant Core Features (20 ملف)
```
39. pages/merchant/AnalyticsPage.tsx 🟡 TODO
40. pages/merchant/CategoriesPage.tsx 🟡 TODO
41. pages/merchant/ChannelsIntegrationPage.tsx 🟡 TODO
42. pages/merchant/ChatSettingsPage.tsx 🟡 TODO
43. pages/merchant/KnowledgePage.tsx 🟡 TODO
44. pages/merchant/LeadsManagerPage.tsx 🟡 TODO
45. pages/merchant/MerchantSettingsPage.tsx 🟡 TODO
46. pages/merchant/MissingResponsesPage.tsx 🟡 TODO
47. pages/merchant/PromptStudio.tsx 🟡 TODO
48. pages/merchant/StorefrontThemePage.tsx 🟡 TODO
49. pages/merchant/SupportPage.tsx 🟡 TODO
50. pages/merchant/BannersManagementPage.tsx 🟡 TODO
51. pages/merchant/AccountSettingsPage.tsx 🟡 TODO
52. pages/merchant/InstructionsPage.tsx 🟡 TODO
53. features/mechant/dashboard/ui/MetricsCards.tsx 🟡 TODO
54. features/mechant/dashboard/ui/DashboardHeader.tsx 🟡 TODO
55. features/mechant/products/ui/ProductsTable.tsx 🟡 TODO
56. features/mechant/products/ui/AddProductDialog.tsx 🟡 TODO
57. features/mechant/categories/ui/CategoriesTable.tsx 🟡 TODO
58. features/mechant/Conversations/ChatWorkspace.tsx 🟡 TODO
```

### 👨‍💼 Admin Features (10 ملفات)
```
59. pages/admin/kleem/AnalyticsPage.tsx 🟡 TODO
60. pages/admin/kleem/ConversationsPage.tsx 🟡 TODO
61. pages/admin/kleem/ChatSettingsPage.tsx 🟡 TODO
62. pages/admin/kleem/KnowledgeBasePage.tsx 🟡 TODO
63. pages/admin/kleem/PromptsPage.tsx 🟡 TODO
64. pages/admin/kleem/ConversationView.tsx 🟡 TODO
65. pages/admin/kleem/KleemMissingResponsesPage.tsx 🟡 TODO
66. pages/admin/kleem/KleemRatingsPage.tsx 🟡 TODO
67. pages/ChatPage.tsx 🟡 TODO
68. app/layout/OnboardingLayout.tsx 🟡 TODO
```

### 🔧 Core Components (11 ملف)
```
69. app/GlobalGradients.tsx 🟡 TODO
70. app/providers/QueryClientProvider.tsx 🟡 TODO
71. app/layout/merchant/Sidebar.tsx 🟡 TODO
72. app/layout/merchant/Topbar.tsx 🟡 TODO
73. shared/ui/GradientIcon.tsx ✅ DONE
74. shared/ui/OtpInputBoxes.tsx ✅ DONE
75. shared/ui/SafeText.tsx ✅ DONE
76. shared/ui/SetupChecklist.tsx ✅ DONE
77. shared/ui/TagsInput.tsx ✅ DONE
78. pages/onboarding/OnboardingPage.tsx 🟡 TODO
79. pages/onboarding/SourceSelectPage.tsx 🟡 TODO
```

---

## 🟢 أولوية منخفضة (Nice to Have) - 55 ملف

### 🎯 Chat & Communication (13 ملف)
```
80. features/landing/chatKaleem/ChatBubble.tsx 🟢 LOW
81. features/landing/chatKaleem/ChatHeader.tsx 🟢 LOW
82. features/landing/chatKaleem/ChatInput.tsx 🟢 LOW
83. features/landing/chatKaleem/LiveChat.tsx 🟢 LOW
84. features/mechant/Conversations/ui/ChatInput.tsx 🟢 LOW
85. features/mechant/Conversations/ui/ChatWindow.tsx 🟢 LOW
86. features/mechant/Conversations/ui/ConversationsList.tsx 🟢 LOW
87. features/mechant/Conversations/ui/ConversationsSidebar.tsx 🟢 LOW
88. features/mechant/Conversations/ui/EmptyState.tsx 🟢 LOW
89. features/mechant/Conversations/ui/FeedbackDialog.tsx 🟢 LOW
90. features/mechant/Conversations/ui/Header.tsx 🟢 LOW
91. features/mechant/channels/ui/ChannelCard.tsx 🟢 LOW
92. features/mechant/channels/ui/ChannelDetailsDialog.tsx 🟢 LOW
```

### 📊 Analytics & Charts (8 ملفات)
```
93. features/mechant/dashboard/ui/ChannelsPieChart.tsx 🟢 LOW
94. features/mechant/dashboard/ui/ChecklistPanel.tsx 🟢 LOW
95. features/mechant/dashboard/ui/DashboardAdvice.tsx 🟢 LOW
96. features/mechant/dashboard/ui/KeywordsChart.tsx 🟢 LOW
97. features/mechant/dashboard/ui/MessagesTimelineChart.tsx 🟢 LOW
98. features/mechant/dashboard/ui/ProductsChart.tsx 🟢 LOW
99. features/landing/sections/KaleemLogoAnimated.tsx 🟢 LOW
100. features/landing/sections/KaleemLogoGsap.tsx 🟢 LOW
```

### 🔧 UI Utilities & Dialogs (24 ملف)
```
101. features/mechant/categories/ui/AddCategoryDialog.tsx 🟢 LOW
102. features/mechant/categories/ui/CategoryTree.tsx 🟢 LOW
103. features/mechant/categories/ui/DeleteCategoryDialog.tsx 🟢 LOW
104. features/mechant/categories/ui/EditCategoryDialog.tsx 🟢 LOW
105. features/mechant/channels/ui/TelegramConnectDialog.tsx 🟢 LOW
106. features/mechant/channels/ui/WebchatConnectDialog.tsx 🟢 LOW
107. features/mechant/channels/ui/WhatsappApiConnectDialog.tsx 🟢 LOW
108. features/mechant/channels/ui/WhatsappQrConnect.tsx 🟢 LOW
109. features/mechant/knowledge/ui/DocsTab.tsx 🟢 LOW
110. features/mechant/knowledge/ui/FaqsTab.tsx 🟢 LOW
111. features/mechant/knowledge/ui/LinksTab.tsx 🟢 LOW
112. features/mechant/leads/ui/EnabledToggleCard.tsx 🟢 LOW
113. features/mechant/leads/ui/FieldsEditor.tsx 🟢 LOW
114. features/mechant/leads/ui/LeadsTable.tsx 🟢 LOW
115. features/mechant/merchant-settings/ui/AddressForm.tsx 🟢 LOW
116. features/mechant/merchant-settings/ui/GeneralInfoForm.tsx 🟢 LOW
117. features/mechant/merchant-settings/ui/LogoUploader.tsx 🟢 LOW
118. features/mechant/merchant-settings/ui/PoliciesForm.tsx 🟢 LOW
119. features/mechant/merchant-settings/ui/SocialLinksEditor.tsx 🟢 LOW
120. features/mechant/merchant-settings/ui/SocialLinksSection.tsx 🟢 LOW
121. features/mechant/merchant-settings/ui/WorkingHoursForm.tsx 🟢 LOW
122. features/mechant/MissingResponses/ui/AddToKnowledgeDialog.tsx 🟢 LOW
123. features/mechant/products/ui/AttributesEditor.tsx 🟢 LOW
124. features/mechant/products/ui/EditProductDialog.tsx 🟢 LOW
```

### 🎨 Advanced UI Components (10 ملفات)
```
125. features/mechant/products/ui/OfferEditor.tsx 🟢 LOW
126. features/mechant/products/ui/ProductsActions.tsx 🟢 LOW
127. features/mechant/prompt-studio/ui/AdvancedTemplatePane.tsx 🟢 LOW
128. features/mechant/prompt-studio/ui/ChatSimulator.tsx 🟢 LOW
129. features/mechant/prompt-studio/ui/LivePreviewPane.tsx 🟢 LOW
130. features/mechant/prompt-studio/ui/PromptToolbar.tsx 🟢 LOW
131. features/mechant/prompt-studio/ui/QuickSetupPane.tsx 🟢 LOW
132. features/mechant/storefront-theme/ui/ButtonStyleSelect.tsx 🟢 LOW
133. features/mechant/storefront-theme/ui/ColorPickerField.tsx 🟢 LOW
134. features/mechant/storefront-theme/ui/SlugLinkField.tsx 🟢 LOW
```

---

## 📊 ملخص إحصائي

### 🎯 توزيع الأولويات
- **🔴 عالية (Critical):** 25 ملف (18.7%)
- **🟡 متوسطة (Important):** 54 ملف (40.3%)
- **🟢 منخفضة (Low):** 55 ملف (41.0%)

### ✅ الحالة الحالية
- **مكتمل:** 19 ملف (14.2%)
- **محتاج تحسين:** 1 ملف (0.7%)
- **مطلوب:** 134 ملف (85.1%)

### 🎯 خطة التنفيذ
- **المرحلة 1 (أسبوعين):** 25 ملف عالي الأولوية
- **المرحلة 2 (شهر):** 54 ملف متوسط الأولوية  
- **المرحلة 3 (شهر):** 55 ملف منخفض الأولوية

---

## 🚀 التوصيات الفورية

### 🔥 ابدأ الآن بهذه الملفات (أول 5 ملفات):
1. **app/routes/PrivateRoute.tsx** - أمان حرج
2. **app/routes/RoleRoute.tsx** - أمان حرج
3. **context/AuthContext.tsx** - نظام المصادقة
4. **pages/auth/LoginPage.tsx** - تسجيل الدخول
5. **app/App.tsx** - التطبيق الرئيسي

### 📈 النتائج المتوقعة بعد المرحلة الأولى:
- **معدل التغطية:** من 12.4% إلى 40%+
- **الملفات الحرجة:** 100% مغطاة
- **الثقة في الأمان:** عالية جداً

---

*آخر تحديث: تم إنشاء هذه المصفوفة بواسطة فريق التطوير - Kleem Frontend Team*
