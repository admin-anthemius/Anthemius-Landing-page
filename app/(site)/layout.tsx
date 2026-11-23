import RootShell, { pageMetadata } from "../RootShell";

/* Root layout for the English page at "/". */
export const metadata = pageMetadata("en");

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="en">{children}</RootShell>;
}
