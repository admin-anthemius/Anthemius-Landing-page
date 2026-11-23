import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALT_LOCALES, isLocale } from "@/lib/i18n";
import RootShell, { pageMetadata } from "../RootShell";

/* Root layout for the localised pages (/en-in, /nl, /fr, /es, /fi): <html lang> matches the page. */
export const dynamicParams = false;

export function generateStaticParams() {
  return ALT_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ lang: string }> }>): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? pageMetadata(lang) : {};
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "en") notFound();
  return <RootShell lang={lang}>{children}</RootShell>;
}
