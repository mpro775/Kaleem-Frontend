import { Box, Typography, Chip, Rating } from "@mui/material";
import type { Storefront } from "@/features/mechant/storefront-theme/type";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import ScheduleIcon from "@mui/icons-material/Schedule";
import type { MerchantInfo } from "@/features/mechant/merchant-settings/types";

interface Props {
  merchant: MerchantInfo;
  storefront: Storefront;
}

export function StoreHeader({ merchant, storefront }: Props) {
  const { buttonStyle } = storefront;

  return (
    <Box
      mb={4}
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        // ✅ لون واحد داكن موحد
        backgroundColor: "var(--brand)",
        color: "var(--on-brand)",
        p: { xs: 3, md: 5 },
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 40%)",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 2, maxWidth: 1200, mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            mb: 2,
          }}
        >
          {merchant.logoUrl && (
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: `4px solid rgba(255,255,255,0.3)`,
                overflow: "hidden",
                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                flexShrink: 0,
                bgcolor: "transparent",
              }}
            >
              <img
                src={merchant.logoUrl}
                alt={merchant.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          )}

          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                mb: 1,
                textShadow: "0 2px 4px rgba(0,0,0,0.25)",
              }}
            >
              {merchant.name}
            </Typography>

            {merchant.businessDescription && (
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.95,
                  maxWidth: 700,
                  mx: "auto",
                  mb: 2,
                }}
              >
                {merchant.businessDescription}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 2,
                mt: 2,
              }}
            >
              {merchant.phone && (
                <Chip
                  icon={<PhoneIcon />}
                  label={merchant.phone}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.18)",
                    color: "var(--on-brand)",
                    borderRadius: buttonStyle === "rounded" ? 16 : 0,
                  }}
                />
              )}

              {merchant.addresses?.length > 0 && (
                <Chip
                  icon={<LocationOnIcon />}
                  label={merchant.addresses[0].city}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.18)",
                    color: "var(--on-brand)",
                    borderRadius: buttonStyle === "rounded" ? 16 : 0,
                  }}
                />
              )}

              {merchant.workingHours?.length > 0 && (
                <Chip
                  icon={<ScheduleIcon />}
                  label={merchant.workingHours[0].day}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.18)",
                    color: "var(--on-brand)",
                    borderRadius: buttonStyle === "rounded" ? 16 : 0,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Rating
            value={4.5}
            precision={0.5}
            readOnly
            // ✅ نجوم فاتحة على الخلفية الداكنة
            sx={{ color: "var(--on-brand)" }}
          />
          <Typography variant="body2" sx={{ ml: 1, opacity: 0.9 }}>
            (4.5 من ٥٠٠ تقييم)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
