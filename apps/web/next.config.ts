import type { NextConfig } from "next";
import path from "node:path";

// Conservative security headers. CSP is intentionally omitted — Next.js
// ships inline scripts/styles by default, and a misconfigured CSP would
// break the page faster than it'd block any attack. Revisit when we move
// JSON-LD and other inlines to nonces.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Source-only workspace packages — Next.js needs to transpile their .ts
  // files since they don't ship compiled output.
  transpilePackages: ["@integrateapi/engine", "@integrateapi/registry"],
  turbopack: {
    root: path.resolve(process.cwd(), "../.."),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
