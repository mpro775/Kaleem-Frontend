import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const handlers = [
  // أمثلة:
  http.post("/api/auth/signup", async () => {
    return HttpResponse.json({ accessToken: "t", user: { id: "u1", role: "MERCHANT", email: "a@a.com" } });
  }),
  http.post("/api/auth/login", async () => {
    return HttpResponse.json({ accessToken: "t", user: { id: "u1", role: "MERCHANT", email: "a@a.com" } });
  }),
];

export const server = setupServer(...handlers);
