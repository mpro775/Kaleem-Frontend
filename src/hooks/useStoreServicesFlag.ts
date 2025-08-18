// src/hooks/useStoreServicesFlag.ts
import { useEffect, useState } from "react";
import { getIntegrationsStatus } from "../api/integrationsApi";
import { useAuth } from "../context/AuthContext";

export function useStoreServicesFlag() {
  const { token } = useAuth();
  const [showStoreServices, setShowStoreServices] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) return;
      try {
        const st = await getIntegrationsStatus(token);
        // لو أحد المزوّدين فعال/متصل → نخفي الخدمات الداخلية
        const externalActive = !!(
          st.salla?.active ||
          st.zid?.active ||
          st.salla?.connected ||
          st.zid?.connected
        );
        if (mounted) setShowStoreServices(!externalActive);
      } catch {
        // في حال فشل الاستعلام نخلي الافتراضي true (كليم)
        if (mounted) setShowStoreServices(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  return showStoreServices;
}
