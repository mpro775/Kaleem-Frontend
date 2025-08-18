import { useState, useCallback } from "react";
import type { Merchant, QuickConfig, AdvancedConfig } from "../types/merchant";
import { getMerchant, updateAdvancedConfig, updateQuickConfig } from "../api/prompt";

export function usePromptStudio(merchantId: string) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMerchant = useCallback(async () => {
    setLoading(true);
    const data = await getMerchant(merchantId);
    setMerchant(data);
    setLoading(false);
  }, [merchantId]);

  const saveQuickConfig = async (config: QuickConfig) => {
    await updateQuickConfig(merchantId, config);
    await fetchMerchant();
  };

  const saveAdvancedConfig = async (config: AdvancedConfig) => {
    await updateAdvancedConfig(merchantId, config);
    await fetchMerchant();
  };

  return {
    merchant,
    loading,
    fetchMerchant,
    saveQuickConfig,
    saveAdvancedConfig,
  };
}
