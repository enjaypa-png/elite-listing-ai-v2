'use client';

import React, { useState } from 'react';
import tokens from '@/design-system/tokens.json';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Info Icon */}
      <span
        style={{
          width: tokens.spacing[6],
          height: tokens.spacing[6],
          borderRadius: tokens.radius.full,
          background: tokens.colors.primary,
          color: tokens.colors.primaryForeground,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.bold,
          cursor: 'help'
        }}
      >
        ℹ
      </span>

      {/* Tooltip */}
      {isHovered && (
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: tokens.spacing[2],
            padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
            background: tokens.colors.surface2,
            color: tokens.colors.textMuted,
            fontSize: tokens.typography.fontSize.sm,
            borderRadius: tokens.radius.md,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 1000,
            border: `1px solid ${tokens.colors.border}`
          }}
        >
          {text}
          {/* Tooltip Arrow */}
          <span
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: `${tokens.spacing[2]} solid transparent`,
              borderRight: `${tokens.spacing[2]} solid transparent`,
              borderTop: `${tokens.spacing[2]} solid ${tokens.colors.surface2}`
            }}
          />
        </span>
      )}
    </span>
  );
}
