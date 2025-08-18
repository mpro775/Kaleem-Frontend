import "@testing-library/jest-dom";
import { server } from "./testServer";
import "whatwg-fetch";

// MSW: تشغيل سيرفر وهمي للـ API
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// polyfill لـ matchMedia (MUI يحتاجه أحياناً)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
