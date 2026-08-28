import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

export type NativePresentationMode = 'default' | 'terminal';

const NativePresentationContext =
  createContext<NativePresentationMode>('default');

interface NativePresentationProviderProps extends PropsWithChildren {
  mode: NativePresentationMode;
}

export function NativePresentationProvider({
  children,
  mode,
}: NativePresentationProviderProps) {
  return (
    <NativePresentationContext.Provider value={mode}>
      {children}
    </NativePresentationContext.Provider>
  );
}

export function useNativePresentation() {
  return useContext(NativePresentationContext);
}
