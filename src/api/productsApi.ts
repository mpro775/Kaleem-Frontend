import axios from "./axios"; // هذا هو instance الجاهز
import type { CreateProductDto, Product, ProductResponse, SetupConfig } from "../types/Product";

export async function importProductsFromExcel(
  formData: FormData
): Promise<{ count: number; message: string }> {
  const { data } = await axios.post<{ count: number; message: string }>(
    "/products/import-file",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function saveSetupConfig(
  merchantId: string,
  config: SetupConfig
): Promise<SetupConfig> {
  const { data } = await axios.post<SetupConfig>(
    `/products/${merchantId}/setup-products`,
    config
  );
  return data;
}

export async function getSetupConfig(
  merchantId: string
): Promise<SetupConfig | null> {
  const { data } = await axios.get<SetupConfig | null>(
    `/products/${merchantId}/setup-products`
  );
  return data;
}

export async function updateProduct(
  id: string,
  payload: Partial<CreateProductDto>
): Promise<ProductResponse> {
  const { data } = await axios.put<ProductResponse>(
    `/products/${id}`,
    payload
  );
  return data;
}

export async function importProductByLink(
  payload: {
    originalUrl: string;
    merchantId: string;
    source: "manual" | "api" | "scraper";
  }
): Promise<{ status: string }> {
  const { data } = await axios.post<{ status: string }>(
    "/products/import-link",
    payload
  );
  return data;
}

export async function getMerchantProducts(
  merchantId: string
): Promise<Product[]> {
  const { data } = await axios.get<Product[]>(
    "/products",
    { params: { merchantId } }
  );
  return data;
}

export async function createProduct(
  payload: CreateProductDto
): Promise<ProductResponse> {
  const { data } = await axios.post<ProductResponse>(
    "/products",
    payload
  );
  return data;
}

export async function deleteProduct(
  id: string
): Promise<{ message: string }> {
  const { data } = await axios.delete<{ message: string }>(
    `/products/${id}`
  );
  return data;
}
