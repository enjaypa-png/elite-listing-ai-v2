import Link from 'next/link'

export default function HomePage() {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Inter', sans-serif", backgroundColor: '#0f1419', color: '#f8f9fa' }}>
        <style jsx>{`
          .container {
            width: 100%;
            margin-left: auto;
            margin-right: auto;
            padding-left: 1rem;
            padding-right: 1rem;
          }
          @media (min-width: 640px) {
            .container {
              padding-left: 1.5rem;
              padding-right: 1.5rem;
            }
          }
          @media (min-width: 1024px) {
            .container {
              max-width: 1280px;
              padding-left: 2rem;
              padding-right: 2rem;
            }
          }
          header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1.25rem 0;
          }
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo {
            height: 2.5rem;
            width: auto;
          }
          .header-buttons {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          @media (max-width: 640px) {
            .header-buttons {
              gap: 0.5rem;
            }
          }
          .btn-ghost {
            background: transparent;
            border: none;
            color: #f8f9fa;
            padding: 0.625rem 1.25rem;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .btn-ghost:hover {
            background-color: rgba(255, 255, 255, 0.05);
          }
          .hero {
            text-align: center;
            padding: 5rem 0;
            max-width: 56rem;
            margin-left: auto;
            margin-right: auto;
          }
          @media (max-width: 768px) {
            .hero {
              padding: 3rem 0;
            }
          }
          h1 {
            font-size: 3.5rem;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 1.5rem;
          }
          @media (max-width: 768px) {
            h1 {
              font-size: 2.25rem;
            }
          }
          .hero-highlight {
            color: #00B3FF;
          }
          .hero-description {
            font-size: 1.125rem;
            color: #a6acb5;
            margin-bottom: 2rem;
            max-width: 42rem;
            margin-left: auto;
            margin-right: auto;
          }
          .hero-buttons {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          @media (max-width: 640px) {
            .hero-buttons {
              flex-direction: column;
              width: 100%;
            }
          }
          .btn-primary {
            background-color: #00B3FF;
            color: #1a1a2e;
            border: none;
            padding: 0.875rem 2rem;
            border-radius: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
          }
          .btn-primary:hover {
            background-color: #0095d9;
            transform: translateY(-2px);
          }
          .btn-outline {
            background: transparent;
            color: #f8f9fa;
            border: 2px solid rgba(255, 255, 255, 0.1);
            padding: 0.875rem 2rem;
            border-radius: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
          }
          .btn-outline:hover {
            border-color: #00B3FF;
            color: #00B3FF;
          }
          .hero-note {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: #a6acb5;
            font-size: 0.875rem;
          }
          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 4rem 0;
          }
          .feature-card {
            background-color: #1a2332;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            padding: 2rem;
            transition: all 0.3s ease;
          }
          .feature-card:hover {
            border-color: #00B3FF;
            transform: translateY(-4px);
          }
          .feature-icon {
            width: 3rem;
            height: 3rem;
            color: #00B3FF;
            margin-bottom: 1.5rem;
          }
          .feature-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
          }
          .feature-description {
            color: #a6acb5;
            line-height: 1.6;
            font-size: 0.95rem;
          }
          .social-proof {
            text-align: center;
            padding: 4rem 0;
            max-width: 56rem;
            margin-left: auto;
            margin-right: auto;
          }
          .social-proof-title {
            color: #a6acb5;
            font-size: 0.95rem;
            margin-bottom: 2.5rem;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 3rem;
          }
          .stat-number {
            font-size: 2.25rem;
            font-weight: 700;
            color: #00B3FF;
            margin-bottom: 0.5rem;
          }
          .stat-label {
            color: #a6acb5;
            font-size: 0.875rem;
          }
          footer {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding: 2.5rem 0;
            text-align: center;
            color: #a6acb5;
            font-size: 0.875rem;
          }
        `}</style>

        <header>
          <div className="container">
            <div className="header-content">
              <div>
                <svg viewBox="0 0 100 100" style={{ width: '2.5rem', height: '2.5rem' }}>
                  <path d="M20 80 L50 20 L80 80 M35 60 L65 60" stroke="#00B3FF" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="header-buttons">
                <Link href="/auth/signup">
                  <button className="btn-ghost">Sign Up</button>
                </Link>
                <Link href="/auth/signin">
                  <button className="btn-ghost">Sign In</button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container">
          <div className="hero">
            <h1>
              Optimize Your Etsy Listings <span className="hero-highlight">with AI</span>
            </h1>
            <p className="hero-description">
              Generate high-converting titles, descriptions, and tags in seconds. Powered by GPT-4 and trained on successful Etsy listings.
            </p>
            <div className="hero-buttons">
              <Link href="/auth/signup">
                <button className="btn-primary">Start Free Trial</button>
              </Link>
              <Link href="/auth/signin">
                <button className="btn-outline">Sign In</button>
              </Link>
            </div>
            <div className="hero-note">
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="#00B3FF" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              <span>Get 10 free credits when you sign up. No credit card required.</span>
            </div>
          </div>

          <div className="features">
            <div className="feature-card">
              <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 className="feature-title">AI-Powered Titles</h3>
              <p className="feature-description">
                Generate optimized title variants that rank higher in Etsy search and convert better.
              </p>
            </div>

            <div className="feature-card">
              <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              <h3 className="feature-title">Smart Tags</h3>
              <p className="feature-description">
                Get all 13 Etsy tags optimized for search volume, relevance, and competition.
              </p>
            </div>

            <div className="feature-card">
              <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <h3 className="feature-title">SEO Analysis</h3>
              <p className="feature-description">
                Get detailed SEO scores and actionable recommendations to improve your rankings.
              </p>
            </div>
          </div>

          <div className="social-proof">
            <p className="social-proof-title">Trusted by Etsy sellers worldwide</p>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">10k+</div>
                <div className="stat-label">Listings Optimized</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Satisfaction Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.9/5</div>
                <div className="stat-label">Average Rating</div>
              </div>
            </div>
          </div>
        </main>

        <footer>
          <div className="container">
            <p>©2024 Elite Listing AI</p>
            <p style={{ marginTop: '0.25rem' }}>All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
