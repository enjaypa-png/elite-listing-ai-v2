'use client'

import React, { createContext, useContext } from 'react'
import tokens from './tokens.json'

type Theme = typeof tokens

const ThemeContext = createContext<Theme>(tokens)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={tokens}>
      <div className="theme-root">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            font-family: ${tokens.typography.fontFamily};
            background-color: ${tokens.colors.background};
            color: ${tokens.colors.text};
            font-size: ${tokens.typography.fontSize.base};
            line-height: ${tokens.typography.lineHeight.normal};
          }
          
          .theme-root {
            min-height: 100vh;
          }
        `}</style>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
