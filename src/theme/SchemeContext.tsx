import React, { createContext, useContext } from 'react';
import { light, type ColorScheme } from './index';

const SchemeContext = createContext<ColorScheme>(light);

export const SchemeProvider = ({ value, children }: { value: ColorScheme; children: React.ReactNode }) => (
  <SchemeContext.Provider value={value}>{children}</SchemeContext.Provider>
);

export const useScheme = () => useContext(SchemeContext);
