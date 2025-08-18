// src/features/storefront-theme/ui/SlugLinkField.tsx
import { useState } from "react";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

type Props = {
  slug: string;
  onSlugChange: (v: string) => void;
  storeUrl: string;
  domain?: string;
};

export function SlugLinkField({ slug, onSlugChange, storeUrl, domain }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box mb={4} mt={2} maxWidth={450}>
      <Typography fontWeight="bold" mb={1}>
        رابط المتجر <span style={{ color: "#999" }}>(Slug)</span>
      </Typography>
      <TextField
        label="معرّف الرابط (slug)"
        value={slug}
        onChange={(e) => onSlugChange(e.target.value)}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button
                onClick={handleCopy}
                startIcon={<ContentCopyIcon />}
                disabled={!storeUrl}
                size="small"
                sx={{ minWidth: 0, px: 1, fontSize: 13 }}
              >
                {copied ? "تم النسخ" : "نسخ"}
              </Button>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Box>
        <Typography variant="body2" sx={{ color: "#666" }}>
          رابط متجرك الحالي:
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "primary.main", fontWeight: "bold", wordBreak: "break-all", mt: 0.5 }}
          title={domain ? "يتم استخدام النطاق المخصص" : "يتم استخدام الرابط القصير (slug)"}
        >
          {storeUrl || "لم يتم تعيين الرابط بعد"}
        </Typography>
      </Box>
    </Box>
  );
}
