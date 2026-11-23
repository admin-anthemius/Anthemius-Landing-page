import { notFound } from "next/navigation";
import Landing from "@/components/Landing";
import { isLocale } from "@/lib/i18n";

export default async function LangPage({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === "en") notFound();
  return <Landing lang={lang} />;
}
