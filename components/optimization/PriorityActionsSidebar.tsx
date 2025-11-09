'use client';

import React from 'react';
import tokens from '@/design-system/tokens.json';
import { PriorityIssue } from '@/lib/mockListingData';

interface PriorityActionsSidebarProps {
  issues: PriorityIssue[];
}

export function PriorityActionsSidebar({ issues }: PriorityActionsSidebarProps) {
  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return '🔴';
    if (severity === 'high') return '⚠️';
    return '🟡';
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return {
      bg: `${tokens.colors.error}10`,
      border: tokens.colors.error,
      text: tokens.colors.error
    };
    if (severity === 'high') return {
      bg: `${tokens.colors.warning}10`,
      border: tokens.colors.warning,
      text: tokens.colors.warning
    };
    return {
      bg: `${tokens.colors.primary}10`,
      border: tokens.colors.primary,
      text: tokens.colors.primary
    };
  };

  const totalPoints = issues.reduce((sum, issue) => sum + issue.points, 0);

  return (
    <div style={{
      position: 'sticky',
      top: tokens.spacing[4]
    }}>
      <div style={{
        backgroundColor: tokens.colors.surface,
        borderRadius: tokens.radius.lg,
        padding: tokens.spacing[6],
        border: `1px solid ${tokens.colors.border}`
      }}>
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <h3 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.semibold,
            marginBottom: tokens.spacing[2],
            color: tokens.colors.text
          }}>
            Priority Issues
          </h3>
          <div style={{
            background: `linear-gradient(135deg, ${tokens.colors.primary}15, ${tokens.colors.success}15)`,
            borderRadius: tokens.radius.lg,
            padding: tokens.spacing[4],
            border: `2px solid ${tokens.colors.primary}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
              <span style={{ fontSize: '20px' }}>📈</span>
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.primary
              }}>
                Potential Gain
              </span>
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.primary,
              marginBottom: tokens.spacing[1]
            }}>
              +{totalPoints}
            </div>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.primary,
              fontWeight: tokens.typography.fontWeight.medium
            }}>
              points possible
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
          {issues.map((issue) => {
            const colors = getSeverityColor(issue.severity);
            return (
              <div
                key={issue.id}
                style={{
                  border: `2px solid ${colors.border}`,
                  borderRadius: tokens.radius.lg,
                  padding: tokens.spacing[4],
                  backgroundColor: colors.bg
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
                  <span style={{ fontSize: '20px', flexShrink: 0, marginTop: tokens.spacing[1] }}>
                    {getSeverityIcon(issue.severity)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1], flexWrap: 'wrap' }}>
                      <span style={{
                        padding: `${tokens.spacing[0.5]} ${tokens.spacing[2]}`,
                        backgroundColor: colors.text,
                        color: 'white',
                        borderRadius: tokens.radius.sm,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.bold,
                        textTransform: 'uppercase'
                      }}>
                        {issue.severity}
                      </span>
                      <span style={{
                        padding: `${tokens.spacing[0.5]} ${tokens.spacing[2]}`,
                        backgroundColor: 'white',
                        color: colors.text,
                        borderRadius: tokens.radius.sm,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.bold,
                        border: `1px solid ${colors.border}`
                      }}>
                        +{issue.points} pts
                      </span>
                    </div>
                    <h4 style={{
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: colors.text,
                      fontSize: tokens.typography.fontSize.sm,
                      marginBottom: tokens.spacing[1]
                    }}>
                      {issue.title}
                    </h4>
                  </div>
                </div>
                <p style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: colors.text,
                  marginLeft: tokens.spacing[8]
                }}>
                  {issue.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div style={{
          marginTop: tokens.spacing[6],
          backgroundColor: `${tokens.colors.primary}10`,
          borderRadius: tokens.radius.lg,
          padding: tokens.spacing[4],
          border: `1px solid ${tokens.colors.primary}`
        }}>
          <h4 style={{
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.primary,
            marginBottom: tokens.spacing[2],
            fontSize: tokens.typography.fontSize.sm,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2]
          }}>
            💡 Quick Tips
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[1]
          }}>
            <li style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.primary
            }}>
              • Fix critical issues first for maximum impact
            </li>
            <li style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.primary
            }}>
              • All 10 photos should be high quality
            </li>
            <li style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.primary
            }}>
              • Use all 13 tags for better discoverability
            </li>
            <li style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.primary
            }}>
              • Rich descriptions improve conversion rates
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
