import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AccessibilitySettings {
  darkMode: boolean;
  reduceColor: boolean;
  fontSize: number;
  monoFont: boolean;
  motionOff: boolean;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  toggleDarkMode: () => void;
  toggleReduceColor: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleMonoFont: () => void;
  toggleMotionOff: () => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  darkMode: false,
  reduceColor: false,
  fontSize: 1,
  monoFont: false,
  motionOff: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("inner-compass-accessibility");
    if (!saved) {
      return DEFAULT_SETTINGS;
    }

    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem("inner-compass-accessibility", JSON.stringify(settings));

    const html = document.documentElement;
    const body = document.body;

    html.style.setProperty("--font-scale", String(settings.fontSize));
    html.classList.toggle("dark", settings.darkMode);
    html.classList.toggle("reduce-color", settings.reduceColor);
    html.classList.toggle("mono-font", settings.monoFont);
    body.classList.toggle("no-motion", settings.motionOff);

    return () => {
      html.style.removeProperty("--font-scale");
      html.classList.remove("dark", "reduce-color", "mono-font");
      body.classList.remove("no-motion");
    };
  }, [settings]);

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        toggleDarkMode: () => setSettings((current) => ({ ...current, darkMode: !current.darkMode })),
        toggleReduceColor: () => setSettings((current) => ({ ...current, reduceColor: !current.reduceColor })),
        increaseFontSize: () => setSettings((current) => ({ ...current, fontSize: Math.min(1.3, current.fontSize + 0.1) })),
        decreaseFontSize: () => setSettings((current) => ({ ...current, fontSize: Math.max(0.85, current.fontSize - 0.1) })),
        toggleMonoFont: () => setSettings((current) => ({ ...current, monoFont: !current.monoFont })),
        toggleMotionOff: () => setSettings((current) => ({ ...current, motionOff: !current.motionOff })),
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}
