import { create } from "zustand";
import { persist } from "zustand/middleware";
import { themes, themeOrder } from "../data/themes";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      themeId: "terminalDark",
      setThemeId: (themeId) => {
        if (!themes[themeId]) {
          return;
        }
        set({ themeId });
      },
      cycleTheme: () => {
        const currentId = get().themeId;
        const idx = themeOrder.indexOf(currentId);
        const nextId = themeOrder[(idx + 1) % themeOrder.length];
        set({ themeId: nextId });
      },
    }),
    {
      name: "srujan-portfolio-theme",
      partialize: (state) => ({ themeId: state.themeId }),
    }
  )
);
