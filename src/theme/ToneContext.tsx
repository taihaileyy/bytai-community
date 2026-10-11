import React, { createContext, useContext } from 'react';
import { dark, light, type Scheme, type Tone } from './index';

const Ctx = createContext<Scheme>(light);

/** Sets light (ivory) or dark (midnight) styling for everything inside. */
export function ToneProvider({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <Ctx.Provider value={tone === 'dark' ? dark : light}>{children}</Ctx.Provider>;
}

export const useScheme = () => useContext(Ctx);
