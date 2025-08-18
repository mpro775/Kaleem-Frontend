import axios from "./axios";

export const fetchFaqs = (merchantId: string) =>
  axios.get(`/merchants/${merchantId}/faqs`).then((res) => res.data);

export const addFaqs = (
  merchantId: string,
  faqs: { question: string; answer: string }[]
) => axios.post(`/merchants/${merchantId}/faqs`, faqs);

export const deleteFaq = (merchantId: string, faqId: string) =>
  axios.delete(`/merchants/${merchantId}/faqs/${faqId}`);
