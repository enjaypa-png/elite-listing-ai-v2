'use client';

import React from 'react';
import tokens from '@/design-system/tokens.json';

interface ProgressIndicatorProps {
  currentStep: number; // 1–7
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const totalSteps = 7;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[10]
      }}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isUpcoming = step > currentStep;

        return (
          <React.Fragment key={step}>
            {/* Step Circle */}
            <div
              style={{
                width: tokens.spacing[10],
                height: tokens.spacing[10],
                borderRadius: tokens.radius.full,
                background: isCompleted
                  ? tokens.colors.success
                  : isCurrent
                  ? tokens.colors.primary
                  : tokens.colors.surface2,
                color: isUpcoming ? tokens.colors.textMuted : tokens.colors.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: tokens.typography.fontWeight.bold,
                fontSize: tokens.typography.fontSize.base
              }}
            >
              {isCompleted ? '✓' : step}
            </div>

            {/* Connector Line */}
            {step < totalSteps && (
              <div
                style={{
                  width: tokens.spacing[6],
                  height: '2px',
                  background: step < currentStep ? tokens.colors.primary : tokens.colors.border
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
