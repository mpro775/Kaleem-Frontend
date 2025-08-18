import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { createProduct } from "../../api/productsApi";
import { getCategories } from "../../api/CategoryApi";
import type { Category } from "../../types/Category";
import type { CreateProductDto } from "../../types/Product";
import { AxiosError } from "axios";

interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
  merchantId: string;
  onProductAdded?: () => void;
}

export default function AddProductDialog({
  open,
  onClose,
  merchantId,
  onProductAdded,
}: AddProductDialogProps) {
  // حالة جلب الفئات
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    if (open) getCategories().then(setCategories);
  }, [open]);
  const generateOriginalUrl = () =>
    `manual-entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // حالة النموذج
  const [form, setForm] = useState<CreateProductDto>({
    merchantId,
    name: "",
    description: "",
    category: "",
    originalUrl: generateOriginalUrl(),

    price: 0,
    images: [],
    isAvailable: true,
    keywords: [],
    specsBlock: [],
    source: "manual",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "price") {
      setForm({ ...form, price: Number(value) }); // هنا الحل
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSelectCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, category: e.target.value });
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, isAvailable: e.target.checked });
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setForm({ ...form, images: files.map((f) => URL.createObjectURL(f)) }); // استبدل بالرفع الحقيقي للصور عند الربط مع API
  };

  // معالجة كلمات مفتاحية ومواصفات (منفصلة بفاصلة)
  const handleKeywords = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      keywords: e.target.value.split(",").map((s) => s.trim()),
    });
  };
  const handleSpecs = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      specsBlock: e.target.value.split(",").map((s) => s.trim()),
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await createProduct(form);
      setLoading(false);
      onProductAdded?.();
      onClose();
    } catch (e: unknown) {
  setLoading(false);
  if (
    e instanceof AxiosError &&
    typeof e.response?.data?.message === "string" &&
    e.response.data.message.includes("duplicate key error")
  ) {
    setError("تمت إضافة منتج مشابه من قبل، يرجى المحاولة من جديد.");
    setForm((prev) => ({
      ...prev,
      originalUrl: generateOriginalUrl(),
    }));
  } else {
    setError("فشل في إضافة المنتج");
  }
}
  };
  useEffect(() => {
    if (open) {
      setForm({
        merchantId,
        name: "",
        description: "",
        category: "",
        originalUrl: generateOriginalUrl(),
        price: 0,
        images: [],
        isAvailable: true,
        keywords: [],
        specsBlock: [],
        source: "manual",
      });
      setError(null);
    }
  }, [open, merchantId]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>إضافة منتج جديد</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="اسم المنتج"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="الوصف"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
          />

          {/* حقل اختيار الفئة */}
          <TextField
            select
            label="الفئة"
            name="category"
            value={form.category}
            onChange={handleSelectCategory}
            fullWidth
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="السعر"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            fullWidth
            required
          />

          {/* رفع صور */}
          <Button variant="outlined" component="label">
            رفع صور
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleImages}
            />
          </Button>

          {/* المواصفات */}
          <TextField
            label="المواصفات (افصل كل واحدة بفاصلة)"
            name="specsBlock"
            value={form.specsBlock?.join(",") ?? ""}
            onChange={handleSpecs}
            fullWidth
          />

          {/* الكلمات المفتاحية */}
          <TextField
            label="كلمات مفتاحية (افصل كل كلمة بفاصلة)"
            name="keywords"
            value={form.keywords?.join(",") ?? ""}
            onChange={handleKeywords}
            fullWidth
          />

          {/* متوفر */}
          <FormControlLabel
            control={
              <Switch
                checked={form.isAvailable}
                onChange={handleSwitch}
                name="isAvailable"
              />
            }
            label="متوفر للبيع"
          />
        </Stack>
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "جارٍ الحفظ..." : "إضافة"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
