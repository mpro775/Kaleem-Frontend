sequenceDiagram
autonumber
participant UI as Frontend (Dashboard)
participant API as Backend API (NestJS)
participant Auth as AuthService
participant UserM as UserModel (Mongo)
participant MerchSvc as MerchantsService
participant MerchantM as MerchantModel (Mongo)
participant N8nSvc as N8nWorkflowService
participant N8n as n8n Public API
participant Mail as MailService
participant JWT as JWT Signer

    UI->>API: POST /api/auth/register {name,email,password}
    API->>Auth: validate(RegisterDto) + business checks
    Auth->>UserM: create User (hash password)
    Auth->>UserM: set emailVerificationCode + expiresAt

    Auth->>MerchSvc: create(CreateMerchantDto with userId)
    MerchSvc->>MerchantM: save Merchant (defaults/quickConfig/subscription)

    MerchSvc->>N8nSvc: createForMerchant(merchantId)
    N8nSvc->>N8n: POST /workflows (payload sanitized)
    N8n-->>N8nSvc: 201 { id: workflowId }
    N8nSvc->>N8n: POST /workflows/:id/activate
    N8n-->>N8nSvc: 200 OK
    N8nSvc->>MerchantM: update { workflowId }

    MerchSvc->>MerchantM: build & save finalPromptTemplate
    MerchSvc->>MerchantM: (optional) set channels if provided
    MerchSvc->>Storefront: create default storefront (slug/colors)
    MerchSvc-->>Auth: Merchant

    Auth->>UserM: set user.merchantId = merchant._id
    Auth->>Mail: sendVerificationEmail(email, code) (async)
    Auth->>JWT: sign({ userId, role, merchantId })
    Auth-->>UI: 200 { accessToken, user }

    Note over UI,API: المستخدم انتقل الآن لخطوة التفعيل

    UI->>API: POST /api/auth/verify-email { email, code }
    API->>Auth: verify code & expiry
    Auth->>UserM: set emailVerified=true, clear code, firstLogin=false
    Auth-->>UI: 204/200 OK

    Note over UI,API: استكمال الأونبوردنغ والداشبورد

    UI->>API: PATCH /api/merchants/:id/onboarding/basic
    API->>MerchSvc: saveBasicInfo(...)
    MerchSvc->>MerchantM: update fields + rebuild finalPromptTemplate
    MerchSvc-->>UI: 200 Merchant

    UI->>API: PATCH /api/merchants/:id/product-source { internal }
    API->>MerchSvc: setProductSource('internal')
    MerchSvc->>MerchantM: update productSource & config
    MerchSvc-->>UI: 200 Merchant

    UI->>API: GET /api/analytics/* + /merchants/:id/checklist
    API-->>UI: stats + checklist

    alt فشل إنشاء n8n (شبكة/صلاحيات/Schema)
      N8nSvc-->>MerchSvc: throw or warn (حسب الإعداد)
      note right of MerchSvc: موصى به: لا تفشل التسجيل<br/>وسجل retry لاحق
    end
