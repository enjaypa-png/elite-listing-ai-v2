'use client';

import React from 'react';
import tokens from '@/design-system/tokens.json';

interface StepLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function StepLayout({ header, children, footer }: StepLayoutProps) {
  return (
    <div
      className="page-wrapper"
      style={{
        minHeight: '100vh',
        background: tokens.colors.background,
        paddingTop: tokens.spacing[10],
        paddingBottom: tokens.spacing[10]
      }}
    >
      <div
        className="step-header"
        style={{
          textAlign: 'center',
          marginBottom: tokens.spacing[10],
          paddingLeft: tokens.spacing[4],
          paddingRight: tokens.spacing[4]
        }}
      >
        {header}
      </div>

      <div
        className="step-content"
        style={{
          paddingLeft: tokens.spacing[4],
          paddingRight: tokens.spacing[4]
        }}
      >
        {children}
      </div>

      {footer && (
        <div
          className="step-footer"
          style={{
            marginTop: tokens.spacing[10],
            paddingLeft: tokens.spacing[4],
            paddingRight: tokens.spacing[4],
            display: 'flex',
            justifyContent: 'center',
            gap: tokens.spacing[4]
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
