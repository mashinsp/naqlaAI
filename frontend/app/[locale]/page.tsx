import { NaqlaLandingPage } from "@/components/landing/naqla-landing-page";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHomePage({ params }: LocalePageProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(AUTH_COOKIE)?.value);
  const normalizedLocale = locale === "ar" ? "ar" : "en";
  return <NaqlaLandingPage isAuthenticated={isAuthenticated} locale={normalizedLocale} />;
}
