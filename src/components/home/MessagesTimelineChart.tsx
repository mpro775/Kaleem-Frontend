import { Paper, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type TimelinePoint = {
  _id: string; // اليوم أو الساعة
  count: number;
};

interface Props {
  data: TimelinePoint[];
}

export default function MessagesTimelineChart({ data }: Props) {
  const isEmpty = !data || data.length === 0;

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>عدد الرسائل مع الزمن</Typography>
      {isEmpty ? (
        <Typography>لا توجد بيانات حالياً.</Typography>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#ff8500" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}
