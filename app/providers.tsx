"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider 
        {...themeProps}
        defaultTheme="modern-dark"
        attribute="class"
        enableSystem={false}
        forcedTheme="modern-dark"
      >
        <ToastProvider placement="top-right" toastProps={{ timeout: 3500, shouldShowTimeoutProgress: true }}>
          {children}
        </ToastProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
