// src/api/instructions.ts
import axios from '@/shared/api/axios';
import type { Instruction } from './type';


export async function listInstructions(params: {
  active?: 'all' | 'true' | 'false';
  page?: number;
  limit?: number;
}) {
  const p: { page: number; limit: number; active?: 'true' | 'false' } = { page: params.page ?? 1, limit: params.limit ?? 20 };
  if (params.active && params.active !== 'all') p.active = params.active;
  const { data } = await axios.get('/instructions', { params: p });
  return data as Instruction[];
}

export async function createInstruction(payload: { instruction: string; type?: 'auto'|'manual' }) {
  const { data } = await axios.post('/instructions', payload);
  return data as Instruction;
}

export async function updateInstruction(id: string, payload: Partial<Instruction>) {
  const { data } = await axios.patch(`/instructions/${id}`, payload);
  return data as Instruction;
}

export async function removeInstruction(id: string) {
  const { data } = await axios.delete(`/instructions/${id}`);
  return data;
}

export async function toggleActive(id: string, active: boolean) {
  const url = active ? `/instructions/${id}/activate` : `/instructions/${id}/deactivate`;
  const { data } = await axios.patch(url);
  return data;
}

export async function getSuggestions(limit = 10) {
  const { data } = await axios.get('/instructions/suggestions', { params: { limit } });
  return data as { items: { badReply: string; count: number; instruction: string }[] };
}

export async function generateFromBadReplies(badReplies: string[]) {
  const { data } = await axios.post('/instructions/auto/generate', { badReplies });
  return data as { results: { badReply: string; instruction: string }[] };
}
