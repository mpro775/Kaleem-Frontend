import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { Box, Tabs, Tab, CircularProgress, Alert } from "@mui/material";
import type { ChecklistGroup, Overview } from "../../types/analytics";
import ChecklistPanel from "../../components/home/ChecklistPanel";
import DashboardHeader from "../../components/home/DashboardHeader";
import MetricsCards from "../../components/home/MetricsCards";
import ProductsChart from "../../components/home/ProductsChart";
import KeywordsChart from "../../components/home/KeywordsChart";
import ChannelsPieChart from "../../components/home/ChannelsPieChart";
import DashboardAdvice from "../../components/home/DashboardAdvice";
import { useAuth } from "../../context/AuthContext";
import MessagesTimelineChart from "../../components/home/MessagesTimelineChart";

const HomeDashboard = () => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">(
    "week"
  );
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const merchantId = user?.merchantId;
  // البيانات الحقيقية
  const [overview, setOverview] = useState<Overview | null>(null);
  const [checklist, setChecklist] = useState<ChecklistGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [productsCount, setProductsCount] = useState(0);
useEffect(() => {
  axios.get("/analytics/products-count").then(res => setProductsCount(res.data.total));
}, [merchantId]);

  const [messagesTimeline, setMessagesTimeline] = useState([]);
const fetchTimeline = async () => {
  try {
    const res = await axios.get(`/analytics/messages-timeline?period=${timeRange}&groupBy=day`);
    setMessagesTimeline(res.data);
  } catch {
    // يمكنك التعامل مع الخطأ هنا
  }
};
useEffect(() => {
  fetchTimeline();
}, [timeRange, merchantId]);

  // جلب البيانات
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, checklistRes] = await Promise.all([
        axios.get(`/analytics/overview?period=${timeRange}`),
        axios.get(`/merchants/${merchantId}/checklist`),
      ]);
      setOverview(overviewRes.data);
      setChecklist(checklistRes.data);
      setLoading(false);
    } catch {
      setError("حدث خطأ أثناء جلب البيانات.");
      setLoading(false);
    }
  };
  const handleSkip = async (itemKey: string) => {
    try {
      await axios.post(`/merchants/${merchantId}/checklist/${itemKey}/skip`);
      fetchAll(); // أعد جلب checklist من الباك-إند ليتم تحديث الحالة
    } catch {
      // يمكنك عرض رسالة خطأ
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [timeRange, merchantId]);

  const percentageChange =
    overview && overview.sessions ? overview.sessions.changePercent : 0;
  // استخراج بيانات المخططات
  const products = Array.isArray(overview?.topProducts)
    ? overview.topProducts.map((p) => ({
        name: p.name,
        value: p.count,
      }))
    : [];
 const keywords = Array.isArray(overview?.topKeywords)
  ? overview.topKeywords.map((kw) => ({
      keyword: kw.keyword,
      count: kw.count,
    }))
  : [];

  const channelUsage = Array.isArray(overview?.channels?.breakdown)
    ? overview.channels.breakdown.map((c) => ({
        channel: c.channel,
        count: c.count,
      }))
    : [];

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
          {error}
        </Alert>
      )}
      {!loading && !error && (
        <>
          <ChecklistPanel checklist={checklist} onSkip={handleSkip} />
          <DashboardHeader
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            onRefresh={fetchAll}
          />
  <MetricsCards
  sessionsCount={overview?.sessions?.count ?? 0}
  percentageChange={percentageChange}
  productsCount={overview?.productsCount ?? productsCount}
  keywordsCount={keywords.length}
  channelsCount={channelUsage.length}
/>
<MessagesTimelineChart data={messagesTimeline} />

          <Tabs
            value={activeTab}
            onChange={(_e, newValue) => setActiveTab(newValue)}
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
};

export default HomeDashboard;
