'use client';

import React from 'react';
import tokens from '@/design-system/tokens.json';

interface PhotoAnalysisGridProps {
  images: string[];
  photoAnalysis?: any;
  suggestions?: string[];
}

export function PhotoAnalysisGrid({ images, photoAnalysis, suggestions = [] }: PhotoAnalysisGridProps) {
  const totalSlots = 10;
  const emptySlots = totalSlots - images.length;
  
  return (
    <div style={{
      backgroundColor: tokens.colors.surface,
      borderRadius: tokens.radius.lg,
      padding: tokens.spacing[6],
      border: `1px solid ${tokens.colors.border}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.text
          }}>
            Product Photos
          </h3>
          <span style={{
            padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
            backgroundColor: tokens.colors.surfaceHover,
            color: tokens.colors.text,
            borderRadius: tokens.radius.sm,
            fontSize: tokens.typography.fontSize.sm,
            border: `1px solid ${tokens.colors.border}`
          }}>
            {images.length} / {totalSlots}
          </span>
        </div>
        <button style={{
          padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
          backgroundColor: tokens.colors.surface,
          color: tokens.colors.text,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.radius.md,
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.medium,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2]
        }}>
          📤 Upload Photos
        </button>
      </div>

      {/* Critical Warning */}
      {emptySlots > 0 && (
        <div style={{
          backgroundColor: `${tokens.colors.error}10`,
          border: `1px solid ${tokens.colors.error}`,
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing[4],
          marginBottom: tokens.spacing[4],
          display: 'flex',
          gap: tokens.spacing[3]
        }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>🔴</span>
          <div>
            <p style={{
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.error,
              marginBottom: tokens.spacing[1]
            }}>
              CRITICAL: Missing {emptySlots} photos
            </p>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.error
            }}>
              Listings with 10 photos get 40% more views. Add {emptySlots} more photos to gain +28 points.
            </p>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[4]
      }}>
        {/* Existing Photos */}
        {images.map((image, index) => (
          <div key={index} style={{
            position: 'relative',
            paddingBottom: '100%',
            borderRadius: tokens.radius.lg,
            overflow: 'hidden',
            border: `2px solid ${tokens.colors.border}`,
            cursor: 'pointer'
          }}>
            <img
              src={image}
              alt={`Product photo ${index + 1}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {index === 0 && (
              <span style={{
                position: 'absolute',
                top: tokens.spacing[2],
                left: tokens.spacing[2],
                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                backgroundColor: tokens.colors.primary,
                color: 'white',
                borderRadius: tokens.radius.sm,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold
              }}>
                Main
              </span>
            )}
            {photoAnalysis?.results?.[index] && (
              <span style={{
                position: 'absolute',
                bottom: tokens.spacing[2],
                right: tokens.spacing[2],
                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                borderRadius: tokens.radius.sm,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.bold
              }}>
                {photoAnalysis.results[index].overallScore}/10
              </span>
            )}
          </div>
        ))}
        
        {/* Empty Slots */}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <div key={`empty-${index}`} style={{
            position: 'relative',
            paddingBottom: '100%',
            borderRadius: tokens.radius.lg,
            border: `2px dashed ${tokens.colors.error}`,
            backgroundColor: `${tokens.colors.error}05`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: tokens.spacing[2] }}>📷</div>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.error,
                fontWeight: tokens.typography.fontWeight.medium
              }}>
                Add Photo
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Suggestions */}
      {suggestions.length > 0 && (
        <div style={{
          backgroundColor: `${tokens.colors.primary}10`,
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing[4]
        }}>
          <h4 style={{
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.primary,
            marginBottom: tokens.spacing[2],
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2]
          }}>
            📸 Suggested Photos to Add:
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[1]
          }}>
            {suggestions.map((suggestion, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.primary
              }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: `${tokens.colors.primary}20`,
                  color: tokens.colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.bold,
                  flexShrink: 0
                }}>
                  {images.length + index + 1}
                </span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
