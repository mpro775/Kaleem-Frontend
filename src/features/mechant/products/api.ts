import axios from "@/shared/api/axios";
import type { CreateProductDto, UpdateProductDto, ProductResponse } from "@/features/mechant/products/type";
import { ensureIdString } from "@/shared/utils/ids";

// إنشاء منتج
export async function createProduct(payload: CreateProductDto): Promise<ProductResponse> {
  const casted: CreateProductDto = {
    ...payload,
    category: ensureIdString(payload.category), // ← أهم سطر
  };
  const { data } = await axios.post<ProductResponse>("/products", casted);
  return data;
}

// تحديث منتج
export async function updateProduct(id: string, payload: UpdateProductDto): Promise<ProductResponse> {
  const casted: UpdateProductDto = {
    ...payload,
    category: payload.category !== undefined ? ensureIdString(payload.category) : undefined,
  };
  const { data } = await axios.put<ProductResponse>(`/products/${id}`, casted);
  return data;
}

// حذف منتج
export async function deleteProduct(id: string): Promise<{ message: string }> {
  const { data } = await axios.delete<{ message: string }>(`/products/${id}`);
  return data;
}

// جلب منتجات التاجر
export async function getMerchantProducts(merchantId: string): Promise<ProductResponse[]> {
  console.log('Fetching products for merchantId:', merchantId);
  const { data } = await axios.get<{ success: boolean; data: ProductResponse[] }>("/products", { params: { merchantId } });
  
  console.log('Raw API response:', data);
  
  // Handle different response structures
  if (data && data.success && Array.isArray(data.data)) {
    console.log('Returning data.data:', data.data);
    return data.data;
  } else if (Array.isArray(data)) {
    console.log('Returning data directly:', data);
    return data;
  } else {
    console.warn('Unexpected API response structure:', data);
    return [];
  }
}

// رفع صور متعددة (حد 6) — replace=false يعني إضافة لما هو موجود
export async function uploadProductImages(
  id: string | { _id?: any } | any,
  files: File[],
  replace = false
): Promise<{ urls: string[]; count: number; accepted: number; remaining: number }> {
  // تأكيد أن id نص
  const productId =
    typeof id === 'string'
      ? id
      : id?._id?.toString?.() ?? id?.toString?.() ?? String(id);

  const form = new FormData();
  for (const f of files) {
    form.append('files', f, f.name); // متوافق مع FilesInterceptor('files', 6)
  }

  const { data } = await axios.post(
    `/products/${productId}/images`,
    form,
    { params: { replace } } // لا تضع Content-Type يدويًا لكي يضيف المتصفح boundary
  );
  return data;
}
