"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    deferredPwaPrompt: any;
  }
}

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Capture beforeinstallprompt event globally
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        window.deferredPwaPrompt = e;
        window.dispatchEvent(new CustomEvent("pwa-installable"));
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);

      // 2. Register Service Worker and Auto-Update on new deployment
      if ("serviceWorker" in navigator) {
        let refreshing = false;

        // Auto reload when new service worker takes control
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            console.log("[PWA] New version deployed! Refreshing app automatically...");
            window.location.reload();
          }
        });

        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered:", registration.scope);

            // Listen for update finding
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New version installed! Post skip waiting message to activate immediately
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                  }
                });
              }
            });

            // Check for updates on app resume / tab visibility change
            const checkForUpdate = () => {
              try {
                registration.update();
              } catch (e) {}
            };

            document.addEventListener("visibilitychange", () => {
              if (document.visibilityState === "visible") {
                checkForUpdate();
              }
            });

            window.addEventListener("focus", checkForUpdate);

            // Check for updates every 60 seconds in the background
            const interval = setInterval(checkForUpdate, 60 * 1000);

            return () => {
              clearInterval(interval);
              window.removeEventListener("focus", checkForUpdate);
            };
          })
          .catch((err) => {
            console.error("[PWA] Service Worker registration failed:", err);
          });
      }

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, []);

  return null;
}
