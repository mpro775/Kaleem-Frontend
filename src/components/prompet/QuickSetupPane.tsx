import { Box, Typography, TextField, MenuItem } from "@mui/material";
import { useFormContext, Controller } from "react-hook-form";
import type { QuickConfig } from "../../types/merchant";

export function QuickSetupPane() {
  const { control, watch } = useFormContext<QuickConfig>();

  // القيم الحالية
  const includeStoreUrl = watch("includeStoreUrl", false);
  const includeAddress = watch("includeAddress", false);
  const includePolicies = watch("includePolicies", false);
  const includeWorkingHours = watch("includeWorkingHours", false);
  const includeClosingPhrase = watch("includeClosingPhrase", false);

  return (
    <Box>
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

      {/* تلميحات مكان Switches */}
      <Box mt={2}>
        {!includeStoreUrl && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            لإظهار رابط المتجر في المحادثة، يرجى إضافة رابط المتجر في{" "}
            <strong>إعدادات المتجر</strong> أولاً.
          </Typography>
        )}
        {!includeAddress && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            لإظهار عنوان المتجر في المحادثة، يرجى إضافة عنوان المتجر في{" "}
            <strong>إعدادات المتجر</strong> أولاً.
          </Typography>
        )}
        {!includePolicies && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            لإظهار سياسات الإرجاع والشحن والاستبدال، يرجى تكوينها في{" "}
            <strong>إعدادات المتجر</strong> أولاً.
          </Typography>
        )}
        {!includeWorkingHours && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            لإظهار أوقات الدوام، يرجى ضبط ساعات العمل في{" "}
            <strong>إعدادات المتجر</strong> أولاً.
          </Typography>
        )}
        {!includeClosingPhrase && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            لإظهار نص الخاتمة، يرجى تفعيل حقل نص الخاتمة في{" "}
            <strong>إعدادات المتجر</strong> أولاً.
          </Typography>
        )}
      </Box>

      {/* التعليمات المخصصة */}
      <Controller
        name="customInstructions"
        control={control}
        render={({ field }) => (
          <TextField
            label="تعليمات مخصصة"
            placeholder="أضف حتى 10 تعليمات، كل منها حتى 50 حرف"
            fullWidth
            margin="normal"
            value={field.value}
            onChange={(e) => {
              const input = e.target.value;
              const list = input.split(/;|\n/).slice(0, 10);
              field.onChange(list.map((instr) => instr.slice(0, 50)));
            }}
            helperText="يمكنك إضافة حتى 10 تعليمات، كل منها حتى 50 حرف"
            FormHelperTextProps={{ sx: { color: "text.secondary" } }}
          />
        )}
      />

      {/* الرسالة الختامية */}
      <Controller
        name="closingMessage"
        control={control}
        render={({ field }) => (
          <TextField
            label="الرسالة الختامية (تظهر في نهاية المحادثة)"
            placeholder="مثال: شكراً لتواصلك معنا!"
            fullWidth
            margin="normal"
            value={field.value || ""}
            onChange={field.onChange}
            inputProps={{ maxLength: 120 }}
            helperText="يمكنك تخصيص رسالة تظهر في نهاية كل محادثة (اختياري)"
            FormHelperTextProps={{ sx: { color: "text.secondary" } }}
          />
        )}
      />

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
            helperText="سيعطيه البوت للمستخدم عند طلب التواصل مع خدمة العملاء (اختياري)"
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
            helperText="سيعطيه البوت للمستخدم عند طلب التواصل مع خدمة العملاء (اختياري)"
            FormHelperTextProps={{ sx: { color: "text.secondary" } }}
          />
        )}
      />
    </Box>
  );
}
