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
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const initializedRef = useRef(false);

  const handleCredentialResponse = useCallback(
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
    [router, onError, onLoading],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || initializedRef.current) return;

    function initGIS() {
      if (!window.google || !buttonRef.current || initializedRef.current)
        return;
      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: buttonRef.current.offsetWidth,
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
    }

    if (window.google) {
      initGIS();
      return;
    }

    if (!scriptLoaded.current) {
      scriptLoaded.current = true;
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGIS;
      document.head.appendChild(script);
    }
  }, [handleCredentialResponse]);

  return { buttonRef };
}
