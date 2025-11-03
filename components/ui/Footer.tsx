'use client'

import React from 'react'
import tokens from '@/design-system/tokens.json'

export function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${tokens.colors.border}`,
      padding: `${tokens.spacing[10]} 0`,
      textAlign: 'center',
      color: tokens.colors.textMuted,
      fontSize: tokens.typography.fontSize.sm
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: `0 ${tokens.spacing[6]}`
      }}>
        <p>©2024 Elite Listing AI</p>
        <p style={{ marginTop: tokens.spacing[1] }}>All rights reserved.</p>
      </div>
    </footer>
  )
}
