import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

interface WorkspaceUiContextValue {
  activeContentId: number | null;
  setActiveContentId: (id: number | null) => void;
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

const WorkspaceUiContext = createContext<WorkspaceUiContextValue | null>(null);

export function WorkspaceUiProvider({ children }: PropsWithChildren) {
  const [activeContentId, setActiveContentId] = useState<number | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const value = useMemo(
    () => ({
      activeContentId,
      setActiveContentId,
      isCommandPaletteOpen,
      openCommandPalette: () => setIsCommandPaletteOpen(true),
      closeCommandPalette: () => setIsCommandPaletteOpen(false)
    }),
    [activeContentId, isCommandPaletteOpen]
  );

  return <WorkspaceUiContext.Provider value={value}>{children}</WorkspaceUiContext.Provider>;
}

export function useWorkspaceUi() {
  const context = useContext(WorkspaceUiContext);
  if (!context) {
    throw new Error("useWorkspaceUi must be used within a WorkspaceUiProvider");
  }

  return context;
}
