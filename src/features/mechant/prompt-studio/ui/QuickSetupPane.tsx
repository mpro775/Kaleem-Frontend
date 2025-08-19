import { Box, TextField, MenuItem, Stack, FormControlLabel, Switch } from "@mui/material";
import { useFormContext, Controller } from "react-hook-form";
import type { QuickConfig } from "@/features/mechant/prompt-studio/types";

export function QuickSetupPane() {
  const { control, watch } = useFormContext<QuickConfig>();
  const includeClosing = watch("includeClosingPhrase");

  return (
    <Box sx={{ minWidth: 0, p: { xs: 0, md: 0 } }}>
      {/* اللهجة */}
      <Controller
        name="dialect"
        control={control}
        render={({ field }) => (
          <TextField select label="اللهجة" fullWidth margin="normal" {...field}>
            {["خليجي", "مصري", "شامي"].map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {/* النغمة */}
      <Controller
        name="tone"
        control={control}
        render={({ field }) => (
          <TextField select label="النغمة" fullWidth margin="normal" {...field}>
            {["ودّي", "رسمي", "طريف"].map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {/* التعليمات المخصصة — ⚠️ إصلاح القيمة (كانت Array مباشرة) */}
      <Controller
        name="customInstructions"
        control={control}
        render={({ field }) => (
          <TextField
            label="تعليمات مخصصة"
            placeholder="أضف حتى 10 تعليمات، افصل بينها بفاصلة منقوطة ; أو سطر جديد"
            fullWidth
            margin="normal"
            value={Array.isArray(field.value) ? field.value.join("; ") : ""}
            onChange={(e) => {
              const input = e.target.value;
              const list = input
                .split(/;|\n/)
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 10);
              field.onChange(list.map((instr) => instr.slice(0, 50)));
            }}
            helperText="يمكنك إضافة حتى 10 تعليمات، كل منها حتى 50 حرف"
            FormHelperTextProps={{ sx: { color: "text.secondary" } }}
          />
        )}
      />

      {/* تفعيل/تعطيل رسالة ختامية */}
      <Stack direction="row" alignItems="center" mt={1}>
        <Controller
          name="includeClosingPhrase"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={!!field.value} onChange={(_, v) => field.onChange(v)} />}
              label="إضافة رسالة ختامية تلقائية"
            />
          )}
        />
      </Stack>

      {/* الرسالة الختامية (تظهر فقط عند التفعيل) */}
      {includeClosing && (
        <Controller
          name="closingText"
          control={control}
          render={({ field }) => (
            <TextField
              label="الرسالة الختامية"
              placeholder="مثال: شكراً لتواصلك معنا!"
              fullWidth
              margin="normal"
              value={field.value || ""}
              onChange={field.onChange}
              inputProps={{ maxLength: 120 }}
              helperText="تظهر في نهاية كل محادثة"
              FormHelperTextProps={{ sx: { color: "text.secondary" } }}
            />
          )}
        />
      )}

      {/* رقم خدمة العملاء */}
      <Controller
        name="customerServicePhone"
        control={control}
        render={({ field }) => (
          <TextField
            label="رقم هاتف خدمة العملاء"
            placeholder="مثال: 0555555555"
            fullWidth
            margin="normal"
            value={field.value || ""}
            onChange={field.onChange}
            helperText="يُعطى للمستخدم عند طلب التواصل (اختياري)"
            FormHelperTextProps={{ sx: { color: "text.secondary" } }}
          />
        )}
      />

      {/* رابط واتساب خدمة العملاء */}
      <Controller
        name="customerServiceWhatsapp"
        control={control}
        render={({ field }) => (
          <TextField
            label="رابط واتساب خدمة العملاء"
            placeholder="مثال: https://wa.me/9665xxxxxxx"
            fullWidth
            margin="normal"
            value={field.value || ""}
            onChange={field.onChange}
            helperText="يُعطى للمستخدم عند طلب التواصل (اختياري)"
            FormHelperTextProps={{ sx: { color: "text.secondary" } }}
          />
        )}
      />
    </Box>
  );
}
