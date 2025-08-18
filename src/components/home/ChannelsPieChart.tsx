import { Paper, Typography, Box } from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type ChannelUsageType = {
  channel: string;
  count: number;
};

const COLORS = [
  "#0077b6",
  "#00b4d8",
  "#90e0ef",
  "#ff9e00",
  "#ff6d00",
  "#ff5400",
];

interface ChannelsPieChartProps {
  channelUsage: ChannelUsageType[];
}

export default function ChannelsPieChart({
  channelUsage,
}: ChannelsPieChartProps) {
const isEmpty =
  !channelUsage ||
  channelUsage.length === 0 ||
  channelUsage.every((c) => c.count === 0);
  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        توزيع القنوات
      </Typography>
      {isEmpty ? (
        <Box
          sx={{
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#aaa",
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            لا توجد بيانات لعرضها حالياً
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            تأكد من تفعيل القنوات أو وجود تفاعل خلال الفترة المحددة.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={channelUsage}
              dataKey="count"
              nameKey="channel"
              outerRadius={100}
              innerRadius={60}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {channelUsage.map((_, idx: number) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(value: number) => [`${value} جلسة`, "عدد الجلسات"]}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
