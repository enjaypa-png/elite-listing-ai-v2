'use client'

import React from 'react'
import tokens from '@/design-system/tokens.json'

interface CardProps {
  children: React.ReactNode
  hover?: boolean
  padding?: keyof typeof tokens.spacing
  className?: string
  onClick?: () => void
}

export function Card({ children, hover = false, padding = '8', className = '', onClick }: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: tokens.card.background,
        border: `1px solid ${isHovered && hover ? tokens.colors.primary : tokens.card.border}`,
        borderRadius: tokens.card.radius,
        padding: tokens.card.padding,
        boxShadow: isHovered && hover ? tokens.shadows.card : 'none',
        transition: `all ${tokens.motion.duration.normal}`,
        transform: isHovered && hover ? 'translateY(-4px)' : 'translateY(0)',
        cursor: onClick ? 'pointer' : 'default'
      }}
      className={className}
    >
      {children}
    </div>
  )
}
