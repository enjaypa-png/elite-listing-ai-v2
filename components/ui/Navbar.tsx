'use client'

import React from 'react'
import Link from 'next/link'
import tokens from '@/design-system/tokens.json'
import { Button } from './Button'

interface NavbarProps {
  showAuth?: boolean
}

export function Navbar({ showAuth = true }: NavbarProps) {
  return (
    <header style={{
      borderBottom: `1px solid ${tokens.colors.border}`,
      padding: `${tokens.spacing[5]} 0`
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: `0 ${tokens.spacing[6]}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Elite Listing AI" style={{ height: '2.5rem', width: 'auto' }} />
        </Link>
        {showAuth && (
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
            <Button variant="ghost" size="md" href="/auth/signup">
              Sign Up
            </Button>
            <Button variant="ghost" size="md" href="/auth/signin">
              Sign In
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
