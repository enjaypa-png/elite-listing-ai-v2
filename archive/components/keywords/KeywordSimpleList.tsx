'use client';

import React from 'react';

interface Keyword {
  keyword: string;
  keywordScore: number;
  searchVolume?: number;
  competition?: string;
  ctrPotential?: number;
  conversionPotential?: number;
  algorithmFit?: string;
}

interface Props {
  keywords: Keyword[];
  selectedKeywords: string[];
  onToggleKeyword: (keyword: string) => void;
  onShowDetails: (keyword: Keyword) => void;
}

export function KeywordSimpleList({
  keywords,
  selectedKeywords,
  onToggleKeyword,
  onShowDetails,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {keywords.map((kw, index) => {
        const isSelected = selectedKeywords.includes(kw.keyword);
        
        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 16px',
              background: isSelected ? '#1E40AF' : '#1F2937',
              borderRadius: '8px',
              border: `2px solid ${isSelected ? '#3B82F6' : '#374151'}`,
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isSelected ? '#1E40AF' : '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isSelected ? '#1E40AF' : '#1F2937';
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleKeyword(kw.keyword)}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#3B82F6'
              }}
            />

            {/* Keyword Text */}
            <span style={{
              flex: 1,
              fontSize: '18px',
              color: '#F9FAFB',
              fontWeight: 500
            }}>
              {kw.keyword}
            </span>

            {/* Score */}
            <span style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: getScoreColor(kw.keywordScore),
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {kw.keywordScore}
            </span>

            {/* Details Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails(kw);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                color: '#60A5FA',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid #3B82F6',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                minHeight: '44px',
                whiteSpace: 'nowrap'
              }}
            >
              Details
            </button>
          </div>
        );
      })}
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#34D399'; // Green
  if (score >= 60) return '#FBBF24'; // Yellow
  return '#F87171'; // Red
}
