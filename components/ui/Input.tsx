'use client'

import React from 'react'
import tokens from '../design-system/tokens.json'

interface InputProps {
  id: string
  name: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  label?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export function Input({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  className = ''
}: InputProps) {
  const [isFocused, setIsFocused] = React.useState(false)

  return (
    <div style={{ marginBottom: tokens.spacing[4] }} className={className}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.text,
            marginBottom: tokens.spacing[2]
          }}
        >
          {label} {required && <span style={{ color: tokens.colors.danger }}>*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          padding: tokens.spacing[3],
          backgroundColor: tokens.colors.background,
          border: `1px solid ${error ? tokens.colors.danger : (isFocused ? tokens.colors.primary : tokens.colors.border)}`,
          borderRadius: tokens.radius.md,
          color: tokens.colors.text,
          fontSize: tokens.typography.fontSize.sm,
          outline: 'none',
          transition: `all ${tokens.motion.duration.fast}`,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text'
        }}
      />
      {error && (
        <p style={{
          marginTop: tokens.spacing[1],
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.danger
        }}>
          {error}
        </p>
      )}
    </div>
  )
}
