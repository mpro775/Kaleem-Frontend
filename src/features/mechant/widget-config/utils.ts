// src/features/widget-config/utils.ts
import type { EmbedMode } from "./types";

export function sanitizeForAttr(json: string) {
  return json.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export function buildEmbedScript(opts: {
  merchantId: string;
  apiBaseUrl: string;
  mode: EmbedMode;
  brandColor?: string;
  welcomeMessage?: string;
  fontFamily?: string;
  headerBgColor?: string;
  bodyBgColor?: string;
  widgetSlug?: string;
  widgetHost: string;
}) {
  const config = {
    merchantId: opts.merchantId,
    apiBaseUrl: opts.apiBaseUrl,
    mode: opts.mode,
    brandColor: opts.brandColor,
    welcomeMessage: opts.welcomeMessage,
    fontFamily: opts.fontFamily,
    headerBgColor: opts.headerBgColor,
    bodyBgColor: opts.bodyBgColor,
    widgetSlug: opts.widgetSlug,
  };
  const dataConfig = sanitizeForAttr(JSON.stringify(config));
  const src = `${opts.widgetHost}/widget.js?mode=${encodeURIComponent(opts.mode)}`;
  return `<script id="kleem-chat" data-config='${dataConfig}' src="${src}" async></script>`;
}

export function buildChatLink(origin: string, slug?: string) {
  return slug ? `${origin}/chat/${slug}` : "—";
}
