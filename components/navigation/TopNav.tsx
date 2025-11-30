'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button, AppLogo } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Listings', href: '/dashboard/listings' },
    { label: 'Optimization', href: '/dashboard/optimize-listing' },
    { label: 'Etsy Sync', href: '/dashboard/etsy-sync' }
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: tokens.colors.surface,
      borderBottom: `1px solid ${tokens.colors.border}`,
      padding: `${tokens.spacing[4]} 0`
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: `0 ${tokens.spacing[6]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3]
        }}>
          <AppLogo size="lg" href="/dashboard" />
          <div style={{
            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
            background: tokens.colors.primary,
            color: tokens.colors.primaryForeground,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.bold,
            borderRadius: tokens.radius.sm
          }}>
            R.A.N.K. 285™
          </div>
        </div>

        {/* Desktop Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[6]
        }}
        className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: tokens.typography.fontSize.base,
                fontWeight: tokens.typography.fontWeight.medium,
                color: isActive(link.href) ? tokens.colors.primary : tokens.colors.textMuted,
                textDecoration: 'none',
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                borderRadius: tokens.radius.md,
                background: isActive(link.href) ? `${tokens.colors.primary}1A` : 'transparent',
                transition: `all ${tokens.motion.duration.fast}`
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.href)) {
                  e.currentTarget.style.color = tokens.colors.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.href)) {
                  e.currentTarget.style.color = tokens.colors.textMuted;
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side - User Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[4]
        }}
        className="desktop-nav"
        >
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/auth/signout')}
          >
            Sign Out
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'none',
            padding: tokens.spacing[2],
            background: 'transparent',
            border: 'none',
            color: tokens.colors.text,
            fontSize: tokens.typography.fontSize['2xl'],
            cursor: 'pointer'
          }}
          className="mobile-menu-btn"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={{
          background: tokens.colors.surface2,
          borderTop: `1px solid ${tokens.colors.border}`,
          padding: tokens.spacing[4]
        }}
        className="mobile-menu"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'block',
                padding: tokens.spacing[3],
                fontSize: tokens.typography.fontSize.base,
                color: isActive(link.href) ? tokens.colors.primary : tokens.colors.text,
                textDecoration: 'none',
                borderRadius: tokens.radius.md,
                background: isActive(link.href) ? `${tokens.colors.primary}1A` : 'transparent',
                marginBottom: tokens.spacing[2]
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
