import { useState } from "react";
import { Box, Typography, Stack, Paper, Button } from "@mui/material";
import ProductsActions from "@/features/mechant/products/ui/ProductsActions";
import ProductsTable from "@/features/mechant/products/ui/ProductsTable";
import AddProductDialog from "@/features/mechant/products/ui/AddProductDialog";
import EditProductDialog from "@/features/mechant/products/ui/EditProductDialog";
import { useAuth } from "@/context/AuthContext";
import type { ProductResponse } from "@/features/mechant/products/type";

export default function ProductsPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [refresh, setRefresh] = useState(0);

  return (
    <Box
      position="relative"
      minHeight="100vh"
      sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f9fafb" }}
      dir="rtl"
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        flexWrap="wrap"
        gap={1.5}
        mb={3}
      >
        <Typography variant="h5" fontWeight={800}>
          إدارة المنتجات
        </Typography>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <ProductsActions onAddProduct={() => setOpenAddDialog(true)} />
        </Stack>
      </Box>

      {/* Table داخل Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 3 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <ProductsTable
            merchantId={merchantId}
            key={refresh}
            onEdit={(p) => setEditing(p)}
            onRefresh={() => setRefresh((r) => r + 1)}
          />
        </Box>
      </Paper>

      {/* Dialogs */}
      <AddProductDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        merchantId={merchantId}
        onProductAdded={() => setRefresh((r) => r + 1)}
      />

      <EditProductDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        product={editing}
        onUpdated={() => setRefresh((r) => r + 1)}
      />
    </Box>
  );
}
