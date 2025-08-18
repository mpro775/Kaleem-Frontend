import { useState } from "react";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  IconButton,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { MerchantSectionProps } from "../../types/merchant";
import type { WorkingHour } from "../../types/workingHour";

const weekdays = [
  { key: "Sunday", label: "الأحد" },
  { key: "Monday", label: "الاثنين" },
  { key: "Tuesday", label: "الثلاثاء" },
  { key: "Wednesday", label: "الأربعاء" },
  { key: "Thursday", label: "الخميس" },
  { key: "Friday", label: "الجمعة" },
  { key: "Saturday", label: "السبت" },
];

export default function WorkingHoursForm({
  initialData,
  onSave,
  loading,
}: MerchantSectionProps) {
  // إبدأ فقط بالأيام التي لها دوام فعلي من البيانات
  const [hours, setHours] = useState<WorkingHour[]>(
    initialData.workingHours?.length ? initialData.workingHours : []
  );

  // إضافة يوم جديد (فقط الأيام غير الموجودة)
  const availableDays = weekdays.filter(
    (w) => !hours.find((h) => h.day === w.key)
  );

  const handleAddDay = () => {
    if (!availableDays.length) return;
    setHours([
      ...hours,
      { day: availableDays[0].key, openTime: "09:00", closeTime: "18:00" },
    ]);
  };

  const handleChange = (
    i: number,
    key: "openTime" | "closeTime" | "day",
    value: string
  ) => {
    setHours((hs) =>
      hs.map((h, idx) => (idx === i ? { ...h, [key]: value } : h))
    );
  };

  const handleDelete = (i: number) => {
    setHours((hs) => hs.filter((_, idx) => idx !== i));
  };

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>اليوم</TableCell>
            <TableCell>من</TableCell>
            <TableCell>إلى</TableCell>
            <TableCell>حذف</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hours.map((h, i) => (
            <TableRow key={h.day}>
              <TableCell>
                <TextField
                  select
                  value={h.day}
                  onChange={(e) => handleChange(i, "day", e.target.value)}
                  fullWidth
                >
                  {weekdays.map((w) => (
                    <MenuItem
                      key={w.key}
                      value={w.key}
                      disabled={
                        !!hours.find((hh, idx) => hh.day === w.key && idx !== i)
                      }
                    >
                      {w.label}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell>
                <TextField
                  type="time"
                  value={h.openTime}
                  onChange={(e) => handleChange(i, "openTime", e.target.value)}
                  required
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="time"
                  value={h.closeTime}
                  onChange={(e) => handleChange(i, "closeTime", e.target.value)}
                  required
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(i)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        startIcon={<AddIcon />}
        variant="outlined"
        sx={{ mt: 2, mb: 2 }}
        disabled={!availableDays.length}
        onClick={handleAddDay}
      >
        إضافة يوم جديد
      </Button>
      <Button
        variant="contained"
        sx={{ mt: 2, ml: 2 }}
        onClick={() => onSave({ workingHours: hours })}
        disabled={loading}
      >
        حفظ
      </Button>
    </Box>
  );
}
