import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Grid,
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
import axios from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useStoreServicesFlag } from "@/hooks/useStoreServicesFlag";

// رسومات موجودة لديك مسبقًا:
import MessagesTimelineChart from "@/widgets/merchant/dashboard/MessagesTimelineChart";
import ProductsChart from "@/widgets/merchant/dashboard/ProductsChart";
import KeywordsChart from "@/widgets/merchant/dashboard/KeywordsChart";
import ChannelsPieChart from "@/widgets/merchant/dashboard/ChannelsPieChart";
import { useLocation } from "react-router-dom";

// Recharts لمخطط جودة الذكاء (مفقود/مُعالج)
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Period = "week" | "month" | "quarter";
type GroupBy = "day" | "hour";
type Channel = "all" | "whatsapp" | "telegram" | "webchat";

type Overview = {
  sessions: { count: number; changePercent: number };
  messages: number;
  topKeywords: { keyword: string; count: number }[];
  topProducts: { productId: string; name: string; count: number }[];
  channels: { total: number; breakdown: { channel: string; count: number }[] };
  orders: {
    count: number;
    changePercent: number;
    byStatus: Record<string, number>;
    totalSales: number;
  };
  // قد تكون موجودة حسب التعديلات السابقة:
  csat?: number; // 0..1
  firstResponseTimeSec?: number | null;
  missingOpen?: number;
  storeExtras?: { paidOrders: number; aov: number | null };
};

type TimelineItem = { _id: string; count: number };

// ==== أدوات مساعدة
const periodToDays: Record<Period, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

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

// ==== استدعاءات API بسيطة (بدون React Query لتبسيط اللصق)
async function apiOverview(period: Period) {
  const { data } = await axios.get<Overview>("/analytics/overview", {
    params: { period },
  });
  return data;
}
async function apiMessagesTimeline(period: Period, groupBy: GroupBy = "day") {
  const { data } = await axios.get<TimelineItem[]>(
    "/analytics/messages-timeline",
    { params: { period, groupBy } }
  );
  return data;
}
async function apiTopProducts(period: Period, limit = 8) {
  const { data } = await axios.get<
    { productId: string; name: string; count: number }[]
  >("/analytics/top-products", { params: { period, limit } });
  return data.map((p) => ({ name: p.name, value: p.count }));
}
async function apiTopKeywords(period: Period, limit = 10) {
  const { data } = await axios.get<{ keyword: string; count: number }[]>(
    "/analytics/top-keywords",
    { params: { period, limit } }
  );
  return data.map((k) => ({ keyword: k.keyword, count: k.count }));
}
async function apiMissingStats(days: number) {
  const { data } = await axios.get<
    {
      _id: string;
      channels: { channel: string; count: number; resolved: boolean }[];
      total: number;
    }[]
  >("/analytics/missing-responses/stats", { params: { days } });
  // نعيد شكل بسيط: لكل يوم => { day, unresolved, resolved }
  return (data || []).map(
    (d: {
      _id: string;
      channels: { channel: string; count: number; resolved: boolean }[];
      total: number;
    }) => {
      const day = d._id;
      let res = 0,
        unres = 0;
      for (const ch of d.channels || []) {
        if (ch.resolved) res += ch.count;
        else unres += ch.count;
      }
      return { day, resolved: res, unresolved: unres, total: d.total };
    }
  );
}
async function apiMissingUnresolvedList(params: {
  page?: number;
  limit?: number;
  channel?: Channel;
}) {
  const { page = 1, limit = 10, channel = "all" } = params;
  const { data } = await axios.get("/analytics/missing-responses", {
    params: { page, limit, resolved: "false", channel },
  });
  return data as {
    items: {
      _id: string;
      question: string;
      channel: string;
      createdAt: string;
    }[];
    total: number;
  };
}
async function apiFaqList(merchantId: string) {
  const { data } = await axios.get(`/merchants/${merchantId}/faqs`);
  return data as { _id: string; question: string; answer: string }[];
}

// ==== الصفحة الرئيسية للإحصائيات
export default function AnalyticsPage() {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();
  const merchantId = user?.merchantId || "";
  const location = useLocation();
  useEffect(() => {
    const t = new URLSearchParams(location.search).get("tab");
    if (t !== null) {
      const idx = Number(t);
      if (!Number.isNaN(idx)) setTab(idx);
    }
  }, [location.search]);
  const [tab, setTab] = useState(0);
  const [period, setPeriod] = useState<Period>("week");
  const [channel, setChannel] = useState<Channel>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // بيانات عامة نعيد استخدامها عبر التبويبات:
  const [overview, setOverview] = useState<Overview | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [topProducts, setTopProducts] = useState<
    { name: string; value: number }[]
  >([]);
  const [topKeywords, setTopKeywords] = useState<
    { keyword: string; count: number }[]
  >([]);

  // جودة الذكاء
  const [missingSeries, setMissingSeries] = useState<
    { day: string; resolved: number; unresolved: number; total: number }[]
  >([]);
  const [missingList, setMissingList] = useState<
    { _id: string; question: string; channel: string; createdAt: string }[]
  >([]);

  // المعرفة
  const [faqs, setFaqs] = useState<
    { _id: string; question: string; answer: string }[]
  >([]);

  const hasStore = useStoreServicesFlag();

  // تحميل البيانات عند تغيير الفترة/القناة (نحمّل ما يلزم لكل التبويبات)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [ov, tl, prods, kws, ms, ml, fq] = await Promise.all([
          apiOverview(period),
          apiMessagesTimeline(period, "day"),
          apiTopProducts(period, 8),
          apiTopKeywords(period, 10),
          apiMissingStats(periodToDays[period]),
          apiMissingUnresolvedList({ page: 1, limit: 10, channel }),
          merchantId
            ? apiFaqList(merchantId)
            : Promise.resolve(
                [] as { _id: string; question: string; answer: string }[]
              ),
        ]);

        if (!mounted) return;
        setOverview(ov);
        setTimeline(tl);
        setTopProducts(prods);
        setTopKeywords(kws);
        setMissingSeries(ms);
        setMissingList(ml.items || []);
        setFaqs(fq as { _id: string; question: string; answer: string }[]);
      } catch (e: unknown) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "حدث خطأ أثناء جلب البيانات.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [period, channel, merchantId]);

  const channelBreakdown = overview?.channels?.breakdown || [];
  const ordersByStatus = overview?.orders?.byStatus || {};

  // ===== تبويب: المحادثات
  const ConversationsTab = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4, lg: 3 }}>
        <Stack spacing={2}>
          <Kpi
            title="عدد المحادثات"
            value={overview?.sessions?.count ?? 0}
            sub={`التغير: ${
              (overview?.sessions?.changePercent ?? 0) >= 0 ? "▲" : "▼"
            }${Math.abs(overview?.sessions?.changePercent ?? 0)}%`}
          />
          <Kpi title="الرسائل" value={overview?.messages ?? 0} />
          {typeof overview?.firstResponseTimeSec === "number" && (
            <Kpi
              title="زمن أول رد"
              value={`${overview.firstResponseTimeSec}s`}
              sub="متوسط"
            />
          )}
          {typeof overview?.csat === "number" && (
            <Kpi
              title="رضا العملاء (CSAT)"
              value={`${Math.round(overview.csat * 100)}%`}
            />
          )}
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 8, lg: 9 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            flexDirection: isSm ? "column" : "row",
            alignItems: isSm ? "stretch" : "center",
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            الخط الزمني للمراسلات
          </Typography>
          <Box sx={{ height: isSm ? 220 : isMd ? 300 : 360 }}>
  <MessagesTimelineChart data={timeline ?? []} />
</Box>
        </Paper>
      </Grid>
    </Grid>
  );

  // ===== تبويب: جودة الذكاء
  const AiQualityTab = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            الإجابات المفقودة — يوميًا
          </Typography>
          <Box sx={{ width: "100%", height: { xs: 240, md: 320 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={missingSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="unresolved"
                  stackId="1"
                  name="غير مُعالج"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="1"
                  name="مُعالج"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={2}>
          {typeof overview?.csat === "number" && (
            <Kpi
              title="CSAT الفترة"
              value={`${Math.round(overview.csat * 100)}%`}
            />
          )}
          <Kpi title="مفقود (مفتوح الآن)" value={overview?.missingOpen ?? 0} />
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
              {missingList.slice(0, 10).map((m) => (
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
              {missingList.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  لا توجد عناصر غير مُعالجة.
                </Typography>
              )}
              <Button
                variant="outlined"
                href="/dashboard/missing-responses"
                sx={{ mt: 1 }}
              >
                إدارة الإجابات المفقودة
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );

  // ===== تبويب: القنوات
  const ChannelsTab = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            توزيع القنوات
          </Typography>
          <ChannelsPieChart
            channelUsage={channelBreakdown.map((c) => ({
              channel: c.channel,
              count: c.count,
            }))}
          />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
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

  // ===== تبويب: المتجر
  const StoreTab = (
    <Grid container spacing={2}>
      {!hasStore ? (
        <Grid size={{ xs: 12 }}>
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
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <Kpi
                title="الإيراد (الفترة)"
                value={(overview?.orders?.totalSales ?? 0).toLocaleString()}
              />
              <Kpi title="الطلبات" value={overview?.orders?.count ?? 0} />
              {overview?.storeExtras?.aov != null && (
                <Kpi
                  title="AOV"
                  value={Number(overview.storeExtras.aov).toLocaleString()}
                  sub={`مدفوعة: ${overview.storeExtras.paidOrders ?? 0}`}
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
      <Chip key={status} size="small" variant="outlined" label={`${status}: ${cnt}`} />
    ))}
  </Stack>
</Paper>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                أفضل المنتجات
              </Typography>
              <ProductsChart products={topProducts} />
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );

  // ===== تبويب: المعرفة
  const KnowledgeTab = (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={2}>
          <Kpi title="عدد الأسئلة الشائعة (FAQ)" value={faqs.length} />
          <Kpi
            title="إجابات مفقودة (مفتوحة)"
            value={overview?.missingOpen ?? 0}
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
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            الكلمات المفتاحية الأعلى استخدامًا
          </Typography>
          <KeywordsChart keywords={topKeywords} />
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box
      sx={{ p: { xs: 1.5, md: 3 }, background: "#f9fafb", minHeight: "100vh" }}
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
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {/* شريط الفلاتر العلوي */}
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
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={800}>
                الإحصائيات
              </Typography>
              <Chip
                size="small"
                label={
                  period === "week"
                    ? "آخر أسبوع"
                    : period === "month"
                    ? "آخر شهر"
                    : "آخر ربع"
                }
              />
            </Stack>

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="period-label">الفترة</InputLabel>
                <Select
                  labelId="period-label"
                  value={period}
                  label="الفترة"
                  onChange={(e) => setPeriod(e.target.value as Period)}
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
                  onChange={(e) => setChannel(e.target.value as Channel)}
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
            }}
          >
            <Tabs
              value={tab}
              onChange={(_e, v) => setTab(v)}
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
