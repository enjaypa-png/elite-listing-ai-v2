'use client'

import React from 'react'
import tokens from '@/design-system/tokens.json'

interface AlertProps {
  variant?: 'success' | 'danger' | 'warning' | 'info'
  children: React.ReactNode
  onClose?: () => void
  style?: React.CSSProperties
}

export function Alert({ variant = 'info', children, onClose, style }: AlertProps) {
  const colors = {
    success: tokens.colors.success,
    danger: tokens.colors.danger,
    warning: tokens.colors.warning,
    info: tokens.colors.primary
  }

  return (
    <div style={{
      backgroundColor: `${colors[variant]}15`,
      borderLeft: `4px solid ${colors[variant]}`,
      borderRadius: tokens.radius.md,
      padding: tokens.spacing[4],
      marginBottom: tokens.spacing[4],
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      ...style
    }}>
      <p style={{ fontSize: tokens.typography.fontSize.sm, color: colors[variant], flex: 1 }}>
        {children}
      </p>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors[variant],
            fontSize: tokens.typography.fontSize.lg,
            cursor: 'pointer',
            padding: 0,
            marginLeft: tokens.spacing[4]
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
