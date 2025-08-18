export interface Category {
  _id: string;
  merchantId: string;
  name: string;
  parent?: string | null; // id للفئة الرئيسية أو null
  image?: string; // رابط الصورة
}
