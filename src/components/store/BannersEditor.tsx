import { Box, Button, TextField, Stack, IconButton, Switch } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Banner } from "../../types/merchant";
import { useState } from "react";
type BannerValue = string | number | boolean | undefined;

interface Props {
  banners: Banner[];
  onChange: (banners: Banner[]) => void;
  loading?: boolean;
}
export default function BannersEditor({ banners, onChange, loading }: Props) {
  const [localBanners, setLocalBanners] = useState<Banner[]>(banners);

  const handleAdd = () => {
    setLocalBanners([...localBanners, { text: "", active: true, order: localBanners.length }]);
  };
  const handleRemove = (idx: number) => {
    const newBanners = [...localBanners];
    newBanners.splice(idx, 1);
    setLocalBanners(newBanners);
  };
const handleChange = (idx: number, key: keyof Banner, value: BannerValue) => {
  const newBanners = [...localBanners];
  newBanners[idx] = { ...newBanners[idx], [key]: value };
  setLocalBanners(newBanners);
};

  // Sync local changes to parent
  // (يمكنك إضافة useEffect أو زر حفظ حسب التصميم)
  const handleSave = () => {
    onChange(localBanners);
  };

  return (
    <Box>
      <Stack spacing={3}>
        {localBanners.map((b, idx) => (
          <Box key={idx} border={1} p={2} borderRadius={2} mb={1}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="عنوان البانر"
                  value={b.text}
                  onChange={e => handleChange(idx, "text", e.target.value)}
                  fullWidth
                />
                <Switch
                  checked={b.active ?? true}
                  onChange={e => handleChange(idx, "active", e.target.checked)}
                  color="success"
                />
                <IconButton onClick={() => handleRemove(idx)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Stack>
              <TextField
                label="رابط عند الضغط (اختياري)"
                value={b.url ?? ""}
                onChange={e => handleChange(idx, "url", e.target.value)}
                fullWidth
              />
              <TextField
                label="رابط صورة البانر (اختياري)"
                value={b.image ?? ""}
                onChange={e => handleChange(idx, "image", e.target.value)}
                fullWidth
              />
              <TextField
                label="لون خلفية البانر (hex أو اسم اللون)"
                value={b.color ?? ""}
                onChange={e => handleChange(idx, "color", e.target.value)}
                fullWidth
              />
            </Stack>
          </Box>
        ))}
      </Stack>
      <Button variant="outlined" onClick={handleAdd} sx={{ mt: 2 }}>
        + إضافة بانر جديد
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ mt: 2, ml: 2 }}
        disabled={loading}
      >
        حفظ التغييرات
      </Button>
    </Box>
  );
}
