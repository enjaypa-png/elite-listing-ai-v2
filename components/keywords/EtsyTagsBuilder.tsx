'use client';

import React from 'react';

interface Props {
  selectedTags: string[];
  onRemoveTag: (tag: string) => void;
  onCopyAll: () => void;
  onClearAll: () => void;
  isPremium: boolean;
}

export function EtsyTagsBuilder({
  selectedTags,
  onRemoveTag,
  onCopyAll,
  onClearAll,
  isPremium,
}: Props) {
  const totalChars = selectedTags.join(', ').length;
  const maxChars = 260;
  const isOverLimit = totalChars > maxChars;

  if (!isPremium) {
    return (
      <div style={{
        position: 'sticky',
        top: '20px',
        padding: '24px',
        background: '#1F2937',
        borderRadius: '12px',
        border: '2px solid #374151',
        textAlign: 'center'
      }}>
        <div style={{ opacity: 0.6 }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#F9FAFB',
            marginBottom: '16px'
          }}>
            🔒 Etsy Tags Builder
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#D1D5DB',
            marginBottom: '16px',
            lineHeight: 1.5
          }}>
            Upgrade to Premium to build and copy your tag list
          </p>
          <button style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #3B82F6, #10B981)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            minHeight: '48px'
          }}>
            ⚡ Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'sticky',
      top: '20px',
      padding: '24px',
      background: '#1F2937',
      borderRadius: '12px',
      border: '2px solid #3B82F6',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Header */}
      <h3 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#F9FAFB',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🏷️ Your Etsy Tags <span style={{ 
          fontSize: '16px', 
          color: '#60A5FA',
          background: 'rgba(59, 130, 246, 0.2)',
          padding: '2px 8px',
          borderRadius: '12px'
        }}>({selectedTags.length})</span>
      </h3>

      {/* Tags Display */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        minHeight: '120px',
        marginBottom: '16px',
        padding: '12px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {selectedTags.length === 0 ? (
          <p style={{
            fontSize: '14px',
            color: '#9CA3AF',
            textAlign: 'center',
            width: '100%',
            padding: '32px 0'
          }}>
            Select keywords to build your tags
          </p>
        ) : (
          selectedTags.map((tag, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: '#3B82F6',
                borderRadius: '20px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              <span>{tag}</span>
              <button
                onClick={() => onRemoveTag(tag)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0 4px',
                  fontSize: '20px',
                  lineHeight: 1,
                  fontWeight: 'bold'
                }}
                title="Remove tag"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Character Counter */}
      <div style={{
        marginBottom: '16px',
        padding: '12px',
        background: isOverLimit ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        border: `2px solid ${isOverLimit ? '#EF4444' : '#3B82F6'}`,
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#D1D5DB',
          marginBottom: '4px'
        }}>
          Characters:
        </p>
        <p style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: isOverLimit ? '#EF4444' : '#60A5FA'
        }}>
          {totalChars} / {maxChars}
        </p>
        {isOverLimit && (
          <p style={{
            fontSize: '12px',
            color: '#EF4444',
            marginTop: '4px',
            fontWeight: 600
          }}>
            ⚠️ Too long! Remove some tags.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={onCopyAll}
          disabled={selectedTags.length === 0 || isOverLimit}
          style={{
            padding: '12px 16px',
            background: selectedTags.length === 0 || isOverLimit 
              ? '#374151' 
              : 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: selectedTags.length === 0 || isOverLimit ? 'not-allowed' : 'pointer',
            minHeight: '48px',
            opacity: selectedTags.length === 0 || isOverLimit ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📋 Copy All Tags ({selectedTags.length})
        </button>

        <button
          onClick={onClearAll}
          disabled={selectedTags.length === 0}
          style={{
            padding: '10px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: selectedTags.length === 0 ? 'not-allowed' : 'pointer',
            minHeight: '44px',
            opacity: selectedTags.length === 0 ? 0.5 : 1
          }}
        >
          Clear All
        </button>
      </div>

      {/* Tip */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#D1D5DB',
        lineHeight: 1.5
      }}>
        💡 <strong style={{ color: '#60A5FA' }}>Tip:</strong> Etsy allows up to 13 tags per listing. Choose your best keywords!
      </div>
    </div>
  );
}
