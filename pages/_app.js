import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";
import { config, chains } from "../config/wagmi";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);

    // Additional delay to ensure complete hydration
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state until hydration is complete
  if (!mounted || !isHydrated) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f0f0f",
          color: "#ffffff",
          fontSize: "16px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #333",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <div style={{ fontSize: "18px", fontWeight: "500" }}>
            Initializing Supply Chain DApp...
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme({
            accentColor: "#8b5cf6",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
          appInfo={{
            appName: process.env.NEXT_PUBLIC_APP_NAME || "LinkTum Matrix",
            learnMoreUrl: "https://rainbowkit.com",
          }}
        >
          <Component {...pageProps} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
