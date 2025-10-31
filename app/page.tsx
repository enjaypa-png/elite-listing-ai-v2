'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <nav className="flex justify-between items-center mb-16">
          <Logo variant="full" size="md" href="/" />
          <div className="space-x-4">
            <Link 
              href="/auth/signin" 
              className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-[var(--primary)] hover:bg-[var(--primary-700)] text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6" style={{ color: 'var(--text)' }}>
            Optimize Your Etsy Listings
            <span className="block" style={{ color: 'var(--accent)' }}>with AI</span>
          </h1>
          <p className="text-xl mb-8" style={{ color: 'var(--muted)' }}>
            Generate high-converting titles, descriptions, and tags in seconds. 
            Powered by GPT-4 and trained on successful Etsy listings.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/auth/signup"
              className="bg-[var(--primary)] hover:bg-[var(--primary-700)] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/auth/signin"
              className="bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--primary)] px-8 py-4 rounded-lg text-lg font-semibold transition-colors border-2" 
              style={{ borderColor: 'var(--primary)' }}
            >
              Sign In
            </Link>
          </div>
          <p className="text-sm mt-4" style={{ color: 'var(--muted)' }}>
            🎉 Get 10 free credits when you sign up. No credit card required.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div 
            className="rounded-xl p-6 shadow-lg border" 
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="bg-[var(--primary)] bg-opacity-20 rounded-lg p-3 w-fit mb-4">
              <svg className="w-8 h-8" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>AI-Powered Titles</h3>
            <p style={{ color: 'var(--muted)' }}>
              Generate 3 optimized title variants that rank higher in Etsy search and convert better.
            </p>
          </div>

          <div 
            className="rounded-xl p-6 shadow-lg border" 
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="bg-[var(--success)] bg-opacity-20 rounded-lg p-3 w-fit mb-4">
              <svg className="w-8 h-8" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Smart Tags</h3>
            <p style={{ color: 'var(--muted)' }}>
              Get all 13 Etsy tags optimized for search volume, relevance, and competition.
            </p>
          </div>

          <div 
            className="rounded-xl p-6 shadow-lg border" 
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="bg-[var(--accent)] bg-opacity-20 rounded-lg p-3 w-fit mb-4">
              <svg className="w-8 h-8" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>SEO Analysis</h3>
            <p style={{ color: 'var(--muted)' }}>
              Get detailed SEO scores and actionable recommendations to improve your rankings.
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>Trusted by Etsy sellers worldwide</p>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>10k+</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Listings Optimized</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>95%</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Satisfaction Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>4.9/5</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Average Rating</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo variant="full" size="sm" />
            <p className="text-sm mt-4 md:mt-0" style={{ color: 'var(--muted)' }}>
              © 2025 Elite Listing AI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
