import { useState } from "react";
import { Box, Tabs, Tab, CircularProgress, Alert } from "@mui/material";
import type { ChecklistGroup } from "@/types/analytics";
import ChecklistPanel from "@/widgets/merchant/dashboard/ChecklistPanel";
import DashboardHeader from "@/widgets/merchant/dashboard/DashboardHeader";
import MetricsCards from "@/widgets/merchant/dashboard/MetricsCards";
import ProductsChart from "@/widgets/merchant/dashboard/ProductsChart";
import KeywordsChart from "@/widgets/merchant/dashboard/KeywordsChart";
import ChannelsPieChart from "@/widgets/merchant/dashboard/ChannelsPieChart";
import MessagesTimelineChart from "@/widgets/merchant/dashboard/MessagesTimelineChart";
import DashboardAdvice from "@/widgets/merchant/dashboard/DashboardAdvice";
import { useAuth } from "@/context/AuthContext";
import {
  useChecklist,
  useMessagesTimeline,
  useOverview,
  useProductsCount,
  useSkipChecklist,
} from "@/features/mechant/analytics/model";

type Period = "week" | "month" | "quarter";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<Period>("week");
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const merchantId = user?.merchantId;

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
  const { mutateAsync: skipItem, isPending: skipping } =
    useSkipChecklist(merchantId ?? undefined);

  // حالات عامة
  const loading = loadingOverview || loadingChecklist || loadingTimeline;
  const error =
    (errorOverview as any)?.message || (errorChecklist as any)?.message || null;

  // اشتقاقات
  const percentageChange = overview?.sessions?.changePercent ?? 0;

  const products = Array.isArray(overview?.topProducts)
    ? overview!.topProducts.map((p: { name: string; count: number }) => ({ name: p.name, value: p.count }))
    : [];

  const keywords = Array.isArray(overview?.topKeywords)
    ? overview!.topKeywords.map((kw: { keyword: string; count: number }) => ({
        keyword: kw.keyword,
        count: kw.count,
      }))
    : [];

  const channelUsage = Array.isArray(overview?.channels?.breakdown)
    ? overview!.channels.breakdown.map((c: { channel: string; count: number }) => ({
        channel: c.channel,
        count: c.count,
      }))
    : [];

  const productsCount = overview?.productsCount ?? productsCountFallback ?? 0;

  const handleSkip = async (itemKey: string) => {
    try {
      await skipItem(itemKey);
    } catch {
      /* يمكن عرض Toast هنا عند الفشل */
    }
  };

  return (
    <Box sx={{ p: 3, background: "#f9fafb", minHeight: "100vh" }}>
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
          <ChecklistPanel
            checklist={(checklist as ChecklistGroup[]) ?? []}
            onSkip={handleSkip}
            loading={skipping}
          />

          <DashboardHeader
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            onRefresh={() => refetch()}
          />

          <MetricsCards
            sessionsCount={overview?.sessions?.count ?? 0}
            percentageChange={percentageChange}
            productsCount={productsCount}
            keywordsCount={keywords.length}
            channelsCount={channelUsage.length}
          />

          <MessagesTimelineChart data={timeline ?? []} />

          <Tabs
            value={activeTab}
            onChange={(_e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <Tab label="المنتجات" />
            <Tab label="الكلمات المفتاحية" />
            <Tab label="القنوات" />
          </Tabs>

          {activeTab === 0 && <ProductsChart products={products} />}
          {activeTab === 1 && <KeywordsChart keywords={keywords} />}
          {activeTab === 2 && <ChannelsPieChart channelUsage={channelUsage} />}

          <DashboardAdvice />
        </>
      )}
    </Box>
  );
}
