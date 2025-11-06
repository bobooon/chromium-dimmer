/// <reference types="vite/client" />

import { Theme } from '@radix-ui/themes'
import { ThemeProvider } from 'next-themes'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Page from '../page/page.tsx'
import './root.css'

createRoot(document.body).render(
  <StrictMode>
    <ThemeProvider attribute="class">
      <Theme accentColor="blue" radius="medium" style={{ minHeight: 'unset' }}>
        <Page />
      </Theme>
    </ThemeProvider>
  </StrictMode>,
)
