"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            element: HTMLElement,
            config: Record<string, unknown>,
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface UseGoogleSignInOptions {
  onError?: (msg: string) => void;
  onLoading?: (loading: boolean) => void;
}

export function useGoogleSignIn({
  onError,
  onLoading,
}: UseGoogleSignInOptions = {}) {
  const router = useRouter();                         // hook 1
  const buttonRef = useRef<HTMLDivElement>(null);     // hook 2
  const scriptLoadedRef = useRef(false);              // hook 3
  const renderedRef = useRef(false);                  // hook 4

  const handleCredentialResponse = useCallback(       // hook 5
    async (response: { credential: string }) => {
      onLoading?.(true);
      onError?.("");

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) {
        onError?.(error.message);
        onLoading?.(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    },
    // setError/setLoading from useState are stable; router is stable too
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {                                   // hook 6
    if (!GOOGLE_CLIENT_ID) return;

    function initAndRender() {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        ux_mode: "popup",
      });

      if (!renderedRef.current) {
        renderedRef.current = true;
        const width = buttonRef.current.offsetWidth || 400;
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width,
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
      }
    }

    if (window.google?.accounts?.id) {
      initAndRender();
      return;
    }

    if (scriptLoadedRef.current) {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initAndRender();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    scriptLoadedRef.current = true;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initAndRender;
    document.head.appendChild(script);
  // handleCredentialResponse is stable (empty deps), so this effect runs once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { buttonRef };
}
