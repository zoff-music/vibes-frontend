import { createContext, type ReactNode, useContext } from 'react';

const KonamiModeContext = createContext(false);

interface KonamiModeProviderProps {
  children: ReactNode;
  enabled: boolean;
}

export function KonamiModeProvider({
  children,
  enabled,
}: KonamiModeProviderProps) {
  return (
    <KonamiModeContext.Provider value={enabled}>
      {children}
    </KonamiModeContext.Provider>
  );
}

export function useKonamiMode(): boolean {
  return useContext(KonamiModeContext);
}
