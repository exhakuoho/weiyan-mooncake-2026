import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "月下玩創意｜3D 客製月餅工作坊";
const description = "用 3D 列印模具親手製作造型月餅，三小時完成 4 顆月餅與禮盒。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = `${origin}/og.jpg?v=650`;

  return {
    title,
    description,
    icons: { icon: "/weiyan-logo-256.jpg", apple: "/weiyan-logo-256.jpg" },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "zh_TW",
      url: origin,
      images: [{ url: socialImage, width: 1200, height: 630, alt: "月下玩創意｜3D 客製月餅工作坊" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
