// src/pages/dashboard/AnalyticsPage.tsx
import { Suspense, lazy, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Tabs,
  Tab,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useStoreServicesFlag } from "@/shared/hooks/useStoreServicesFlag";
import type { TimelinePoint } from "@/features/mechant/dashboard/type";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend as RLegend,
} from "recharts";
import {
  useOverview,
  useMessagesTimeline,
} from "@/features/mechant/analytics/model";
import {
  useTopProducts,
  useTopKeywords,
  useMissingStats,
  useMissingList,
  useFaqs,
} from "@/features/mechant/analytics/hooks.extra";
import type { Period } from "@/features/mechant/analytics/api";
import type { Channel } from "@/features/mechant/analytics/api.extra";

// تحميل كسول للمخططات الثقيلة (تأكد أن كل مكوّن لديه default export)
const MessagesTimelineChart = lazy(
  () => import("@/features/mechant/dashboard/ui/MessagesTimelineChart")
);
const ProductsChart = lazy(
  () => import("@/features/mechant/dashboard/ui/ProductsChart")
);
const KeywordsChart = lazy(
  () => import("@/features/mechant/dashboard/ui/KeywordsChart")
);
const ChannelsPieChart = lazy(
  () => import("@/features/mechant/dashboard/ui/ChannelsPieChart")
);

// مساعدات
const periodLabel = (p: Period) =>
  p === "week" ? "آخر أسبوع" : p === "month" ? "آخر شهر" : "آخر ربع";

function Kpi({
  title,
  value,
  sub,
}: {
  title: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        minWidth: 0,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={800} sx={{ my: 0.5 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

export default function AnalyticsPage() {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));
  const chartH = isSm ? 220 : isMd ? 300 : 360;

  const { user } = useAuth();
  const merchantId = user?.merchantId || "";
  const hasStore = useStoreServicesFlag();

  const [sp, setSp] = useSearchParams();
  const [tab, setTab] = useState(() => {
    const t = Number(sp.get("tab"));
    return Number.isFinite(t) ? Math.max(0, Math.min(4, t)) : 0;
  });
  const [period, setPeriod] = useState<Period>(
    (sp.get("period") as Period) || "week"
  );
  const [channel, setChannel] = useState<Channel>(
    (sp.get("channel") as Channel) || "all"
  );

  // مزامنة URL
  const syncUrl = (t = tab, p = period, c = channel) => {
    const next = new URLSearchParams(sp);
    next.set("tab", String(t));
    next.set("period", p);
    next.set("channel", c);
    setSp(next, { replace: true });
  };

  // البيانات
  const ovQ = useOverview(period);
  const tlQ = useMessagesTimeline(period, "day");
  const topProductsQ = useTopProducts(period, tab === 3 && hasStore);
  const topKeywordsQ = useTopKeywords(period, tab === 4);
  const missingStatsQ = useMissingStats(period, tab === 1);
  const missingListQ = useMissingList(period, channel, tab === 1);
  const faqsQ = useFaqs(merchantId, tab === 4);

  const tlData = (tlQ.data ?? []) as TimelinePoint[];

  const loading =
    ovQ.isLoading ||
    tlQ.isLoading ||
    (tab === 3 && topProductsQ.isLoading) ||
    (tab === 4 && topKeywordsQ.isLoading) ||
    (tab === 1 && (missingStatsQ.isLoading || missingListQ.isLoading)) ||
    (tab === 4 && faqsQ.isLoading);

  const error =
    ovQ.error ||
    tlQ.error ||
    topProductsQ.error ||
    topKeywordsQ.error ||
    missingStatsQ.error ||
    missingListQ.error ||
    faqsQ.error;

  // تصدير CSV لغير المُعالجة
  const exportMissingCsv = () => {
    const list = missingListQ.data?.items ?? [];
    const header = "question,channel,createdAt\n";
    const rows = list
      .map((m) =>
        [
          JSON.stringify(m.question || ""),
          m.channel,
          new Date(m.createdAt).toISOString(),
        ].join(",")
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `missing-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const channelBreakdown = ovQ.data?.channels?.breakdown || [];
  const ordersByStatus: Record<string, number> =
    (ovQ.data?.orders as any)?.byStatus ?? {};

  // التبويب: المحادثات
  const ConversationsTab = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4, lg: 3 }} sx={{ minWidth: 0 }}>
        <Stack spacing={2}>
          <Kpi
            title="عدد المحادثات"
            value={ovQ.data?.sessions?.count ?? 0}
            sub={`التغير: ${
              (ovQ.data?.sessions?.changePercent ?? 0) >= 0 ? "▲" : "▼"
            }${Math.abs(ovQ.data?.sessions?.changePercent ?? 0)}%`}
          />
          <Kpi title="الرسائل" value={ovQ.data?.messages ?? 0} />
          {typeof ovQ.data?.firstResponseTimeSec === "number" && (
            <Kpi
              title="زمن أول رد"
              value={`${ovQ.data.firstResponseTimeSec}s`}
              sub="متوسط"
            />
          )}
          {typeof ovQ.data?.csat === "number" && (
            <Kpi
              title="رضا العملاء (CSAT)"
              value={`${Math.round(ovQ.data.csat * 100)}%`}
            />
          )}
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 8, lg: 9 }} sx={{ minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
            minWidth: 0,
            minHeight: 0,
            overflow:'auto'
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            الخط الزمني للمراسلات
          </Typography>

          <Box sx={{ width: "100%", height: chartH, minWidth: 0 }}>
            <Suspense
              fallback={
                <Box
                  sx={{ height: "100%", display: "grid", placeItems: "center" }}
                >
                  <CircularProgress size={28} />
                </Box>
              }
            >
              {/* مكوّن الرسم نفسه يتكفّل بـ ResponsiveContainer؛ فقط نضمن مساحة كافية هنا */}
              <MessagesTimelineChart data={tlData} />
            </Suspense>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  // التبويب: جودة الذكاء
  const AiQualityTab = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
            minWidth: 0,
            minHeight: 0,
            overflow:'auto'

          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            الإجابات المفقودة — يوميًا
          </Typography>

          <Box sx={{ width: "100%", height: { xs: 240, md: 320 }, minWidth: 0 }}>
            <Box dir="ltr" sx={{ width: "100%", height: "100%", minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={missingStatsQ.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <RTooltip />
                  <RLegend />
                  <Area
                    type="monotone"
                    dataKey="unresolved"
                    stackId="1"
                    name="غير مُعالج"
                    isAnimationActive={false}
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stackId="1"
                    name="مُعالج"
                    isAnimationActive={false}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
        <Stack spacing={2}>
          {typeof ovQ.data?.csat === "number" && (
            <Kpi
              title="CSAT الفترة"
              value={`${Math.round(ovQ.data.csat * 100)}%`}
            />
          )}
          <Kpi title="مفقود (مفتوح الآن)" value={ovQ.data?.missingOpen ?? 0} />

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              أحدث 10 أسئلة غير مُعالجة
            </Typography>

            <Stack spacing={1}>
              {(missingListQ.data?.items ?? []).slice(0, 10).map((m) => (
                <Box
                  key={m._id}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: "background.default",
                    border: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {m.question}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" label={m.channel} />
                    <Chip
                      size="small"
                      label={new Date(m.createdAt).toLocaleString()}
                    />
                  </Stack>
                </Box>
              ))}

              {(missingListQ.data?.items ?? []).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  لا توجد عناصر غير مُعالجة.
                </Typography>
              )}

              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button variant="outlined" href="/dashboard/missing-responses">
                  إدارة الإجابات المفقودة
                </Button>
                <Button variant="text" onClick={exportMissingCsv}>
                  تصدير CSV
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );

  // التبويب: القنوات
  const ChannelsTab = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 5 }} sx={{ minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
            minWidth: 0,
            minHeight: 0,
            overflow:'auto'

          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            توزيع القنوات
          </Typography>

          {/* نوفر ارتفاعًا صريحًا للغلاف؛ المكوّن الداخلي يعتمد 100% */}
          <Box sx={{ width: "100%", height: 240, minWidth: 0 }}>
            <Suspense
              fallback={
                <Box
                  sx={{ height: "100%", display: "grid", placeItems: "center" }}
                >
                  <CircularProgress size={24} />
                </Box>
              }
            >
              <ChannelsPieChart
                channelUsage={channelBreakdown.map((c) => ({
                  channel: c.channel,
                  count: c.count,
                }))}
              />
            </Suspense>
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }} sx={{ minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            تفاصيل القنوات
          </Typography>
          <Stack spacing={1}>
            {channelBreakdown.map((c) => (
              <Stack
                key={c.channel}
                direction="row"
                justifyContent="space-between"
                sx={{
                  p: 1,
                  borderRadius: 1,
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography>{c.channel}</Typography>
                <Chip size="small" label={c.count} />
              </Stack>
            ))}
            {channelBreakdown.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                لا توجد قنوات مفعّلة.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );

  // التبويب: المتجر
  const StoreTab = (
    <Grid container spacing={2}>
      {!hasStore ? (
        <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              متجر كليم غير مفعّل
            </Typography>
            <Typography variant="body2" color="text.secondary">
              فعّل ميزة المتجر لعرض الإيرادات، الطلبات، وأفضل المنتجات.
            </Typography>
          </Paper>
        </Grid>
      ) : (
        <>
          <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
            <Stack spacing={2}>
              <Kpi
                title="الإيراد (الفترة)"
                value={(ovQ.data?.orders?.totalSales ?? 0).toLocaleString()}
              />
              <Kpi
                title="الطلبات"
                value={(ovQ.data?.orders as any)?.count ?? 0}
              />
              {ovQ.data?.storeExtras?.aov != null && (
                <Kpi
                  title="AOV"
                  value={Number(ovQ.data.storeExtras.aov).toLocaleString()}
                  sub={`مدفوعة: ${ovQ.data.storeExtras.paidOrders ?? 0}`}
                />
              )}

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  حالة الطلبات
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {Object.entries(ordersByStatus).map(([status, cnt]) => (
                    <Chip
                      key={status}
                      size="small"
                      variant="outlined"
                      label={`${status}: ${cnt}`}
                    />
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                minWidth: 0,
                minHeight: 0,
                overflow:'auto'

              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                أفضل المنتجات
              </Typography>
              <Box sx={{ width: "100%", height: { xs: 220, md: 300 }, minWidth: 0 }}>
                <Suspense
                  fallback={
                    <Box
                      sx={{
                        height: "100%",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  }
                >
                  <ProductsChart products={topProductsQ.data ?? []} />
                </Suspense>
              </Box>
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );

  // التبويب: المعرفة
  const KnowledgeTab = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
        <Stack spacing={2}>
          <Kpi
            title="عدد الأسئلة الشائعة (FAQ)"
            value={faqsQ.data?.length ?? 0}
          />
          <Kpi
            title="إجابات مفقودة (مفتوحة)"
            value={ovQ.data?.missingOpen ?? 0}
          />
          <Button variant="outlined" href="/dashboard/instructions">
            إدارة التوجيهات
          </Button>
          <Button variant="outlined" href="/dashboard/missing-responses">
            إدارة الإجابات المفقودة
          </Button>
          <Button variant="outlined" href="/dashboard/documents">
            الموارد الإضافية
          </Button>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
            minWidth: 0,
            minHeight: 0,
            overflow:'auto'

          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            الكلمات المفتاحية الأعلى استخدامًا
          </Typography>
          <Box sx={{ width: "100%", height: { xs: 220, md: 300 }, minWidth: 0 }}>
            <Suspense
              fallback={
                <Box
                  sx={{ height: "100%", display: "grid", placeItems: "center" }}
                >
                  <CircularProgress size={24} />
                </Box>
              }
            >
              <KeywordsChart keywords={topKeywordsQ.data ?? []} />
            </Suspense>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 3 },
        background: "#f9fafb",
        minHeight: "100svh",
        pb: "env(safe-area-inset-bottom)",
      }}
    >
      {loading && (
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {(error as any)?.message || "حدث خطأ أثناء جلب البيانات."}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {/* الفلاتر */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "space-between",
              minWidth: 0,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ minWidth: 0 }}
            >
              <Typography variant="h6" fontWeight={800}>
                الإحصائيات
              </Typography>
              <Chip size="small" label={periodLabel(period)} />
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              flexWrap="wrap"
              sx={{ minWidth: 0 }}
            >
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="period-label">الفترة</InputLabel>
                <Select
                  labelId="period-label"
                  value={period}
                  label="الفترة"
                  onChange={(e) => {
                    const v = e.target.value as Period;
                    setPeriod(v);
                    syncUrl(tab, v, channel);
                  }}
                >
                  <MenuItem value="week">أسبوع</MenuItem>
                  <MenuItem value="month">شهر</MenuItem>
                  <MenuItem value="quarter">ربع</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="channel-label">القناة</InputLabel>
                <Select
                  labelId="channel-label"
                  value={channel}
                  label="القناة"
                  onChange={(e) => {
                    const v = e.target.value as Channel;
                    setChannel(v);
                    syncUrl(tab, period, v);
                  }}
                >
                  <MenuItem value="all">الكل</MenuItem>
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  <MenuItem value="telegram">Telegram</MenuItem>
                  <MenuItem value="webchat">Web Chat</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* التبويبات */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1, md: 2 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              mb: 2,
              minWidth: 0,
            }}
          >
            <Tabs
              value={tab}
              onChange={(_e, v) => {
                setTab(v);
                syncUrl(v, period, channel);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
            >
              <Tab label="المحادثات" />
              <Tab label="جودة الذكاء" />
              <Tab label="القنوات" />
              <Tab label="المتجر" />
              <Tab label="المعرفة" />
            </Tabs>

            {tab === 0 && ConversationsTab}
            {tab === 1 && AiQualityTab}
            {tab === 2 && ChannelsTab}
            {tab === 3 && StoreTab}
            {tab === 4 && KnowledgeTab}
          </Paper>

          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary">
            * تُحسب المقاييس بالفترة المحددة. بعض المؤشرات تعتمد على توفر ميزة
            المتجر والقنوات المفعّلة.
          </Typography>
        </>
      )}
    </Box>
  );
}
