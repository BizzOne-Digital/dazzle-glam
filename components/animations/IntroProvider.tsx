"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const SESSION_KEY = "dazzle-glam-intro-seen";

type IntroContextValue = {
  showIntro: boolean;
  introReady: boolean;
  dismissIntro: () => void;
};

const IntroContext = createContext<IntroContextValue>({
  showIntro: false,
  introReady: false,
  dismissIntro: () => {},
});

export function useIntro() {
  return useContext(IntroContext);
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introReady, setIntroReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }

    if (seen || mq.matches) {
      setShowIntro(false);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
    } else {
      setShowIntro(true);
    }
    setIntroReady(true);
  }, []);

  const dismissIntro = useCallback(() => {
    setShowIntro(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!introReady) return;
    if (showIntro) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showIntro, introReady]);

  const value = useMemo(
    () => ({ showIntro, introReady, dismissIntro }),
    [showIntro, introReady, dismissIntro]
  );

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}
