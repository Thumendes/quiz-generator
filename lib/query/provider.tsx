"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./client";

interface QueryClientWrapperProps {
  children: React.ReactNode;
}

export function QueryClientWrapper({ children }: QueryClientWrapperProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
