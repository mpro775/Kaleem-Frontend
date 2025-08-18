import { useState } from "react";
import type { MerchantInfo, SocialLinks } from "../../types/merchant";
import SocialLinksEditor from "./SocialLinksEditor";

interface Props {
  initialData: MerchantInfo;
  onSave: (data: Partial<MerchantInfo>) => Promise<void>;
  loading?: boolean;
}

export default function SocialLinksSection({ initialData, onSave, loading }: Props) {
  const [links, setLinks] = useState<SocialLinks>(initialData.socialLinks || {});
  const [changed, setChanged] = useState(false);

  const handleChange = (newLinks: SocialLinks) => {
    setLinks(newLinks);
    setChanged(true);
  };

  const handleSave = async () => {
    await onSave({ socialLinks: links });
    setChanged(false);
  };

  return (
    <div>
      <SocialLinksEditor socialLinks={links} onChange={handleChange} />
      <button
        onClick={handleSave}
        disabled={loading || !changed}
        style={{
          marginTop: 24,
          padding: "10px 30px",
          fontWeight: "bold",
          borderRadius: 6,
          background: "#1976d2",
          color: "#fff",
          border: "none",
          cursor: changed && !loading ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "جاري الحفظ..." : "حفظ الروابط"}
      </button>
    </div>
  );
}
