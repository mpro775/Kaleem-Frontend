import axios from '@/shared/api/axios';
import type { MissingResponse } from './type';



export async function getMissingResponses(params: {
  page?: number;
  limit?: number;
  resolved?: 'all' | 'true' | 'false';
  channel?: 'all' | 'telegram' | 'whatsapp' | 'webchat';
  type?: 'all' | 'missing_response' | 'unavailable_product';
  search?: string;
  from?: string;
  to?: string;
}) {
  const { data } = await axios.get('/analytics/missing-responses', { params });
  return data as { items: MissingResponse[]; total: number; page: number; limit: number };
}

export async function resolveMissingResponse(id: string) {
  const { data } = await axios.patch(`/analytics/missing-responses/${id}/resolve`);
  return data;
}
export async function addMissingToKnowledge(id: string, payload: { question: string; answer: string }) {
    const { data } = await axios.post(`/analytics/missing-responses/${id}/add-to-knowledge`, payload);
    return data as { success: boolean; faqId: string; missingResponseId: string; resolved: boolean };
  }
export async function bulkResolve(ids: string[]) {
  const { data } = await axios.patch(`/analytics/missing-responses/resolve`, { ids });
  return data;
}

export async function getMissingStats(days = 7) {
  const { data } = await axios.get(`/analytics/missing-responses/stats`, { params: { days } });
  return data;
}
