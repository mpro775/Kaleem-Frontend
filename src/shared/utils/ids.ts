
export function ensureIdString(v: unknown): string {
    if (v == null) return '';
    if (typeof v === 'string') return v.trim();
  
    // سجلّ شائع: { _id: "...", name: ... }
    // @ts-ignore
    if (v && typeof v === 'object' && v._id) return String(v._id);
  
    // سجلّ آخر: { id: "..." }
    // @ts-ignore
    if (v && typeof v === 'object' && v.id) return String(v.id);
  
    // وثائق من نوع { $oid: "..." }
    // @ts-ignore
    if (v && typeof v === 'object' && v.$oid) return String(v.$oid);
  
    // ObjectId-like: عنده toHexString
    // @ts-ignore
    if (v && typeof v === 'object' && typeof v.toHexString === 'function') {
      // @ts-ignore
      return v.toHexString();
    }
  
    // محاولة أخيرة: toString قد تعطي "[object Object]"— لذلك نتحقق
    const s = String(v);
    return s === '[object Object]' ? '' : s.trim();
  }
  