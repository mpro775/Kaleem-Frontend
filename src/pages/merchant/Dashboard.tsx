// src/pages/dashboard/Dashboard.tsx
import { useState, useMemo, type JSX } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import InsightsIcon from "@mui/icons-material/Insights";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { ChecklistGroup } from "@/types/analytics";
import ChecklistPanel from "@/widgets/merchant/dashboard/ChecklistPanel";
import DashboardAdvice from "@/widgets/merchant/dashboard/DashboardAdvice";
import ProductsChart from "@/widgets/merchant/dashboard/ProductsChart";
import KeywordsChart from "@/widgets/merchant/dashboard/KeywordsChart";
import ChannelsPieChart from "@/widgets/merchant/dashboard/ChannelsPieChart";
import MessagesTimelineChart from "@/widgets/merchant/dashboard/MessagesTimelineChart";
import { useAuth } from "@/context/AuthContext";
import {
  useChecklist,
  useMessagesTimeline,
  useOverview,
  useProductsCount,
  useSkipChecklist,
} from "@/features/mechant/analytics/model";
import type { AxiosError } from "axios";
import { useStoreServicesFlag } from "@/hooks/useStoreServicesFlag";
import { useNavigate } from "react-router-dom";

type Period = "week" | "month" | "quarter";

function KpiCard({
  title,
  value,
  subtitle,
  highlight,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  highlight?: "pos" | "neg";
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
      {subtitle && (
        <Typography
          variant="caption"
          color={
            highlight === "pos"
              ? "success.main"
              : highlight === "neg"
              ? "error.main"
              : "text.secondary"
          }
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));
  const chartH = useMemo(() => (isSm ? 220 : isMd ? 300 : 360), [isSm, isMd]);
  const [timeRange, setTimeRange] = useState<Period>("week");
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const merchantId = user?.merchantId;
  const hasStore = useStoreServicesFlag();
  const navigate = useNavigate();

  // Queries
  const {
    data: overview,
    isLoading: loadingOverview,
    error: errorOverview,
    refetch,
  } = useOverview(timeRange);

  const {
    data: checklist,
    isLoading: loadingChecklist,
    error: errorChecklist,
  } = useChecklist(merchantId ?? undefined);

  const { data: timeline, isLoading: loadingTimeline } = useMessagesTimeline(
    timeRange,
    "day"
  );

  const { data: productsCountFallback } = useProductsCount();
  const { mutateAsync: skipItem, isPending: skipping } = useSkipChecklist(
    merchantId ?? undefined
  );

  // حالات عامة
  const loading = loadingOverview || loadingChecklist || loadingTimeline;
  const error =
    (errorOverview as AxiosError)?.message ||
    (errorChecklist as AxiosError)?.message ||
    null;

  // اشتقاقات نظيفة
  const sessionsCount = overview?.sessions?.count ?? 0;
  const sessionsDelta = overview?.sessions?.changePercent ?? 0;

  const messagesCount = overview?.messages ?? 0;
  const productsCount = overview?.productsCount ?? productsCountFallback ?? 0;

  const topProducts = Array.isArray(overview?.topProducts)
    ? overview!.topProducts.map((p: { name: string; count: number }) => ({
        name: p.name,
        value: p.count,
      }))
    : [];

  const keywords = Array.isArray(overview?.topKeywords)
    ? overview!.topKeywords.map((kw: { keyword: string; count: number }) => ({
        keyword: kw.keyword,
        count: kw.count,
      }))
    : [];

  const channelUsage = Array.isArray(overview?.channels?.breakdown)
    ? overview!.channels.breakdown.map(
        (c: { channel: string; count: number }) => ({
          channel: c.channel,
          count: c.count,
        })
      )
    : [];

  // الإضافات (تعمل حتى لو الباك-إند ما رجّعها – تبقى undefined)
  const csat = overview?.csat; // 0..1
  const frt = overview?.firstResponseTimeSec;
  const missingOpen = overview?.missingOpen ?? 0;
  const revenue = overview?.orders?.totalSales ?? 0;
  const paidOrders = overview?.storeExtras?.paidOrders ?? 0;
  const aov = overview?.storeExtras?.aov ?? null;

  const kpiCards = useMemo(() => {
    const arr: JSX.Element[] = [];

    arr.push(
      <KpiCard
        key="sessions"
        title="المحادثات"
        value={sessionsCount}
        subtitle={`${sessionsDelta >= 0 ? "▲" : "▼"} ${Math.abs(
          sessionsDelta
        ).toFixed(0)}%`}
        highlight={sessionsDelta >= 0 ? "pos" : "neg"}
      />
    );

    arr.push(<KpiCard key="messages" title="الرسائل" value={messagesCount} />);

    if (typeof csat === "number") {
      arr.push(
        <KpiCard
          key="csat"
          title="رضا العملاء (CSAT)"
          value={`${Math.round(csat * 100)}%`}
        />
      );
    }

    if (typeof frt === "number") {
      arr.push(
        <KpiCard
          key="frt"
          title="زمن أول رد"
          value={`${frt}s`}
          subtitle="متوسط"
        />
      );
    }

    arr.push(
      <KpiCard
        key="missing"
        title="إجابات مفقودة (مفتوحة)"
        value={missingOpen}
      />
    );

    if (hasStore) {
      arr.push(
        <KpiCard
          key="revenue"
          title="إيراد الفترة"
          value={`${revenue.toLocaleString()}`}
          subtitle={
            aov
              ? `AOV: ${Number(aov).toLocaleString()} | مدفوعة: ${paidOrders}`
              : undefined
          }
        />
      );
    } else {
      arr.push(
        <KpiCard key="products" title="عدد المنتجات" value={productsCount} />
      );
    }

    return arr;
  }, [
    sessionsCount,
    sessionsDelta,
    messagesCount,
    csat,
    frt,
    missingOpen,
    hasStore,
    revenue,
    aov,
    paidOrders,
    productsCount,
  ]);

  const handleSkip = async (itemKey: string) => {
    try {
      await skipItem(itemKey);
    } catch {
      /* TODO: Toast */
    }
  };

  return (
    <Box
      sx={{ p: { xs: 1.5, md: 3 }, background: "#f9fafb", minHeight: "100vh" }}
    >
      {/* حالات */}
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {String(error) || "حدث خطأ أثناء جلب البيانات."}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {/* رأس بسيط بدل DashboardHeader (أخف على الموبايل) */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: isSm ? "column" : "row",
              alignItems: isSm ? "stretch" : "center",
              gap: isSm ? 1 : 2,
              flexWrap: "wrap",
              justifyContent: "space-between",
              minWidth: 0,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ minWidth: 0 }}
            >
              <Typography variant="h6" fontWeight={800}>
                نظرة عامة
              </Typography>
              <Chip
                size="small"
                label={
                  timeRange === "week"
                    ? "آخر أسبوع"
                    : timeRange === "month"
                    ? "آخر شهر"
                    : "آخر ربع"
                }
              />
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", minWidth: 0 }}
            >
              <Tabs
                value={["week", "month", "quarter"].indexOf(timeRange)}
                onChange={(_, v) =>
                  setTimeRange(["week", "month", "quarter"][v] as Period)
                }
                variant={isSm ? "scrollable" : "standard"}
                scrollButtons={isSm ? "auto" : false}
                sx={{
                  ".MuiTabs-flexContainer": { gap: 0.5 },
                  minHeight: 36,
                  "& .MuiTab-root": { minHeight: 36 },
                }}
              >
                <Tab label="أسبوع" />
                <Tab label="شهر" />
                <Tab label="ربع" />
              </Tabs>
              <IconButton onClick={() => refetch()} aria-label="تحديث">
                <RefreshIcon />
              </IconButton>
              <Button
                onClick={() => navigate("/dashboard/analytics")}
                variant={isSm ? "outlined" : "contained"}
                size={isSm ? "small" : "medium"}
                fullWidth={isSm}
                startIcon={isSm ? undefined : <InsightsIcon />}
              >
                {isSm ? "الإحصائيات" : "عرض الإحصائيات المتقدمة"}
              </Button>
            </Stack>
          </Paper>

          {/* Checklist أعلى، لكن مطوي على الموبايل داخل Paper */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1, md: 2 },
              mb: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <ChecklistPanel
              checklist={(checklist as ChecklistGroup[]) ?? []}
              onSkip={handleSkip}
              loading={skipping}
              // إن كان لديك prop لتصغير العرض في الموبايل يمكن تمريره هنا
            />
          </Paper>

          {/* KPI GRID — ريسبونсив */}
          <Grid container spacing={isSm ? 1 : 2} sx={{ flexGrow: 1 }}>
            {kpiCards.map((card, i) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                sx={{ minWidth: 0 }}
                key={i}
              >
                {card}
              </Grid>
            ))}
          </Grid>

          {/* الخط الزمني للرسائل */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              نشاط الرسائل
            </Typography>
            <Box sx={{ height: chartH, minWidth: 0 }}>
              <MessagesTimelineChart data={timeline ?? []} />
            </Box>{" "}
          </Paper>

          {/* تبويبات التحليلات السريعة */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1, md: 2 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_e, v) => setActiveTab(v)}
              variant={isSm ? "scrollable" : "standard"}
              scrollButtons={isSm ? "auto" : false}
              sx={{ mb: 2 }}
            >
              <Tab label="المنتجات" />
              <Tab label="الكلمات المفتاحية" />
              <Tab label="القنوات" />
            </Tabs>

            <Button
              size="small"
              variant="text"
              sx={{ mt: 1 }}
              onClick={() =>
                navigate(
                  `/dashboard/analytics?tab=${
                    activeTab === 0 ? 3 : activeTab === 1 ? 4 : 2
                  }`
                )
              }
            >
              فتح في صفحة الإحصائيات ↗
            </Button>

            {activeTab === 0 && (
              <Box sx={{ height: chartH, minWidth: 0 }}>
                <ProductsChart products={topProducts} />
              </Box>
            )}
            {activeTab === 1 && (
              <Box sx={{ height: chartH, minWidth: 0 }}>
                {" "}
                <KeywordsChart keywords={keywords} />
              </Box>
            )}
            {activeTab === 2 && (
              <Box sx={{ height: chartH, minWidth: 0 }}>
                {" "}
                <ChannelsPieChart channelUsage={channelUsage} />
              </Box>
            )}
          </Paper>

          <Divider sx={{ my: 3 }} />

          <DashboardAdvice />
        </>
      )}
    </Box>
  );
}
