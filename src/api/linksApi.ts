import axios from "./axios";

export const fetchLinks = (merchantId: string) =>
  axios.get(`/merchants/${merchantId}/knowledge/urls`).then((res) => res.data);

export const addLinks = (merchantId: string, urls: string[]) =>
  axios.post(`/merchants/${merchantId}/knowledge/urls`, { urls });

export const deleteLink = (merchantId: string, linkId: string) =>
  axios.delete(`/merchants/${merchantId}/knowledge/urls/${linkId}`);
