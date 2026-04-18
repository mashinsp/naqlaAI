"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  locale: string;
};

export function LogoutButton({ locale }: LogoutButtonProps) {
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace(`/${locale}/login`);
  }

  return (
    <Button variant="outline" size="sm" onClick={onLogout}>
      Logout
    </Button>
  );
}
