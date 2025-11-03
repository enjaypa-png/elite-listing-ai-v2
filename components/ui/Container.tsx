'use client'

import React from 'react'
import tokens from '@/design-system/tokens.json'

interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

export function Container({ children, size = 'lg', className = '' }: ContainerProps) {
  const maxWidths = {
    sm: '640px',
    md: '896px',
    lg: '1280px',
    full: '100%'
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: maxWidths[size],
        margin: '0 auto',
        padding: `0 ${tokens.spacing[6]}`
      }}
      className={className}
    >
      {children}
    </div>
  )
}
