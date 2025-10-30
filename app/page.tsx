import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 rounded-lg p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Elite Listing AI</span>
          </div>
          <div className="space-x-4">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Optimize Your Etsy Listings
            <span className="block text-indigo-600">with AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Generate high-converting titles, descriptions, and tags in seconds. 
            Powered by GPT-4 and trained on successful Etsy listings.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/auth/signup"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/auth/signin"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-indigo-600"
            >
              Sign In
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            🎉 Get 10 free credits when you sign up. No credit card required.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="bg-indigo-100 rounded-lg p-3 w-fit mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Titles</h3>
            <p className="text-gray-600">
              Generate 3 optimized title variants that rank higher in Etsy search and convert better.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Tags</h3>
            <p className="text-gray-600">
              Get all 13 Etsy tags optimized for search volume, relevance, and competition.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">SEO Analysis</h3>
            <p className="text-gray-600">
              Get detailed SEO scores and actionable recommendations to improve your rankings.
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-4">Trusted by Etsy sellers worldwide</p>
          <div className="flex justify-center space-x-8 text-gray-400">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">10k+</p>
              <p className="text-sm">Listings Optimized</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">95%</p>
              <p className="text-sm">Satisfaction Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">4.9/5</p>
              <p className="text-sm">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

