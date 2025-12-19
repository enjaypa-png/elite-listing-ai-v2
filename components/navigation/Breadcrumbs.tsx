'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import tokens from '@/design-system/tokens.json';

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on dashboard home
  if (!pathname || pathname === '/dashboard') return null;
  
  // Parse pathname into breadcrumb segments, skip 'dashboard' if it's the first segment
  const segments = pathname.split('/').filter(Boolean);
  
  // Map segments to readable names
  const nameMap: Record<string, string> = {
    'optimize-listing': 'Optimize Listing',
    'upload': 'Photo Analysis',
    'listings': 'My Listings',
    'etsy-sync': 'Etsy Sync',
    'batch': 'Batch Optimization',
    'listing-optimizer': 'Listing Optimizer',
    'seo-audit': 'SEO Audit'
  };

  // Build breadcrumb items (skip 'dashboard' from path segments)
  const items = segments
    .filter((segment) => {
      // Skip 'dashboard', numeric IDs, and optimization IDs
      if (segment === 'dashboard') return false;
      if (/^[a-f0-9-]{20,}$/i.test(segment) || segment.startsWith('opt_')) return false;
      return true;
    })
    .map(segment => ({
      label: nameMap[segment] || segment,
      segment
    }));

  if (items.length === 0) return null;

  return (
    <div style={{
      padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
      background: tokens.colors.background,
      borderBottom: `1px solid ${tokens.colors.border}`
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        fontSize: tokens.typography.fontSize.sm,
        color: tokens.colors.textMuted
      }}>
        <Link 
          href="/dashboard"
          style={{
            color: tokens.colors.textMuted,
            textDecoration: 'none',
            transition: `color ${tokens.motion.duration.fast}`
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = tokens.colors.primary}
          onMouseLeave={(e) => e.currentTarget.style.color = tokens.colors.textMuted}
        >
          Dashboard
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={item.segment} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{ color: tokens.colors.textMuted }}>›</span>
              <span style={{ 
                color: isLast ? tokens.colors.text : tokens.colors.textMuted,
                fontWeight: isLast ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
