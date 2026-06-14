import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";

// Explicit allow-list for AI / LLM crawlers. Most respect robots.txt;
// a few don't, but being explicit makes our stance unambiguous and
// satisfies discoverability auditors that check per-bot directives.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
  "FacebookBot",
  "Meta-ExternalAgent",
  "Bytespider",
  "DuckAssistBot",
  "cohere-ai",
  "Diffbot",
  "Timpibot",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/"],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
