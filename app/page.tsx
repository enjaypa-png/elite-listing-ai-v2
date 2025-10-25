import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center max-w-4xl px-4">
        <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
          Elite Listing AI
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Optimize your Etsy listings with AI-powered image analysis and smart recommendations
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/test"
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            API Test Page
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-3xl mb-3">📸</div>
            <h3 className="text-lg font-semibold text-white mb-2">Image Analysis</h3>
            <p className="text-gray-400 text-sm">
              AI-powered photo scoring and improvement suggestions
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Text Optimization</h3>
            <p className="text-gray-400 text-sm">
              Generate optimized titles, descriptions, and tags
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">SEO Insights</h3>
            <p className="text-gray-400 text-sm">
              Data-driven recommendations to boost visibility
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

