"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";

type LocaleSwitcherProps = {
  locale: string;
};

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const pathname = usePathname();

  function getLocalePath(nextLocale: string): string {
    const segments = pathname.split("/");
    const currentLocale = segments[1] as "en" | "ar" | undefined;
    if (segments.length > 1 && currentLocale && routing.locales.includes(currentLocale)) {
      segments[1] = nextLocale;
      return segments.join("/");
    }
    return `/${nextLocale}`;
  }

  return (
    <div className="flex items-center gap-2">
      {routing.locales.map((candidate) => (
        <a
          key={candidate}
          href={getLocalePath(candidate)}
          className={cn(
            "inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium transition-colors",
            candidate === locale
              ? "border-sky-700 bg-sky-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          )}
        >
          {candidate.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
