import { Box, Typography, Paper } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RecommendIcon from "@mui/icons-material/Recommend";
import AppsIcon from "@mui/icons-material/Apps";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

// بيانات قائمة "قبل"
const beforeItems = [
  { icon: <AccessTimeIcon />, text: "تأخير في الردود" },
  { icon: <ChatBubbleOutlineIcon />, text: "إدارة يدوية للطلبات" },
  { icon: <RecommendIcon />, text: "لا توجد توصيات للعملاء" },
  { icon: <AppsIcon />, text: "ردود غير موحدة" },
  { icon: <DashboardIcon />, text: "عدم توفر لوحة تحكم" },
];

// بيانات قائمة "بعد"
const afterItems = [
  { icon: <AccessTimeIcon />, text: "ردود فورية عبر المنصات" },
  { icon: <ChatBubbleOutlineIcon />, text: "إدارة تلقائية ذكية" },
  { icon: <RecommendIcon />, text: "توصية العملاء" },
  { icon: <AppsIcon />, text: "ردود ذكية موحدة ومخصصة" },
  { icon: <DashboardIcon />, text: "لوحة تحكم مخصصة لكل تاجر" },
];

// مكون فرعي لإنشاء كل عنصر في القائمة
const ComparisonItem = ({
  icon,
  text,
  type,
}: {
  icon: React.ReactNode;
  text: string;
  type: "before" | "after";
}) => {
  const isAfter = type === "after";
  const color = isAfter ? "success.main" : "error.main";
  const bgColor = isAfter
    ? "rgba(46, 125, 50, 0.08)"
    : "rgba(211, 47, 47, 0.08)";

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1.5,
        mb: 2,
        borderRadius: "16px",
        bgcolor: bgColor,
        borderColor: "transparent",
        position: "relative",
        overflow: "hidden",
        // الشريط الجانبي الملون
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "20%",
          bottom: "20%",
          width: "5px",
          bgcolor: color,
          borderRadius: "0 8px 8px 0",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            bgcolor: "white",
            color: color,
            mr: 2,
            position: "relative",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {icon}
          <Box
            component={isAfter ? CheckCircleIcon : CancelIcon}
            sx={{
              position: "absolute",
              top: -5,
              right: -5,
              fontSize: 16,
              color: color,
              bgcolor: "white",
              borderRadius: "50%",
            }}
          />
        </Box>
        <Typography variant="body1" fontWeight={500}>
          {text}
        </Typography>
      </Box>
    </Paper>
  );
};

// المكون الرئيسي للمقارنة
export default function BeforeAfterComparison() {
  return (
    <Box sx={{ py: 8, px: 2, bgcolor: "#f9fafb" }}>
      <Typography
        variant="h3"
        component="h2"
        fontWeight="bold"
        align="center"
        sx={{ mb: 1 }}
      >
        قبل VS بعد كَلِيم
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 4, md: 8 },
          maxWidth: "1000px",
          mx: "auto",
          mt: 5,
        }}
      >
        {/* عمود "بعد كليم" */}
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
            sx={{ mb: 3 }}
          >
            بعد كَلِيم
          </Typography>
          {afterItems.map((item, index) => (
            <ComparisonItem
              key={index}
              icon={item.icon}
              text={item.text}
              type="after"
            />
          ))}
        </Box>

        {/* عمود "قبل كليم" */}
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
            sx={{ mb: 3 }}
          >
            قبل كَلِيم
          </Typography>
          {beforeItems.map((item, index) => (
            <ComparisonItem
              key={index}
              icon={item.icon}
              text={item.text}
              type="before"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
