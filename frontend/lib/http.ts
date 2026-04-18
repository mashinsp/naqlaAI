export async function fetchProxy<T>(path: string): Promise<T> {
  const response = await fetch(`/api/proxy/${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
      await fetch("/api/auth/logout", { method: "POST" });
      const firstSegment = window.location.pathname.split("/")[1];
      const locale = firstSegment === "ar" || firstSegment === "en" ? firstSegment : "en";
      window.location.replace(`/${locale}/login`);
      throw new Error("Session expired. Redirecting to login.");
    }
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}
