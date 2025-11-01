import Button from '@/components/Button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F14] to-[#111722]">
      {/* Header */}
      <header className="border-b border-[#243041]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M20 80 L50 20 L80 80 M35 60 L65 60" stroke="#00B3FF" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-[#F2F6FA] font-bold text-xl">Elite</div>
              <div className="text-[#F2F6FA] font-bold text-xl -mt-1">Listing ai</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" href="/auth/signin">Sign In</Button>
            <Button variant="primary" href="/auth/signup">Sign Up</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 text-center py-24">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#F2F6FA]">
          Optimize Your Etsy Listings <span className="text-[#16E0FF]">with AI</span>
        </h1>
        <p className="text-lg text-[#A9B4C2] mt-4 max-w-2xl mx-auto">
          Generate high-converting titles, descriptions, and tags in seconds. 
          Powered by GPT-4 and trained on successful Etsy listings.
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="primary" href="/auth/signup">Start Free Trial</Button>
          <Button variant="secondary" href="/auth/signin">Sign In</Button>
        </div>
        
        <p className="text-sm text-[#A9B4C2] mt-6 flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-[#00B3FF]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
          </svg>
          Get 10 free credits when you sign up. No credit card required.
        </p>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-[#111722] border border-[#243041] rounded-2xl p-8 hover:border-[#00B3FF] transition-all duration-300">
            <div className="w-12 h-12 bg-[#00B3FF]/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#00B3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#F2F6FA]">AI-Powered Titles</h3>
            <p className="text-[#A9B4C2]">
              Generate optimized title variants that rank higher in Etsy search and convert better.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111722] border border-[#243041] rounded-2xl p-8 hover:border-[#00B3FF] transition-all duration-300">
            <div className="w-12 h-12 bg-[#00B3FF]/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#00B3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#F2F6FA]">Smart Tags</h3>
            <p className="text-[#A9B4C2]">
              Get all 13 Etsy tags optimized for search volume, relevance, and competition.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111722] border border-[#243041] rounded-2xl p-8 hover:border-[#00B3FF] transition-all duration-300">
            <div className="w-12 h-12 bg-[#00B3FF]/10 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#00B3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#F2F6FA]">SEO Analysis</h3>
            <p className="text-[#A9B4C2]">
              Get detailed SEO scores and actionable recommendations to improve your rankings.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="text-[#A9B4C2] text-sm mb-8">Trusted by Etsy sellers worldwide</p>
        <div className="grid grid-cols-3 gap-12">
          <div>
            <div className="text-4xl font-bold text-[#16E0FF]">10k+</div>
            <div className="text-sm text-[#A9B4C2] mt-2">Listings Optimized</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#16E0FF]">95%</div>
            <div className="text-sm text-[#A9B4C2] mt-2">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#16E0FF]">4.9/5</div>
            <div className="text-sm text-[#A9B4C2] mt-2">Average Rating</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-transparent text-[#A9B4C2] py-10 text-center text-sm border-t border-[#243041]">
        <p>©2024 Elite Listing AI</p>
        <p className="mt-1">All rights reserved.</p>
      </footer>
    </div>
  )
}
