'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card } from '@/components/ui';
import tokens from '@/design-system/tokens.json';

export default function SavedProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    
    try {
      // Fetch from database API
      const response = await fetch('/api/optimizations');
      
      if (response.ok) {
        const data = await response.json();
        
        // Transform API data to display format
        const formattedProjects = (data.optimizations || []).map((opt: any) => ({
          id: opt.id,
          title: opt.result?.title || 'Untitled Optimization',
          thumbnail: opt.result?.photo || 'https://via.placeholder.com/200',
          score: opt.result?.score || 0,
          createdAt: formatDate(opt.createdAt),
          status: opt.status
        }));
        
        setProjects(formattedProjects);
      } else {
        // Fallback to empty state
        setProjects([]);
      }
    } catch (error) {
      console.error('Load error:', error);
      // Fallback to empty state
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #374151',
            borderTopColor: '#3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }} />
          <p style={{ fontSize: '18px', color: '#9CA3AF' }}>Loading your projects...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      paddingTop: '40px',
      paddingBottom: '80px'
    }}>
      <Container>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#F9FAFB',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                📂 My Past Optimizations
                <span
                  title="Everything you've optimized is stored here"
                  style={{
                    width: '28px',
                    height: '28px',
                    background: '#3B82F6',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    cursor: 'help'
                  }}
                >{"ℹ"}</span>
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#9CA3AF'
              }}>
                {projects.length} saved {projects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>

            <button
              onClick={() => router.push('/upload')}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                minHeight: '48px'
              }}
            >
              ✨ New Optimization
            </button>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <Card>
              <div style={{
                padding: '80px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '64px',
                  marginBottom: '16px'
                }}>
                  📂
                </div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#F9FAFB',
                  marginBottom: '12px'
                }}>
                  No saved projects yet
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#9CA3AF',
                  marginBottom: '24px'
                }}>
                  Start optimizing your first listing!
                </p>
                <button
                  onClick={() => router.push('/upload')}
                  style={{
                    padding: '12px 32px',
                    background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    minHeight: '48px'
                  }}
                >
                  Get Started
                </button>
              </div>
            </Card>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {projects.map((project) => (
                <Card key={project.id}>
                  <div 
                    style={{ 
                      padding: 0,
                      cursor: 'pointer'
                    }}
                    onClick={() => router.push(`/finish/${project.id}`)}
                  >
                    {/* Thumbnail */}
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '12px 12px 0 0'
                      }}
                    />
                    
                    {/* Content */}
                    <div style={{ padding: '20px' }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#F9FAFB',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {project.title}
                      </h3>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          color: '#9CA3AF'
                        }}>
                          {project.createdAt}
                        </span>
                        <span style={{
                          padding: '4px 12px',
                          background: '#10B981',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: 600
                        }}>
                          Score: {project.score}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/finish/${project.id}`);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          minHeight: '40px'
                        }}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
