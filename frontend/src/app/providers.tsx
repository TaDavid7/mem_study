"use client";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { registerServiceWorker } from "@/lib/registerServiceWorker";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
