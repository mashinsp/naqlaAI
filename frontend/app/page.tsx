import { NaqlaLandingPage } from "@/components/landing/naqla-landing-page";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/constants";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(AUTH_COOKIE)?.value);
  return <NaqlaLandingPage isAuthenticated={isAuthenticated} locale="en" />;
}
