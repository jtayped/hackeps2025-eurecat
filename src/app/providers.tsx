import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "next-themes";
import React from "react";

const RootProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TRPCReactProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </TRPCReactProvider>
  );
};

export default RootProviders;
