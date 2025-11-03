'use client'

import React from 'react'
import Link from 'next/link'
import tokens from '../design-system/tokens.json'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  type = 'button',
  children,
  className = '',
  fullWidth = false
}: ButtonProps) {
  const styles = {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: tokens.typography.fontWeight.semibold,
      borderRadius: tokens.radius.lg,
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: `all ${tokens.motion.duration.normal} ${tokens.motion.easing.easeInOut}`,
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
      textDecoration: 'none'
    },
    variant: {
      primary: {
        backgroundColor: tokens.colors.primary,
        color: tokens.colors.primaryForeground,
      },
      secondary: {
        backgroundColor: 'transparent',
        color: tokens.colors.text,
        border: `2px solid ${tokens.colors.border}`,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: tokens.colors.text,
      },
      danger: {
        backgroundColor: tokens.colors.danger,
        color: tokens.colors.text,
      }
    },
    size: {
      sm: {
        padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
        fontSize: tokens.typography.fontSize.sm,
      },
      md: {
        padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
        fontSize: tokens.typography.fontSize.base,
      },
      lg: {
        padding: `${tokens.spacing[4]} ${tokens.spacing[8]}`,
        fontSize: tokens.typography.fontSize.lg,
      }
    }
  }

  const combinedStyles = {
    ...styles.base,
    ...styles.variant[variant],
    ...styles.size[size]
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = tokens.colors.primaryHover
      e.currentTarget.style.transform = 'translateY(-2px)'
    } else if (variant === 'secondary') {
      e.currentTarget.style.borderColor = tokens.colors.primary
      e.currentTarget.style.color = tokens.colors.primary
    } else if (variant === 'ghost') {
      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = tokens.colors.primary
      e.currentTarget.style.transform = 'translateY(0)'
    } else if (variant === 'secondary') {
      e.currentTarget.style.borderColor = tokens.colors.border
      e.currentTarget.style.color = tokens.colors.text
    } else if (variant === 'ghost') {
      e.currentTarget.style.backgroundColor = 'transparent'
    }
  }

  if (href) {
    return (
      <Link
        href={href}
        style={combinedStyles}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={combinedStyles}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  )
}
