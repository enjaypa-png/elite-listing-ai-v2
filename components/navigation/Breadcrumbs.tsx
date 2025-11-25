'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import tokens from '@/design-system/tokens.json';

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Parse pathname into breadcrumb segments
  const segments = pathname?.split('/').filter(Boolean) || [];
  
  // Map segments to readable names
  const nameMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'photo-analysis': 'Photo Analysis',
    'keywords': 'Keywords',
    'seo-audit': 'SEO Audit',
    'listings': 'My Listings',
    'etsy-sync': 'Etsy Sync',
    'batch': 'Batch Optimization',
    'upload': 'Upload',
    'photo-checkup': 'Photo Checkup',
    'photo-improve': 'Photo Improve',
    'title-description': 'Title & Description',
    'finish': 'Finish'
  };

  if (segments.length === 0) return null;

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
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = '/' + segments.slice(0, index + 1).join('/');
          const name = nameMap[segment] || segment;
          
          // Skip numeric IDs
          if (/^[a-f0-9-]{20,}$/i.test(segment) || segment.startsWith('opt_')) {
            return null;
          }

          return (
            <div key={segment} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={{ color: tokens.colors.textMuted }}>›</span>
              {isLast ? (
                <span style={{ color: tokens.colors.text, fontWeight: tokens.typography.fontWeight.medium }}>
                  {name}
                </span>
              ) : (
                <Link
                  href={href}
                  style={{
                    color: tokens.colors.textMuted,
                    textDecoration: 'none',
                    transition: `color ${tokens.motion.duration.fast}`
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = tokens.colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = tokens.colors.textMuted}
                >
                  {name}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
